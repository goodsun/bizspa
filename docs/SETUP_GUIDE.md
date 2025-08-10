# BizenDAO Frontend 開発環境セットアップガイド

## 前提条件

### 必要なソフトウェア
- **Node.js**: v18.0.0以上
- **npm**: v8.0.0以上
- **Git**: 最新版
- **MetaMask**: ブラウザ拡張機能

### 推奨開発環境
- **エディタ**: Visual Studio Code
- **ブラウザ**: Chrome または Firefox（開発者ツール使用）

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone [repository-url]
cd bizen/frontend
```

### 2. 依存関係のインストール

```bash
npm install
```

主要な依存関係：
- ethers@6.12.1 - Ethereumライブラリ
- marked@12.0.2 - Markdownパーサー
- crypto-js@4.2.0 - 暗号化ライブラリ
- express@4.19.2 - 開発サーバー

### 3. 環境設定

#### 環境別の設定ファイル

deploy/settings/ ディレクトリに環境別の設定ファイルがあります：

- `front_dev.cnf` - 開発環境
- `front_stg.cnf` - ステージング環境
- `front_prd.cnf` - 本番環境
- `front_flow.cnf` - Flow環境

各環境の主な違い：
- ヘッダータイトル
- RPC URL
- Manager/MembersCard コントラクトアドレス
- Discord設定
- APIエンドポイント

### 4. 開発サーバーの起動

```bash
# 開発環境で起動
npm run dev

# ローカル環境で起動（本番設定を使用）
npm run local
```

サーバーは http://localhost:80 で起動します。

### 5. MetaMaskの設定

1. MetaMaskをブラウザにインストール
2. Polygon Networkを追加：
   - Network Name: Polygon Mainnet
   - RPC URL: https://polygon-rpc.com
   - Chain ID: 137
   - Currency Symbol: POL
   - Block Explorer: https://polygonscan.com/

3. テスト用のウォレットを作成（本番環境では使用しないこと）

## ビルドコマンド

### 開発ビルド
```bash
npm run dev
```
- front_dev.cnfを使用
- ローカルサーバーで実行

### ステージングビルド
```bash
npm run stg
```
- front_stg.cnfを使用
- ステージングサーバーにデプロイ

### 本番ビルド
```bash
npm run prd
```
- front_prd.cnfを使用
- 本番サーバーにデプロイ

### Flowビルド
```bash
npm run flow
```
- front_flow.cnfを使用
- Flow専用サーバーにデプロイ

## プロジェクト構造の理解

### エントリーポイント
- `src/main.ts` - メインアプリケーション
- `src/cacheinfo.ts` - キャッシュ管理画面

### 重要なモジュール
- `src/module/common/router.ts` - ルーティング
- `src/module/common/const.ts` - 環境別定数（自動生成）
- `src/module/connect/` - ブロックチェーン連携
- `src/module/snipet/` - UIコンポーネント

## 開発フロー

### 1. 新機能の開発

```bash
# developブランチから作業ブランチを作成
git checkout develop
git checkout -b feature/your-feature

# 開発
npm run dev

# テスト（手動）
# ブラウザで動作確認

# コミット
git add .
git commit -m "feat: your feature description"
```

### 2. デバッグ

1. ブラウザの開発者ツールを開く（F12）
2. Consoleタブでエラーを確認
3. Networkタブで以下を確認：
   - RPC呼び出し
   - API通信
   - キャッシュの動作

### 3. キャッシュのデバッグ

```
http://localhost/cacheinfo.html
```

- キャッシュヒット率の確認
- キャッシュエントリの確認
- キャッシュのクリア

## トラブルシューティング

### よくある問題

#### 1. MetaMaskが接続できない
- ネットワークがPolygon Mainnetに設定されているか確認
- ブラウザのポップアップブロッカーを無効化

#### 2. RPC呼び出しが失敗する
- RPC URLが正しいか確認（const.ts）
- ネットワーク接続を確認
- RPCプロバイダーのレート制限を確認

#### 3. ビルドエラー
```bash
# node_modulesをクリーンアップ
rm -rf node_modules package-lock.json
npm install
```

#### 4. キャッシュの問題
- `/cacheinfo.html`でキャッシュをクリア
- ブラウザのIndexedDBを手動で削除：
  - 開発者ツール > Application > Storage > IndexedDB

### デバッグモード

コンソールログを有効にする：
- RPC呼び出し: `console.log`が各所に配置済み
- キャッシュ: "Cache hit:"メッセージを確認

## コード規約

### TypeScript
- 型定義を必ず行う
- `any`型の使用は最小限に
- エラーハンドリングを適切に実装

### 命名規則
- ファイル名: camelCase
- クラス名: PascalCase
- 関数名: camelCase
- 定数: UPPER_SNAKE_CASE

### コメント
- 日本語コメントOK（チーム内で統一）
- 複雑なロジックには必ずコメントを追加

## セキュリティ注意事項

### 開発時の注意
- 秘密鍵を絶対にコミットしない
- APIキーはconst.tsで管理（環境別）
- テストウォレットと本番ウォレットを分離

### デプロイ前チェックリスト
- [ ] console.logの削除（本番のみ）
- [ ] エラーハンドリングの確認
- [ ] 環境変数の確認
- [ ] キャッシュ設定の確認

## 参考資料

- [アーキテクチャドキュメント](./ARCHITECTURE.md)
- [API仕様書](./API_REFERENCE.md)
- [デプロイメントガイド](./DEPLOYMENT.md)
- [トラブルシューティング](./TROUBLESHOOTING.md)