# BizenDAO Frontend UIコンポーネント一覧

## 概要

BizenDAO Frontendは、TypeScriptで実装されたモジュール式のUIコンポーネントで構成されています。各コンポーネントはDOM操作により動的にHTMLを生成し、ブロックチェーンとの連携を実現しています。

## コンポーネント構成図

```
┌─────────────────────────────────────────────────────────────┐
│                         main.ts                              │
│                    (ルーティング制御)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    ▼                     ▼                     ▼
┌─────────┐         ┌─────────┐         ┌─────────┐
│  home   │         │ display │         │ account │
│(ホーム) │         │(一覧表示)│         │(アカウント)│
└─────────┘         └─────────┘         └─────────┘
    │                     │                     │
    └─────────────────────┼─────────────────────┘
                          ▼
                    ┌─────────┐
                    │ common  │
                    │(共通部品)│
                    └─────────┘
```

## 主要コンポーネント

### 1. home.ts - ホーム画面

**概要**: トップページのメインコンポーネント。新着NFTとギャラリーをカルーセル形式で表示。

**主要メソッド**:
```typescript
// ホーム画面の基本構造を生成
async getHome(): Promise<HTMLElement>

// ホームコンテンツ（マークダウン記事）を表示
async getHomeContents(): Promise<void>

// 新着アイテムのカルーセル表示
async getItems(): Promise<HTMLElement>

// ギャラリーのカルーセル表示
async getGallarys(): Promise<HTMLElement>
```

**生成されるHTML構造**:
```html
<div class="homeArea">
  <div class="mainContents">
    <!-- マークダウンコンテンツ -->
  </div>
  <div class="itemsCarouselArea">
    <h3>New Items</h3>
    <div class="carouselContainer">
      <!-- NFTカード群 -->
    </div>
  </div>
  <div class="gallarysCarouselArea">
    <h3>Gallarys</h3>
    <div class="carouselContainer">
      <!-- ギャラリーカード群 -->
    </div>
  </div>
</div>
```

### 2. display.ts - 表示管理

**概要**: NFTの一覧表示、詳細表示、各種操作を管理する最も機能豊富なコンポーネント。

**主要メソッド**:
```typescript
// NFT一覧表示
displayTokens(parentElement: HTMLElement, ca: string, mine: boolean): Promise<void>

// NFT詳細表示
displayToken(
  parentElement: HTMLElement,
  ca: string,
  id: string,
  tokenBoundAccount: string,
  tbaOwner: string
): Promise<void>

// ミントフォーム表示
displayMintUI(parentElement: HTMLElement, params: any): Promise<void>

// 所有NFT表示
displayOwns(parentElement: HTMLElement, result: any, eoa: string): Promise<void>

// アセット表示
displayAssets(result: any, filter: Function): Promise<void>

// 管理データ表示（クリエイター、管理者など）
displayManagedData(managedType: string, title: string, filter: any): Promise<void>
```

**特徴的な機能**:
- フィルタリング（NFT/SBT）
- ページネーション
- ソート機能
- TBA連携
- 寄付統合

### 3. detailDisplay.ts - 詳細表示

**概要**: NFTの詳細情報と操作フォーム（送信、バーン、ミント）を管理。

**主要メソッド**:
```typescript
// NFT詳細情報表示
showToken(
  divElement: HTMLElement,
  ca: string,
  id: string,
  checkBalance: any,
  usertype: string,
  discordUser: any,
  tokenBoundAccount: string,
  tbaOwner: string
): Promise<void>

// 送信フォーム表示
showSendForm(
  parentElm: HTMLElement,
  ca: string,
  id: string,
  checkBalance: any,
  sbtFlag: boolean
): void

// バーンフォーム表示
showBurnForm(
  parentElm: HTMLElement,
  ca: string,
  id: string,
  checkBalance: any
): void

// ミントフォーム表示（管理者/クリエイター用）
showMintForm(
  divElement: HTMLElement,
  params: any,
  checkBalance: any,
  usertype: string
): Promise<void>
```

**生成される要素**:
- NFTメタデータ表示（画像、名前、説明）
- 所有者情報
- TBA情報
- 操作ボタン（送信、バーン）
- トランザクション履歴

### 4. account.ts - アカウント管理

**概要**: ユーザーアカウント情報の表示と管理。

**主要メソッド**:
```typescript
// アカウント情報表示
showAccount(
  eoa: string,
  tbaOwner: string,
  divElement: HTMLElement
): Promise<void>
```

**表示内容**:
- EOAアドレス
- ENS名（対応予定）
- Discord連携状態
- TBA所有者情報
- POL残高

### 5. common.ts - 共通コンポーネント

**概要**: 再利用可能なUI部品の集合。

**主要関数**:
```typescript
// リンク生成
link(text: string, link: string, option?: string): HTMLElement

// コピー機能付きリンク
linkCopy(link: string, message?: string): HTMLElement

// EOAアドレス表示（短縮形）
eoa(eoa: string, option?: string, labelType?: string): HTMLElement

// Polygonscanリンク
scan(eoa: string, label?: string, labelClass?: string): HTMLElement

// アイコン付きラベル
labeledElm(type: string, text: string, icon?: string): HTMLElement

// Discordユーザー表示
dispDiscordUser(discordUser: any): HTMLElement

// TBAオーナー表示
dispTbaOwner(tbaInfo: any): HTMLElement
```

