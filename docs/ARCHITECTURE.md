# BizenDAO Frontend アーキテクチャ

## 概要

BizenDAO Frontendは、備前焼（日本の伝統陶芸）に特化したNFTマーケットプレイスのSingle Page Application (SPA)です。TypeScriptで開発され、Polygon Network上のスマートコントラクトと連携して動作します。

## システムアーキテクチャ

### 全体構成図

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BizenDAO Frontend                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐          │
│  │   Router    │  │   Language   │  │  RPC Wrapper   │          │
│  │  (SPA Nav)  │  │   (JP/EN)    │  │  with Cache    │          │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘          │
│         │                 │                   │                    │
│  ┌──────▼─────────────────▼─────────────────▼────────┐          │
│  │              Module Layer                           │          │
│  ├────────────────────────────────────────────────────┤          │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────┐ │          │
│  │  │ Common  │  │ Connect │  │ Snipet  │  │Admin │ │          │
│  │  └─────────┘  └─────────┘  └─────────┘  └──────┘ │          │
│  └────────────────────────────────────────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ RPC/API Calls
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        External Services                             │
├─────────────────┬───────────────┬──────────────┬───────────────────┤
│  Polygon        │   AWS Lambda  │   Discord    │   Permaweb/       │
│  Network        │   API         │   Bot API    │   Arweave         │
└─────────────────┴───────────────┴──────────────┴───────────────────┘
```

## ディレクトリ構造

### src/module/ - コアモジュール

#### 1. common/ - 共通機能
- **bizenCache.ts**: IndexedDBベースのRPCキャッシュシステム
- **const.ts**: 環境別定数（ビルド時に動的生成）
- **router.ts**: クライアントサイドルーティング
- **rpcWrapper.ts**: RPC通信の抽象化とモーダル表示
- **utils.ts**: ユーティリティ関数群
- **lang.ts**: 多言語対応（英語/日本語）

#### 2. connect/ - 外部連携
- **getToken.ts**: NFTトークン情報の取得
- **setToken.ts**: NFTの発行・転送・バーン
- **getManager.ts**: マネージャーコントラクト情報取得
- **setManager.ts**: マネージャーコントラクト設定
- **getTbaConnect.ts**: Token Bound Account (TBA) 操作
- **donateConnect.ts**: 寄付機能
- **dynamoConnect.ts**: AWS DynamoDB連携
- **discordConnect.ts**: Discord認証連携
- **memberSbtConnect.ts**: Soul Bound Token管理

#### 3. snipet/ - UIコンポーネント
- **home.ts**: ホーム画面
- **display.ts**: ギャラリー表示
- **detailDisplay.ts**: NFT詳細表示
- **account.ts**: アカウント管理
- **rpcModal.ts**: RPC通信可視化モーダル
- **common.ts**: 共通UI要素

#### 4. admin/ - 管理機能
- **settings.ts**: 管理者設定
- **modCreatorList.ts**: 作家管理
- **modItemList.ts**: 作品管理
- **modGallaryList.ts**: ギャラリー管理

## 技術スタック

### フロントエンド
- **TypeScript**: 型安全な開発
- **Webpack**: モジュールバンドラー
- **ethers.js v6**: Ethereum連携ライブラリ
- **marked**: Markdownレンダリング

### ブロックチェーン
- **Network**: Polygon (Matic) Mainnet
- **Chain ID**: 137
- **RPC Provider**: Alchemy

### 外部サービス
- **AWS Lambda**: バックエンドAPI
- **AWS DynamoDB**: ユーザーデータストレージ
- **Discord Bot**: コミュニティ連携
- **Arweave/Permaweb**: 分散ストレージ

## 主要な機能

### 1. NFTマーケットプレイス
- 備前焼作品のNFT化
- 作品の展示・販売・転送
- Soul Bound Token (SBT) サポート

### 2. Token Bound Accounts (TBA)
- NFTごとに独立したウォレット
- NFTが所有する資産の管理
- 階層的な所有権構造

### 3. RPCキャッシュシステム
- IndexedDBベースの永続キャッシュ
- ホワイトリスト方式の安全な実装
- BigInt対応
- TTL管理（永続/長期/中期/短期）

### 4. 多言語対応
- 日本語/英語の切り替え
- URLパラメータによる言語選択（?lang=en）

### 5. Discord連携
- ホルダー認証
- ロール付与
- コミュニティ機能

## セキュリティ考慮事項

### 1. 権限管理
- コントラクトレベルでの権限制御
- 管理者/作家/一般ユーザーの役割分離
- check系メソッドのキャッシュ除外

### 2. データ保護
- 環境別の秘密鍵管理
- APIキーの環境変数化
- HTTPSによる通信暗号化

### 3. スマートコントラクト連携
- 読み取り専用と書き込み操作の分離
- トランザクション署名の安全な処理
- エラーハンドリングの徹底

## パフォーマンス最適化

### 1. キャッシュ戦略
- 静的データの永続キャッシュ
- 動的データの適切なTTL設定
- キャッシュヒット率の監視

### 2. バンドルサイズ
- コード分割（検討中）
- Tree shaking
- 圧縮・最小化

### 3. ネットワーク最適化
- RPC呼び出しの最小化
- バッチ処理の活用
- 並列処理の実装

## デプロイメント

### 環境
- **local**: ローカル開発環境
- **dev**: 開発環境
- **stg**: ステージング環境
- **prd**: 本番環境
- **flow**: Flow環境（特別な設定）

### ビルドプロセス
1. 環境別設定ファイルのコピー
2. TypeScriptのコンパイル
3. Webpackによるバンドル
4. バージョン情報の埋め込み
5. サーバーへのデプロイ（SCP）

詳細は[デプロイメントガイド](./DEPLOYMENT.md)を参照してください。