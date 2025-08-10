# BizenDAO Frontend デプロイメントガイド

## 概要

BizenDAO Frontendのデプロイメントプロセスについて説明します。本プロジェクトは複数の環境（local, dev, stg, prd, flow）をサポートし、それぞれ異なる設定とデプロイ先を持ちます。

## 対応環境

### 環境一覧

| 環境 | 用途 | ネットワーク | デプロイ方法 |
|------|------|------------|-------------|
| local | ローカル開発 | Polygon Mainnet | Expressサーバー起動 |
| dev | 開発環境 | Polygon Mainnet | Expressサーバー起動 |
| stg | ステージング | Private Chain (21201) | SCPデプロイ |
| prd | 本番環境 | Polygon Mainnet | SCPデプロイ |
| flow | Flow Community | Polygon Mainnet | SCPデプロイ |

### 各環境の特徴

#### local環境
- 本番設定を使用したローカルテスト環境
- `npm run local`で起動
- http://localhost でアクセス可能

#### dev環境
- 開発用設定を使用
- `npm run dev`で起動
- 開発中の機能テストに使用

#### stg環境
- プライベートブロックチェーンでのテスト環境
- 本番デプロイ前の最終確認用
- 独自のRPCエンドポイント使用

#### prd環境
- BizenDAOの本番環境
- Alchemy RPCを使用
- 実際のユーザーがアクセスする環境

#### flow環境
- Flow Community Site専用環境
- 異なるUIテーマとジャンル設定
- 別プロジェクトとして運用

## デプロイメントフロー

### 1. 事前準備

```bash
# 依存関係のインストール
npm install

# SSH設定の確認（stg/prd/flow環境の場合）
# ~/.ssh/config に以下のホストが設定されている必要があります：
# - bizendao（stg/prd用）
# - bonsoleil（flow用）
```

### 2. ビルドプロセス

すべての環境で共通のビルドプロセス：

1. **テンプレート処理**
   ```bash
   # index.html.tmplからindex.htmlを生成
   # Gitコミットハッシュをバージョンとして埋め込み
   ```

2. **環境設定の適用**
   ```bash
   # 環境別設定ファイルをconst.tsにコピー
   deploy/settings/front_${ENV}.cnf → src/module/common/const.ts
   
   # ジャンル設定をgenrelist.tsにコピー
   deploy/settings/creator_genre*.cnf → src/module/common/genrelist.ts
   ```

3. **Webpack実行**
   ```bash
   # TypeScriptをバンドル
   npx webpack
   ```

### 3. 環境別デプロイコマンド

#### ローカル環境
```bash
# ローカルで本番設定を使用
npm run local
# → http://localhost で起動
```

#### 開発環境
```bash
# 開発サーバー起動
npm run dev
# → http://localhost で起動
```

#### ステージング環境
```bash
# ビルドしてリモートサーバーにデプロイ
npm run stg
# → bizendao:web/stg にSCPでデプロイ
```

#### 本番環境
```bash
# ビルドして本番サーバーにデプロイ
npm run prd
# → bizendao:web/bizen/ にSCPでデプロイ
```

#### Flow環境
```bash
# ビルドしてFlowサーバーにデプロイ
npm run flow
# → bonsoleil:web/flow/www/ にSCPでデプロイ
```

## 設定ファイル

### 環境別設定ファイル構造

```
deploy/settings/
├── front_dev.cnf     # 開発環境設定
├── front_stg.cnf     # ステージング環境設定
├── front_prd.cnf     # 本番環境設定
├── front_flow.cnf    # Flow環境設定
├── creator_genre.cnf # 通常のジャンル設定
└── creator_genre_flow.cnf # Flow用ジャンル設定
```

### 主要な設定項目

```typescript
export const CONST = {
  HEADER_TITLE: "環境別タイトル",
  RPC_URL: "RPCエンドポイント",
  BC_NETWORK_NAME: "ネットワーク名",
  BC_NETWORK_ID: "チェーンID",
  MANAGER_CA: "マネージャーコントラクトアドレス",
  MEMBERSCARD_CA: "メンバーカードコントラクトアドレス",
  // その他の環境固有設定
};
```

## ビルド成果物

### ディレクトリ構造
```
public/
├── index.html       # メインHTML（テンプレートから生成）
├── cacheinfo.html   # キャッシュ管理画面
├── .htaccess        # Apache設定（SPA対応）
├── img/             # 画像リソース
├── css/             # スタイルシート
└── js/              # Webpackでバンドルされたファイル
    ├── bundle.js    # メインバンドル
    └── cacheinfo.bundle.js # キャッシュ管理画面用
```

## デプロイ前チェックリスト

### 1. コード確認
- [ ] 不要なconsole.logの削除（本番のみ）
- [ ] エラーハンドリングの確認
- [ ] 環境固有のハードコードがないか確認

### 2. 設定確認
- [ ] 環境別設定ファイルの内容確認
- [ ] RPCエンドポイントの動作確認
- [ ] コントラクトアドレスの正確性

### 3. テスト
- [ ] ローカル環境での動作確認
- [ ] MetaMask接続テスト
- [ ] 主要機能の動作確認

### 4. バージョン管理
- [ ] Gitコミット済み
- [ ] 適切なコミットメッセージ

## トラブルシューティング

### ビルドエラー

#### webpack実行エラー
```bash
# node_modulesをクリーンアップ
rm -rf node_modules package-lock.json
npm install
```

#### 設定ファイルのコピーエラー
```bash
# 権限を確認
ls -la deploy/settings/
# 手動でコピー
cp deploy/settings/front_dev.cnf src/module/common/const.ts
```

### デプロイエラー

#### SSH接続エラー
```bash
# SSH設定を確認
ssh bizendao "echo 'Connection OK'"
ssh bonsoleil "echo 'Connection OK'"
```

#### SCP転送エラー
```bash
# 手動でSCP実行
scp -r public/* bizendao:web/stg/
```

### サーバーエラー

#### Expressサーバー起動エラー
```bash
# ポート80の使用確認
sudo lsof -i :80
# 権限を確認（ポート80はroot権限が必要）
sudo npm run dev
```

## セキュリティ考慮事項

### 1. 認証情報の管理
- APIキーは環境変数ではなく設定ファイルで管理
- SSH接続は~/.ssh/configで管理
- 秘密鍵やパスワードをリポジトリに含めない

### 2. デプロイ時の注意
- 本番デプロイは必ずステージングでテスト後に実施
- デプロイ前にGitの状態を確認
- デプロイ後の動作確認を必ず実施

### 3. アクセス制御
- .htaccessでディレクトリリスティングを無効化
- 不要なファイルをpublicディレクトリに配置しない

## CI/CD対応（将来計画）

現在は手動デプロイのみですが、将来的なCI/CD導入時の推奨構成：

```yaml
# .github/workflows/deploy.yml の例
name: Deploy
on:
  push:
    branches:
      - main  # 本番
      - develop  # ステージング

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build:${{ env.ENVIRONMENT }}
      - run: # デプロイステップ
```

## まとめ

BizenDAO Frontendのデプロイメントは、シンプルなシェルスクリプトベースで構成されており、環境別の設定管理が明確に分離されています。各環境への手動デプロイを前提としているため、デプロイ前の確認作業が重要です。