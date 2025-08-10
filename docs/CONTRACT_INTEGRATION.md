# BizenDAO スマートコントラクト連携仕様書

## 概要

BizenDAO Frontendは、Polygon (Matic) Network上の複数のスマートコントラクトと連携して動作します。本ドキュメントでは、各コントラクトとの連携方法、実装詳細、セキュリティ考慮事項について説明します。

## コントラクトアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Manager Contract                         │
│              (全コントラクトの中央管理)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┬──────────────┐
    ▼             ▼             ▼             ▼              ▼
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
│   NFT   │ │ Donate  │ │  Order   │ │   TBA    │ │Members Card│
│(ERC721) │ │ (寄付)  │ │ (注文)   │ │(ERC6551) │ │   (SBT)    │
└─────────┘ └─────────┘ └──────────┘ └──────────┘ └────────────┘
```

## 主要コントラクト

### 1. Manager Contract

**アドレス**: `0x39615ac8f231D0099114eaC3095431e210C8f654`

**役割**: システム全体のコントラクト管理

**主要メソッド**:
```typescript
// 管理者権限チェック
checkUser(address user): string // "admin" | "creator" | "none"

// コントラクト登録管理
addContractData(address ca, string name, string type, bool open)
delContractData(address ca)
getContractList(): address[][]

// クリエイター管理
addCreator(address user, string label, string tag, bool open)
delCreator(address user)
getCreatorList(): address[][]

// 管理者管理
addAdmin(address user, string label, string tag, bool open)
delAdmin(address user)
getAdminList(): address[][]
```

### 2. NFT Contract (ERC721拡張)

**特徴**: 
- ERC721標準 + カスタム機能
- ロイヤリティ機能（ERC2981準拠）
- バーン機能
- 作者管理

**主要メソッド**:
```typescript
// 基本ERC721
name(): string
symbol(): string
tokenURI(uint256 tokenId): string
ownerOf(uint256 tokenId): address
balanceOf(address owner): uint256
totalSupply(): uint256

// カスタム機能
mint(address to, string memory uri): uint256
burn(uint256 tokenId)
creator(): address
mintFee(): uint256
royaltyInfo(uint256 tokenId, uint256 salePrice): (address, uint256)
MAX_ROYALTY_BPS(): uint256
ROYALTY_BPS_TO_CREATOR(): uint256

// トークン列挙
creatorTokens(): uint256[]
normalTokens(): uint256[]
sbtTokens(): uint256[]
tokenOfOwnerByIndex(address owner, uint256 index): uint256
```

### 3. Donate Contract

**役割**: 寄付とポイント管理システム

**主要メソッド**:
```typescript
// 寄付操作
donate(uint256 amount)
donateFor(address recipient, uint256 amount)

// ポイント管理
balance(address user): uint256
usedpoints(address user): uint256
totaldonations(address user): uint256
getDonationHistory(): [uint256, uint256, address][]

// 集計
allTotalUsed(): uint256
allTotalDonation(): uint256
```

### 4. TBA (Token Bound Account) - ERC-6551

**実装パターン**: Registry + Account

#### TBA Registry
```typescript
// アカウント作成
createAccount(
  address implementation,
  uint256 chainId,
  address tokenContract,
  uint256 tokenId,
  uint256 salt,
  bytes initData
): address

// アカウントアドレス計算
account(
  address implementation,
  uint256 chainId,
  address tokenContract,
  uint256 tokenId,
  uint256 salt
): address
```

#### TBA Account
```typescript
// トークン情報取得
token(): (uint256 chainId, address tokenContract, uint256 tokenId)
owner(): address

// トランザクション実行
executeCall(
  address to,
  uint256 value,
  bytes data
): bytes
```

### 5. Members Card (SBT)

**アドレス**: `0x574e01d64205aF4B7Fe4C1A91287ABe1Afcd68CF`

**特徴**:
- Soul Bound Token（譲渡不可）
- Discord連携必須
- ロール管理

**発行フロー**:
1. Discordアカウント連携
2. APIによる検証
3. SBT自動発行

## 連携実装パターン

### 読み取り操作

```typescript
// 1. コントラクトインスタンス作成
const provider = new ethers.JsonRpcProvider(CONST.RPC_URL);
const contract = new ethers.Contract(contractAddress, abi, provider);

// 2. rpcWrapperでラップ（キャッシュ機能付き）
const wrappedContract = createWrappedContract(contract);

// 3. メソッド呼び出し
const result = await wrappedContract.name();
```

### 書き込み操作

```typescript
// 1. ウォレット接続
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 2. コントラクト作成
const contract = new ethers.Contract(contractAddress, abi, signer);

