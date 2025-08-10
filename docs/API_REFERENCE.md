# BizenDAO Frontend API/モジュール仕様書

## 概要

このドキュメントは、BizenDAO Frontendの各モジュールの詳細仕様を記載しています。各モジュールのメソッド、パラメータ、戻り値、使用例を網羅的に説明します。

## 目次

1. [共通モジュール (common/)](#共通モジュール-common)
2. [外部連携モジュール (connect/)](#外部連携モジュール-connect)
3. [UIコンポーネント (snipet/)](#uiコンポーネント-snipet)
4. [管理機能 (admin/)](#管理機能-admin)

---

## 共通モジュール (common/)

### bizenCache.ts - RPCキャッシュシステム

IndexedDBベースのキャッシュシステムで、RPC呼び出しの結果を保存し、ネットワーク負荷を軽減します。

#### クラス: BizenDAOCache

##### メソッド

###### generateCacheKey
```typescript
generateCacheKey(method: string, params: any, contractAddress?: string): string
```
- **説明**: キャッシュキーを生成
- **パラメータ**:
  - `method`: メソッド名
  - `params`: メソッドパラメータ
  - `contractAddress`: コントラクトアドレス（オプション）
- **戻り値**: 一意のキャッシュキー文字列

###### get
```typescript
async get(key: string): Promise<any | null>
```
- **説明**: キャッシュからデータを取得
- **パラメータ**: `key` - キャッシュキー
- **戻り値**: キャッシュされたデータまたはnull

###### set
```typescript
async set(key: string, value: any, ttlMs?: number | null, category: string = 'general'): Promise<void>
```
- **説明**: データをキャッシュに保存
- **パラメータ**:
  - `key`: キャッシュキー
  - `value`: 保存する値
  - `ttlMs`: TTL（ミリ秒）、nullで永続
  - `category`: カテゴリ名

###### handleTokenBurn
```typescript
async handleTokenBurn(tokenId: string, creator: string): Promise<void>
```
- **説明**: トークンバーン時の関連キャッシュ無効化
- **パラメータ**:
  - `tokenId`: バーンされたトークンID
  - `creator`: 作成者アドレス

#### キャッシュTTL設定

| カテゴリ | TTL | 対象メソッド |
|---------|-----|-------------|
| 永続 | null | name, symbol, MAX_ROYALTY_BPS |
| 長期 | 1時間 | mintFee, royaltyInfo, ROYALTY_BPS_TO_CREATOR |
| 中期 | 5分 | tokenURI, creatorTokens, 各種Count |
| 短期 | 30秒 | totalSupply, tokenOfOwnerByIndex |

---

### rpcWrapper.ts - RPC通信ラッパー

ethers.jsの通信をラップし、通信中のモーダル表示とキャッシュ機能を提供します。

#### 主要関数

##### wrapRPCCall
```typescript
async wrapRPCCall<T>(
  contractOrProvider: any,
  method: string,
  args: any[],
  options?: RPCCallOptions
): Promise<T>
```
- **説明**: RPC呼び出しをラップ
- **パラメータ**:
  - `contractOrProvider`: Contract/Providerインスタンス
  - `method`: メソッド名
  - `args`: メソッド引数
  - `options`: オプション設定
- **戻り値**: メソッドの実行結果

##### createWrappedContract
```typescript
createWrappedContract(contract: ethers.Contract): ethers.Contract
```
- **説明**: コントラクトのProxyを作成
- **特徴**: 自動的にモーダル表示とキャッシュ機能を付与

---

### router.ts - ルーティング管理

URLパスとクエリパラメータを管理します。

#### エクスポートオブジェクト: router

```typescript
export const router = {
  lang: string,        // 現在の言語 (en/ja/idn)
  langSet: string[],   // 対応言語リスト
  fullUrl: string,     // 完全なURL
  path: string,        // パス名
  host: string,        // ホスト名
  queryString: string, // クエリ文字列
  params: string[],    // パスパラメータ配列
  getParams(): string[] // パスパラメータ取得関数
}
```

#### 使用例
```typescript
// URLが "/tokens/0x123/1" の場合
router.params[0] // ""
router.params[1] // "tokens"
router.params[2] // "0x123"
router.params[3] // "1"
```

---

### utils.ts - ユーティリティ関数

#### 主要関数

##### isContract
```typescript
async isContract(address: string): Promise<boolean>
```
- **説明**: アドレスがコントラクトか判定
- **パラメータ**: `address` - チェックするアドレス
- **戻り値**: コントラクトの場合true

##### checkBalance
```typescript
async checkBalance(): Promise<{
  eoa?: string;
  balance?: string;
  provider?: ethers.Provider;
  signer?: ethers.Signer;
}>
```
- **説明**: 接続ウォレットの情報を取得
- **戻り値**: EOAアドレス、残高、Provider、Signer

##### waiToEth / ethToWai
```typescript
waiToEth(input: string | number | bigint): number
ethToWai(input: string | number): bigint
```
- **説明**: Wei⇔ETH相互変換

##### formatUnixTime
```typescript
formatUnixTime(unixTime: number | string): string
```
- **説明**: Unix時間を "YYYY年M月D日" 形式に変換

---

### lang.ts - 多言語対応

#### LANGSET関数
```typescript
LANGSET(word: string): string
```
- **説明**: 現在の言語設定に応じた文字列を返す
- **対応言語**: 英語(en)、日本語(ja)、インドネシア語(idn)

---

## 外部連携モジュール (connect/)

### discordConnect.ts - Discord連携

#### getUI
```typescript
async getUI(): Promise<void>
```
- **説明**: Discord連携UIを生成・表示
- **機能**: DiscordアカウントとEOAの紐付け

#### sendRegist
```typescript
async sendRegist(discordId: string, secret: string): Promise<any>
```
- **説明**: Discord連携登録をAPI経由で実行
- **パラメータ**:
  - `discordId`: DiscordユーザーID
  - `secret`: 認証用シークレット

---

### donateConnect.ts - 寄付機能

#### getDonate（読み取り専用）
```typescript
async getDonate(mode: string, contractAddress: string, input?: any): Promise<any>
```
- **モード**:
  - `total`: 総寄付額
  - `allTotalUsed`: 全体使用ポイント
  - `allTotalDonation`: 全体寄付総額

#### donate（書き込み）
```typescript
async donate(mode: string, contractAddress: string, input?: any): Promise<any>
```
- **モード**:
  - `donate`: 寄付実行
  - `balance`: ポイント残高
  - `usedpoints`: 使用済みポイント
  - `totaldonations`: 総寄付額
  - `getDonationHistory`: 寄付履歴

---

### getManager.ts - マネージャー情報取得

#### getManager
```typescript
async getManager(method: string): Promise<any>
```
- **メソッド**:
  - `contracts`: 登録コントラクト一覧
  - `creators`: 登録クリエイター一覧
  - `admins`: 管理者一覧

#### getCA
```typescript
async getCA(contractType: string): Promise<string>
```
- **説明**: コントラクトタイプからアドレスを取得
- **タイプ**: `donate`, `membersCard`, `collection`など

---

### getToken.ts - NFT情報取得

#### getToken
```typescript
async getToken(method: string, ca: string, id?: string): Promise<any>
```
- **メソッド一覧**:
  - `name`: コントラクト名
  - `symbol`: シンボル
  - `owner`: オーナーアドレス
  - `creator`: 作成者アドレス
  - `tokenURI`: メタデータURI
  - `ownerOf`: トークン所有者
  - `balanceOf`: 所有トークン数
  - `totalSupply`: 総供給量

#### hasTokenList
```typescript
async hasTokenList(eoa: string): Promise<TokenInfo[]>
```
- **説明**: 指定EOAが所有するトークン一覧を取得
- **戻り値**: トークン情報の配列

---

### getTbaConnect.ts - TBA管理

#### getTbaInfo
```typescript
async getTbaInfo(ca: string, id: string): Promise<string>
```
- **説明**: NFTに紐付くTBAアドレスを取得

#### createAccount
```typescript
async createAccount(ca: string, id: string): Promise<any>
```
- **説明**: 新規TBAを作成
- **要件**: NFTの所有者である必要あり

#### executeCall
```typescript
async executeCall(
  tokenBoundAccount: string,
  contractAddress: string,
  value: string,
  byteCode: string
): Promise<any>
```
- **説明**: TBA経由でトランザクションを実行

---

### setToken.ts - NFT操作

#### mint
```typescript
async mint(contractAddress: string, eoa: string, tokenUri: string): Promise<any>
```
- **説明**: 新規NFTを発行
- **パラメータ**:
  - `contractAddress`: NFTコントラクトアドレス
  - `eoa`: 発行先アドレス
  - `tokenUri`: メタデータURI

#### send
```typescript
async send(contractAddress: string, to: string, id: string): Promise<any>
```
- **説明**: NFTを転送

#### burn
```typescript
async burn(contractAddress: string, id: string): Promise<any>
```
- **説明**: NFTを焼却（キャッシュ無効化付き）

---

## UIコンポーネント (snipet/)

### common.ts - 共通UI要素

#### 主要関数

##### link
```typescript
link(text: string, link: string, option?: string): HTMLElement
```
- **説明**: リンク要素を生成

##### eoa
```typescript
eoa(eoa: string, option?: string, labelType?: string): HTMLElement
```
- **説明**: EOAアドレスを短縮表示（例: 0x123...abc）

##### scan
```typescript
scan(eoa: string, label?: string, labelClass?: string): HTMLElement
```
- **説明**: Polygonscanへのリンク付きアドレス表示

##### labeledElm
```typescript
labeledElm(type: string, text: string, icon?: string): HTMLElement
```
- **説明**: アイコン付きラベル要素を生成

---

### rpcModal.ts - RPC通信モーダル

#### showRPCModal
```typescript
showRPCModal(
  method: string,
  params?: any,
  contractAddress?: string,
  functionName?: string
): void
```
- **説明**: RPC通信中のモーダルを表示（0.3秒遅延）
- **特徴**: 通信詳細とアニメーションを表示

#### hideRPCModal
```typescript
hideRPCModal(): void
```
- **説明**: モーダルを非表示にする

---

## 管理機能 (admin/)

### settings.ts - 設定画面統合

#### getUI
```typescript
async getUI(): Promise<void>
```
- **説明**: 管理者/クリエイター向け設定画面を生成
- **機能**:
  - 管理者リスト管理
  - クリエイターリスト管理
  - コントラクト管理
  - ギャラリー設定

### modAdminList.ts - 管理者管理

#### getUI
```typescript
async getUI(parentDiv: HTMLElement): Promise<void>
```
- **説明**: 管理者リスト管理UIを生成
- **機能**:
  - 現在の管理者一覧表示
  - 管理者の追加/削除

---

## エラーハンドリング

すべてのモジュールで以下のエラーハンドリングパターンを使用：

```typescript
try {
  // 処理実行
} catch (error) {
  console.error('エラーメッセージ', error);
  // 必要に応じてユーザーへの通知
  throw error; // または適切なデフォルト値を返す
}
```

## セキュリティ考慮事項

1. **権限チェック**: 書き込み操作前に必ず権限を確認
2. **入力検証**: ユーザー入力は必ず検証
3. **キャッシュ除外**: 動的な値（残高、権限等）はキャッシュしない
4. **秘密情報**: 秘密鍵やAPIキーは絶対にフロントエンドに含めない

## 使用例

### NFTの発行から転送まで
```typescript
// 1. ウォレット接続確認
const balance = await utils.checkBalance();
if (!balance.eoa) {
  alert('ウォレットを接続してください');
  return;
}

// 2. NFT発行
const tokenUri = 'ipfs://QmXxx...';
const result = await setToken.mint(contractAddress, balance.eoa, tokenUri);

// 3. TBA作成
const tokenId = result.tokenId;
const tbaAddress = await getTbaConnect.createAccount(contractAddress, tokenId);

// 4. NFT転送
await setToken.send(contractAddress, recipientAddress, tokenId);
```

### キャッシュの利用
```typescript
// キャッシュキー生成
const key = bizenCache.generateCacheKey('tokenURI', [tokenId], contractAddress);

// キャッシュ取得
const cached = await bizenCache.get(key);
if (cached) {
  return cached;
}

// データ取得とキャッシュ保存
const data = await getToken.getToken('tokenURI', contractAddress, tokenId);
await bizenCache.set(key, data, 5 * 60 * 1000); // 5分間キャッシュ
```