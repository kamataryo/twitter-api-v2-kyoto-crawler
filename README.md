# Twitter クローラ

## 使い方

### セットアップ

1. Node.js>14 をインストール https://nodejs.org/en/
2. Yarn をインストール
   ```shell
   $ npm install yarn -g
   ```
3. 依存ライブラリをインストール
   ```shell
   $ git clone git@github.com:kamataryo/twitter-api-v2-kyoto-crawler.git
   $ cd twitter-api-v2-kyoto-crawler
   $ yarn
   ```
4. config.sample.yml を coconfig.yml としてコピー。Twitter Bearer Token を入力。

### プログラムを実行

```shell
$ node index.js
```

### プログラムの動作をコントロール

config.yml 　の `start_time` と `end_time` を任意の時点に設定してください。
プログラムの実行中は `next_token` が標準エラー出力に表示されます。
最後に表示された `next_token` を config.yml に設定すると、その中断した時からリクエストを再開します。