**使用例**:
```typescript
// アドレスを短縮表示
const addressElm = cSnip.eoa("0x1234...abcd", "address");

// コピー機能付きリンク
const copyLink = cSnip.linkCopy("https://example.com", "URLをコピー");
```

### 6. rpcModal.ts - RPC通信モーダル

**概要**: ブロックチェーン通信中の進捗表示。

**主要関数**:
```typescript
// モーダル表示（0.3秒遅延）
showRPCModal(
  method: string,
  params?: any,
  contractAddress?: string,
  functionName?: string
): void

// モーダル非表示
hideRPCModal(): void
```

**モーダル構造**:
```html
<div class="rpc-modal-overlay">
  <div class="rpc-modal">
    <div class="rpc-modal-content">
      <div class="spinner"></div>
      <h3>Processing RPC Call</h3>
      <div class="details">
        <!-- メソッド名、パラメータ、経過時間など -->
      </div>
    </div>
  </div>
</div>
```

### 7. setElement.ts - フォーム要素生成

**概要**: フォーム要素生成のヘルパー関数群。

**主要関数**:
```typescript
// テキスト入力フィールド
setElmTextInput(labelName: string, id: string): HTMLElement

// テキストエリア
setElmTextarea(labelName: string, id: string): HTMLElement

// セレクトボックス
setElmPulldown(labelName: string, id: string, arr: any[]): HTMLElement

// ボタン
setElmButton(text: string, fn: Function): HTMLElement

// ファイル選択
setElmFile(labelName: string, id: string): HTMLElement
```

### 8. caroucel.ts - カルーセル

**概要**: タッチ対応のカルーセルコンポーネント。

**主要関数**:
```typescript
// カルーセル生成
createCarousel(
  items: HTMLElement[],
  itemWidth: number,
  autoScroll?: boolean
): HTMLElement

// スクロール制御
initCarousel(container: HTMLElement, itemWidth: number, autoScroll: boolean): void
```

**特徴**:
- タッチスワイプ対応
- 自動スクロール
- インジケーター表示

### 9. article.ts - 記事管理

**概要**: マークダウンベースの記事表示システム。

**主要メソッド**:
```typescript
// マークダウンページ解析・表示
parseMdPage(
  mdPath: string,
  path: string,
  parentElement?: HTMLElement
): Promise<void>

// サイトマップ取得
getMdSiteMap(): void

// ディレクトリ内の記事一覧
getMdDir(dir: string): void
```

### 10. manager.ts - 管理機能

**概要**: 管理者向けの設定機能。

**主要メソッド**:
```typescript
// 2階層設定（追加/削除）
control2Set(mode: string, sub: string): void

// 3階層設定（表示切替など）
control3Set(mode: string, sub: string, ca: string): void

// 4階層設定（詳細設定）
control4Set(mode: string, sub: string, ca: string, arg1: string): void
```

## ルーティングパターン

main.tsで以下のルーティングを管理：

```typescript
// ホーム
"/" → setHome()

// NFT関連
"/tokens" → setTokenContracts()
"/tokens/{ca}" → setTokens()
"/tokens/{ca}/{id}" → setToken()
"/tokens/{ca}/mint" → mintToken()

// アカウント
"/account" → setAssets()
"/account/{eoa}" → setOwner()

// 管理
"/admins" → setAdmins()
"/creators" → setCreators()
"/setting" → adminSetting()

// その他
"/article" → setArticle()
"/donate" → setDonate()
"/regist" → discordRegist()
```

## スタイルクラス

### 共通クラス
- `.container` - メインコンテナ
- `.mainContents` - メインコンテンツエリア
- `.loading` - ローディング表示
- `.error` - エラー表示

### コンポーネント固有
- `.homeArea` - ホーム画面
- `.nftArea` - NFT表示エリア
- `.tokensList` - トークン一覧
- `.ownerArea` - 所有者情報
- `.assetArea` - アセット表示
- `.rpc-modal` - RPCモーダル

### ユーティリティ
- `.address` - アドレス表示
- `.scan` - Scanリンク
- `.copy` - コピー可能要素
- `.badge` - バッジ表示

## 依存関係

```
display.ts
├── detailDisplay.ts
├── common.ts
├── getToken.ts
├── getTbaConnect.ts
└── utils.ts

home.ts
├── caroucel.ts
├── display.ts
└── getManager.ts

account.ts
├── common.ts
├── utils.ts
└── dynamoConnect.ts
```

## 国際化対応

LANGSET関数による多言語対応：

```typescript
// 使用例
const title = LANGSET("New Items"); // 英語: "New Items", 日本語: "新着アイテム"
```

## パフォーマンス最適化

1. **遅延読み込み**: スクロール位置に応じて画像を読み込み
2. **仮想スクロール**: 大量のアイテムを効率的に表示
3. **キャッシュ活用**: RPCレスポンスをIndexedDBにキャッシュ
4. **バッチ処理**: 複数のRPC呼び出しをまとめて実行

## まとめ

BizenDAO FrontendのUIコンポーネントは、モジュール化された設計により高い再利用性と保守性を実現しています。各コンポーネントは独立して動作しながら、共通コンポーネントを通じて統一されたユーザー体験を提供します。