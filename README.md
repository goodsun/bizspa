# bizspa
single page application for bizendao

npm init -y  # package.jsonの作成
npm install --save-dev typescript ts-loader webpack webpack-cli

# 開発環境の起動
npm install
npx webpack
node server.js

http://localhostで公開

# S3にデプロイ
aws s3 sync ./public s3://[公開した静的ページ]
※ ルータ機能を持たせたSPAにしていますので、エラーページもindex.htmlにリダイレクトされる設定にしてください。

