# BizenDAO Frontend 仕様書

## プロジェクト概要

BizenDAOは、備前焼（日本の伝統陶芸）に特化したNFTマーケットプレイスのフロントエンドアプリケーションです。クリエイター（陶芸家）が作品をNFTとして発行し、コレクターが購入・収集できるプラットフォームを提供します。

### 基本情報
- **プロジェクト名**: BizenDAO Frontend (bizspa)
- **バージョン**: 1.0.0
- **ライセンス**: ISC
- **リポジトリ**: Single Page Application for BizenDAO
- **主要機能**: NFT作品の展示・販売・管理、陶芸家支援、コミュニティ機能

## 技術スタック

### フロントエンド
- **TypeScript**: 5.4.5 (メイン開発言語)
- **Webpack**: 5.91.0 (モジュールバンドラー)
- **Express.js**: 4.19.2 (開発サーバー)
- **HTML/CSS/JavaScript**: 標準的なWeb技術

### ブロックチェーン
- **Ethers.js**: 6.12.1 (Ethereum/Polygon接続)
- **Polygon Network**: メインネットワーク (RPC: https://polygon-rpc.com)
- **Token Bound Accounts (TBA)**: NFT固有アカウント管理
- **スマートコントラクト**: Manager, Token, Donate, Order管理

### 外部サービス
- **Discord Bot**: ユーザー認証・コミュニティ管理
- **AWS DynamoDB**: ユーザーデータ・メタデータ保存
- **Arweave/Permaweb**: 分散ストレージ
- **AWS Lambda**: API Gateway (ehfm6q914a.execute-api.ap-northeast-1.amazonaws.com)

### 開発・デプロイ
- **ts-loader**: TypeScriptコンパイル
- **webpack-cli**: ビルド管理
- **Shell Script**: 環境別デプロイ自動化
- **SCP**: ステージング・本番環境へのデプロイ

## アーキテクチャ設計

### モジュール構成

#### 1. Common（共通モジュール）
- **const.ts**: システム定数・設定値
- **router.ts**: URL ルーティング・多言語対応
- **utils.ts**: ユーティリティ関数集
- **lang.ts**: 多言語サポート (英語/日本語)
- **formats.ts**: デフォルトデータ形式

#### 2. Connect（接続モジュール）
- **abi.ts**: スマートコントラクトABI定義
- **dynamoConnect.ts**: AWS DynamoDB接続
- **getTbaConnect.ts**: Token Bound Account操作
- **getManager.ts/setManager.ts**: Manager契約操作
- **getToken.ts/setToken.ts**: NFTトークン操作
- **donateConnect.ts**: 寄付システム
- **discordConnect.ts**: Discord連携
- **permaweb.ts**: Arweave連携

#### 3. Snippet（UIコンポーネント）
- **common.ts**: 共通UI要素
- **display.ts**: 表示コンポーネント
- **detailDisplay.ts**: 詳細表示
- **manager.ts**: 管理画面コンポーネント
- **home.ts**: ホーム画面
- **account.ts**: アカウント表示

#### 4. Admin（管理モジュール）
- **settings.ts**: 管理者設定
- **modAdminList.ts**: 管理者管理
- **modCreatorList.ts**: クリエイター管理
- **modContractList.ts**: コントラクト管理
- **modGallaryList.ts**: ギャラリー管理
- **modItemList.ts**: アイテム管理

#### 5. Service（サービス層）
- **manageService.ts**: ビジネスロジック

## 主要機能

### 1. ユーザー管理
- **ロールベースアクセス制御**
  - Admin: システム全体管理
  - Creator: 作品管理・NFT発行
  - User: 閲覧・購入・収集
- **Discord連携認証**
- **ウォレット接続** (MetaMask対応)
- **多言語対応** (英語/日本語)

### 2. NFT管理
- **作品NFT発行**: 陶芸作品のトークン化
- **Token Bound Accounts**: NFT固有アカウント
- **メタデータ管理**: 作品情報・画像・動画
- **コレクション管理**: 作家別・テーマ別分類
- **所有権管理**: 転送・売買履歴

### 3. マーケットプレイス
- **作品展示**: ギャラリー形式表示
- **検索・フィルタリング**: 作家・価格・カテゴリ
- **購入システム**: 暗号通貨決済
- **寄付機能**: クリエイター支援 (D-BIZ トークン)

### 4. コミュニティ
- **Discord連携**: 認証・ロール管理
- **記事システム**: Markdown記事投稿
- **ギャラリー**: 作品展示空間
- **イベント管理**: 展示会・ワークショップ

## URL構成・ルーティング

### 基本構造
```
/[lang]/[category]/[item]/[detail]
```

### 主要ルート
- **/** - ホーム画面
- **/contents** - 記事一覧
- **/contents/[dir]** - 記事カテゴリ
- **/contents/[dir]/[article]** - 記事詳細
- **/creators** - クリエイター一覧
- **/creators/[id]** - クリエイター詳細
- **/tokens** - NFTコレクション一覧
- **/tokens/[contract]** - コレクション詳細
- **/tokens/[contract]/[tokenId]** - NFT詳細
- **/tokens/[contract]/mint** - NFT発行
- **/account** - アカウント情報
- **/account/[address]** - ユーザー詳細
- **/donate** - 寄付システム
- **/admins** - 管理者画面
- **/setting** - 設定画面

### 管理者専用ルート
- **/meta** - メタデータ編集
- **/permaweb** - ファイル管理
- **/regist** - Discord登録
- **/editor** - エディター連携
- **/membersbt** - メンバーSBT発行

## 開発・デプロイ環境

### 環境構成
- **local**: ローカル開発環境
- **dev**: 開発環境
- **stg**: ステージング環境
- **prd**: 本番環境
- **flow**: Flow環境

### ビルド・デプロイプロセス
1. **設定ファイル適用**: 環境別設定ファイルをコピー
2. **バージョン管理**: Gitコミットハッシュをバージョンとして設定
3. **TypeScriptコンパイル**: Webpackによるバンドル
4. **デプロイ**: SCPによるファイル転送

### 環境別設定
- **front_dev.cnf**: 開発環境設定
- **front_stg.cnf**: ステージング環境設定
- **front_prd.cnf**: 本番環境設定
- **front_flow.cnf**: Flow環境設定

## セキュリティ

### アクセス制御
- **ロールベース認証**: Discord連携による権限管理
- **ウォレット認証**: MetaMaskによる所有権確認
- **管理者権限**: 限定的なアクセス制御

### データ保護
- **暗号化**: crypto-js使用
- **プライベートキー管理**: クライアントサイド管理
- **API認証**: Discord Bot Token認証

## パフォーマンス

### 最適化
- **Webpack最適化**: プロダクションビルド
- **静的ファイル配信**: Express.js静的ファイル配信
- **CDN活用**: 画像・動画配信最適化

### 監視
- **エラーログ**: コンソールログ出力
- **パフォーマンス監視**: ブラウザ開発者ツール
- **ネットワーク監視**: API応答時間測定

## 今後の拡張予定

### 機能拡張
- **モバイル対応強化**: レスポンシブデザイン改善
- **支払い方法追加**: 法定通貨決済対応
- **多言語対応拡張**: 他言語サポート追加
- **AIメタデータ生成**: 作品情報自動生成

### 技術改善
- **フレームワーク導入**: React/Vue.js移行検討
- **状態管理**: Redux/Vuex導入
- **テスト環境**: 自動テスト導入
- **CI/CD**: GitHub Actions導入

---

*このドキュメントは BizenDAO Frontend v1.0.0 の仕様書です。*
*最終更新: 2024年6月*