# BizenDAO スマートコントラクト連携仕様書

## 概要
BizenDAOのフロントエンドアプリケーションは、Polygon（チェーンID: 137）上の複数のスマートコントラクトと連携して動作します。本ドキュメントでは、各コントラクトの機能、連携方法、実装詳細について説明します。

## ネットワーク設定

- **ネットワーク**: Polygon Mainnet
- **チェーンID**: 137
- **RPC URL**: https://polygon-rpc.com
- **ネイティブトークン**: POL

## 主要コントラクトアドレス

- **Manager Contract**: `0x39615ac8f231D0099114eaC3095431e210C8f654`
- **Members Card (SBT)**: `0x574e01d64205aF4B7Fe4C1A91287ABe1Afcd68CF`

## コントラクトタイプと機能

### 1. Manager Contract
管理用コントラクトで、システム全体のコントラクト情報を管理します。

**主要機能:**
- コントラクトの登録・削除・管理
- クリエイターの管理
- 管理者権限の管理

**主要メソッド:**
- `getAllContracts()`: 全コントラクト情報を取得
- `getAllCreators()`: 全クリエイター情報を取得
- `getAdmins()`: 管理者リストを取得
- `setContract()`: 新規コントラクトを登録
- `setContractInfo()`: コントラクト情報を更新
- `deleteContract()`: コントラクトを削除

### 2. NFT Contract (ERC721)
BizenDAOのNFTを管理するコントラクトです。

**主要機能:**
- NFTのミント・バーン・転送
- ロイヤリティ機能
- メタデータ管理

**主要メソッド:**
- `mint(to, metaUrl)`: NFTをミント
- `burn(tokenId)`: NFTをバーン
- `transferFrom(from, to, tokenId)`: NFTを転送
- `tokenURI(tokenId)`: メタデータURIを取得
- `balanceOf(address)`: 所有NFT数を取得
- `ownerOf(tokenId)`: NFT所有者を取得

### 3. Donate Contract
寄付とポイント管理を行うコントラクトです。

**主要機能:**
- 寄付の受付と記録
- ポイントの管理
- 寄付履歴の追跡

**主要メソッド:**
- `donate(donor, detail, gasCashback)`: 寄付を実行
- `balanceOf(address)`: ポイント残高を取得
- `totalSupply()`: 総供給量を取得
- `getDonationHistory(address)`: 寄付履歴を取得
- `usePoint(donor, amount)`: ポイントを使用

### 4. Order Contract
注文管理を行うコントラクトです。

**主要機能:**
- 注文の作成と管理
- 支払い処理
- 注文履歴の追跡

**主要メソッド:**
- `order()`: 注文を作成（payable）
- `getOrdersByEOA(address)`: アドレス別の注文を取得
- `setUrl(orderNum, url, filename)`: 注文にURLを設定
- `getOrderDetails(orderNum)`: 注文詳細を取得

### 5. TBA (Token Bound Account)
ERC-6551規格に基づくトークンバウンドアカウントの実装です。

**Registry Contract機能:**
- TBAの作成と管理
- アカウントアドレスの計算

**Account Contract機能:**
- NFTに紐づいたスマートウォレット
- 任意のトランザクション実行
- 署名検証

**主要メソッド:**
- `createAccount()`: TBAを作成
- `account()`: TBAアドレスを計算
- `executeCall()`: TBA経由でトランザクションを実行
- `owner()`: TBAの所有者（NFT所有者）を取得
- `token()`: 紐づいているNFT情報を取得

### 6. Bank Contract
自動融資機能を提供するコントラクトです。

**主要機能:**
- 自動融資の実行
- クレジット管理

**主要メソッド:**
- `autoLoan(amount)`: 自動融資を実行
- `faucetLoan(customer, amount)`: 蛇口融資を実行
- `getCredit()`: クレジット情報を取得
- `getDebit()`: デビット情報を取得

### 7. Gasless Contract
ガスレストランザクションを実現するコントラクトです。

**主要機能:**
- メタトランザクションの実行
- 署名検証

**主要メソッド:**
- `functionCall()`: ガスレス実行

## ABI管理

ABIは`src/module/connect/abi.ts`ファイルで一元管理されています。

```typescript
export const ABIS = {
  manager: [...],
  orders: [...],
  donate: [...],
  nft: [...],
  tbaRegistry: [...],
  tbaAccount: [...],
  bank: [...],
  gasless: [...]
};
```

## トークン規格の実装詳細

### ERC721 (NFT)
- 標準的なERC721実装
- 追加機能：ロイヤリティ、バーン可能フラグ、usePoint機能

### ERC1155
- `getOwn.ts`で対応
- バランス確認とURI取得に対応

### SBT (Soul Bound Token)
- Members Cardとして実装
- Discordアカウントと連携
- 譲渡不可能なトークン

## 連携パターン

### 1. 読み取り専用アクセス
```typescript
// JsonRpcProviderを使用
const provider = new ethers.JsonRpcProvider(CONST.RPC_URL);
const contract = new ethers.Contract(address, abi, provider);
```

### 2. トランザクション実行
```typescript
// BrowserProviderとSignerを使用
const browserProvider = new ethers.BrowserProvider(window.ethereum);
const signer = await browserProvider.getSigner();
const contract = new ethers.Contract(address, abi, signer);
```

### 3. TBA経由の実行
```typescript
// executeCallを使用してTBA経由でトランザクションを実行
const result = await getTbaConnect.executeCall(
  tbaAddress,      // TBAのアドレス
  targetContract,  // 実行先コントラクト
  value,          // 送金額
  calldata        // 実行データ
);
```

## セキュリティ考慮事項

1. **権限管理**: Manager Contractで管理者権限を制御
2. **TBA検証**: 循環参照を防ぐためのチェック機能
3. **署名検証**: Gaslessトランザクションでの署名検証
4. **アドレス検証**: EOA/コントラクトアドレスの判定

## エラーハンドリング

各コネクタモジュールでは以下のエラーハンドリングを実装：

1. **トランザクションキャンセル**: `txCancelMes`エラーをスロー
2. **読み取りエラー**: nullを返してキャッシュを防ぐ
3. **TBAエラー**: 深さ制限（10層まで）でループを防止

## 外部API連携

- **Discord Bot API**: `https://ehfm6q914a.execute-api.ap-northeast-1.amazonaws.com/`
  - ユーザー認証
  - SBTミント権限確認
  - EOA切断処理

## RPC最適化

`rpcWrapper.ts`により、RPCコールを最適化：
- キャッシュ戦略の実装
- エラーハンドリングの統一
- パフォーマンスモニタリング