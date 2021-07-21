// ドキュメント
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-all

import axios from "axios";
import jsYaml from "js-yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createObjectCsvWriter } from "csv-writer";

const __dirname = path.resolve(fileURLToPath(import.meta.url), "..");
const configYamlPath = path.resolve(__dirname, "config.yml");
const outputFilePath = path.resolve(__dirname, "out.csv");

const configYamlText = fs.readFileSync(configYamlPath, "utf-8");
const { secrets, queries: base_queries } = jsYaml.load(configYamlText);
secrets.twitter_bearer_token ||
  (secrets.twitter_bearer_token = process.env.TWITTER_BEARER_TOKEN);
base_queries.next_token ||
  (base_queries.next_token = process.env.TWITTER_NEXT_TOKEN);

const csvHeaders = ["id", "created_at", "text", "lang"];
const csvWriter = createObjectCsvWriter({
  path: outputFilePath,
  header: csvHeaders.map((head) => ({ id: head, title: head })),
  append: !!base_queries.next_token,
});

const urlBase = `https://api.twitter.com/2/tweets/search/all`;
const buildQuery = (q = {}) => {
  const query = {
    query: "content lang:ja",
    max_results: 100,
    "tweet.fields": "lang,created_at,geo",
    ...base_queries,
    ...q,
  };
  return Object.keys(query)
    .map((key) =>
      query[key] ? `${key}=${encodeURIComponent(query[key])}` : null
    )
    .filter((x) => !!x)
    .join("&");
};

const Authorization = `Bearer ${secrets.twitter_bearer_token}`;
const headers = { Authorization };
const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

const main = async () => {
  let next_token = base_queries.next_token;
  let count = 0;
  let loop = 0;
  do {
    process.stderr.write(`[next_token #${loop + 1}] ${next_token || ""}\n`);
    const querystring = buildQuery({ next_token });
    const url = `${urlBase}?${querystring}`;
    try {
      const { data: resp } = await axios.get(url, { headers });
      const { data: tweets, meta } = resp;
      next_token = meta.next_token;
      count += tweets.length;
      loop++;
      await csvWriter.writeRecords(tweets);
    } catch (error) {
      console.log(url);
      console.log(error);
      console.log({ next_token, end_time });
      process.exit(1);
    }
    await sleep(1000);
  } while (next_token);
  process.stderr.write(`[Completed] total tweets: ${count}\n`);
};

main();