// 3. トランザクション実行（モーダル表示付き）
const tx = await wrapRPCCall(contract, 'mint', [to, tokenUri]);
await tx.wait();
```

### TBA操作パターン

```typescript
// 1. TBAアドレス取得
const tbaAddress = await getTbaConnect.getTbaInfo(nftContract, tokenId);

// 2. TBA経由でのトランザクション実行
const callData = encodeFunctionData({
  abi: targetAbi,
  functionName: 'transfer',
  args: [recipient, amount]
});

await getTbaConnect.executeCall(
  tbaAddress,
  targetContract,
  '0', // value
  callData
);
```

## ABI管理

すべてのABIは `src/module/connect/abi.ts` で一元管理：

```typescript
export const managerAbi = [...];
export const nftAbi = [...];
export const donateAbi = [...];
export const orderAbi = [...];
export const tbaImplementationAbi = [...];
export const tbaRegistryAbi = [...];
export const sbtAbi = [...];
export const bankAbi = [...];
export const gaslessAbi = [...];
```

## セキュリティ考慮事項

### 1. 権限管理

```typescript
// 操作前の権限チェック
const userType = await setManagerConnect.setManager("checkUser");
if (userType !== "admin" && userType !== "creator") {
  throw new Error("権限がありません");
}
```

### 2. TBA循環参照防止

```typescript
// 最大10層までの階層制限
async sendToEoaCheck(sendTo: string, mine: string, loop = 0): boolean {
  if (loop > 10) {
    console.log("TBA loop over 10");
    return false;
  }
  // 循環参照チェックロジック
}
```

### 3. トランザクション検証

```typescript
// ガス見積もりとエラーハンドリング
try {
  const gasEstimate = await contract.estimateGas.method(...args);
  const tx = await contract.method(...args, {
    gasLimit: gasEstimate * 120n / 100n // 20%バッファ
  });
} catch (error) {
  console.error("Transaction failed:", error);
  // ユーザーへのエラー通知
}
```

## エラーハンドリング

### 一般的なエラー

```typescript
try {
  const result = await contract.method();
} catch (error: any) {
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    // リバートエラー
    alert("トランザクションが失敗しました");
  } else if (error.code === 'NETWORK_ERROR') {
    // ネットワークエラー
    alert("ネットワークエラーが発生しました");
  } else {
    // その他のエラー
    console.error(error);
  }
}
```

### TBA特有のエラー

```typescript
// TBAアカウントが既に存在する場合
if (await utils.isContract(tbaAddress)) {
  console.log("TBA already exists");
  return tbaAddress;
}
```

## ガス最適化

### バッチ処理

```typescript
// 複数のトークン情報を効率的に取得
const promises = tokenIds.map(id => 
  wrappedContract.tokenURI(id)
);
const results = await Promise.all(promises);
```

### キャッシュ活用

```typescript
// 静的データは長期キャッシュ
const name = await wrappedContract.name(); // 永続キャッシュ
const mintFee = await wrappedContract.mintFee(); // 1時間キャッシュ
```

## デバッグとモニタリング

### コントラクト呼び出しログ

```typescript
console.log(`Calling ${method} on ${contractAddress}`);
console.log(`Parameters:`, args);
console.log(`Result:`, result);
```

### トランザクション追跡

```typescript
const tx = await contract.method(...args);
console.log(`Transaction hash: ${tx.hash}`);
const receipt = await tx.wait();
console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
```

## 外部サービス連携

### Discord Bot API

```typescript
// ユーザー認証とSBT発行
const response = await fetch(CONST.BOT_API_URL + "memberSbt/issue", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    discordUserId: discordId,
    secretCode: secret,
    eoaAddress: eoa
  })
});
```

### AWS Lambda統合

```typescript
// DynamoDB経由でのユーザーデータ管理
const userData = await dynamoConnect.getUserByEoa(eoa);
if (userData.discordUser) {
  // Discord連携済みの処理
}
```

## トラブルシューティング

### よくある問題

1. **MetaMask接続エラー**
   - ネットワークがPolygonに設定されているか確認
   - アカウントが接続されているか確認

2. **トランザクション失敗**
   - ガス不足をチェック
   - コントラクトの権限を確認

3. **TBA作成失敗**
   - NFTの所有者であることを確認
   - TBAが既に存在しないか確認

4. **キャッシュ不整合**
   - `/cacheinfo.html`でキャッシュをクリア
   - バーン後のキャッシュ無効化を確認

## まとめ

BizenDAO Frontendは、複数のスマートコントラクトと密接に連携して動作します。特にTBA（ERC-6551）の実装により、NFTが独自のウォレットを持つという革新的な機能を実現しています。適切なエラーハンドリング、キャッシュ戦略、権限管理により、安全で効率的なdAppを構築しています。