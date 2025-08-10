# BizenDAO Frontend トラブルシューティングガイド

## 概要

BizenDAO Frontendの開発・運用で発生する可能性のある問題と、その解決方法をまとめています。

## 目次

1. [開発環境の問題](#開発環境の問題)
2. [MetaMask関連](#metamask関連)
3. [RPC/ブロックチェーン接続](#rpcブロックチェーン接続)
4. [キャッシュ関連](#キャッシュ関連)
5. [NFT表示・操作](#nft表示操作)
6. [ビルド・デプロイ](#ビルドデプロイ)
7. [パフォーマンス問題](#パフォーマンス問題)
8. [エラーメッセージ一覧](#エラーメッセージ一覧)

---

## 開発環境の問題

### npm install が失敗する

**症状**: 依存関係のインストール中にエラーが発生

**解決方法**:
```bash
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

### ポート80でサーバーが起動できない

**症状**: `Error: listen EACCES: permission denied 0.0.0.0:80`

**解決方法**:
```bash
# 管理者権限で実行
sudo npm run dev

# または別のポートを使用（server.jsを編集）
const PORT = process.env.PORT || 3000;
```

### TypeScriptのコンパイルエラー

**症状**: 型エラーやモジュール解決エラー

**解決方法**:
```bash
# TypeScript設定を確認
cat tsconfig.json

# 型定義を再インストール
npm install --save-dev @types/node
```

---

## MetaMask関連

### MetaMaskが接続できない

**症状**: 「ウォレットを接続してください」と表示される

**解決方法**:
1. MetaMaskがインストールされているか確認
2. 正しいネットワークに接続しているか確認
   - Polygon Mainnet (Chain ID: 137)
3. サイトへの接続を許可
   ```javascript
   // 手動で接続を試みる（ブラウザコンソール）
   await window.ethereum.request({ method: 'eth_requestAccounts' });
   ```

### ネットワーク切り替えエラー

**症状**: 「Wrong Network」エラー

**解決方法**:
```javascript
// Polygon Networkを追加
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x89', // 137 in hex
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com/']
  }]
});
```

### トランザクションが承認されない

**症状**: MetaMaskでトランザクションを承認してもエラーになる

**解決方法**:
- ガス代を増やす（MetaMaskの詳細設定）
- Nonceをリセット（MetaMask設定 > 詳細 > アカウントをリセット）

---

## RPC/ブロックチェーン接続

### RPC接続タイムアウト

**症状**: `TimeoutError: Request timed out`

**解決方法**:
1. RPC URLを確認
   ```typescript
   // const.tsのRPC_URLを確認
   console.log(CONST.RPC_URL);
   ```

2. 別のRPCプロバイダーを試す
   ```typescript
   // Alchemyからpolygon-rpcに変更
   RPC_URL: "https://polygon-rpc.com"
   ```

3. レート制限の確認
   - 無料プランの制限に達していないか確認
   - 有料プランへのアップグレードを検討

### checkUser() がエラーを返す

**症状**: `Error: cannot estimate gas; value="0x"`

**原因**: 動的な値をキャッシュしようとしている

**解決方法**:
```typescript
// キャッシュ対象から除外されているか確認
// check系、is系、can系、has系メソッドはキャッシュ対象外
```

### BigIntシリアライズエラー

**症状**: `TypeError: Do not know how to serialize a BigInt`

**解決方法**:
```typescript
// BigIntを文字列に変換
const sanitized = bigintValue.toString();

// またはJSONシリアライズ時にreplacerを使用
JSON.stringify(data, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);
```

---

## キャッシュ関連

### 古いデータが表示される

**症状**: 更新したはずのデータが反映されない

**解決方法**:
1. キャッシュ管理画面でクリア
   ```
   http://localhost/cacheinfo.html
   ```

2. ブラウザのIndexedDBを直接削除
   - 開発者ツール > Application > Storage > IndexedDB
   - `bizenDAO_rpc_cache`を削除

3. プログラムでクリア
   ```typescript
   await bizenCache.clear();
   ```

### キャッシュが効いていない

**症状**: 毎回RPCリクエストが発生する

**確認方法**:
```javascript
// コンソールでキャッシュヒットを確認
// "Cache hit: methodName on 0x..." が表示されるか
```

**解決方法**:
- CACHE_TTLにメソッドが登録されているか確認
- キャッシュキーが正しく生成されているか確認

### IndexedDBの容量超過

**症状**: `QuotaExceededError`

**解決方法**:
```typescript
// 古いエントリを削除
await bizenCache.cleanup(30); // 30日以上前のデータを削除

// または全削除
await bizenCache.clear();
```

---

## NFT表示・操作

### NFT画像が表示されない

**症状**: 画像の代わりにプレースホルダーが表示

**解決方法**:
1. tokenURIが正しく取得できているか確認
   ```javascript
   const uri = await contract.tokenURI(tokenId);
   console.log(uri);
   ```

2. IPFSゲートウェイの問題
   ```javascript
   // 別のIPFSゲートウェイを試す
   uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
   ```

3. CORS問題の確認
   - ブラウザコンソールでCORSエラーを確認

### トークン送信が失敗する

**症状**: `Transfer failed`エラー

**確認事項**:
1. 送信者がトークンの所有者か
2. 送信先アドレスが有効か
3. SBTの場合は転送不可

**解決方法**:
```typescript
// 所有者確認
const owner = await contract.ownerOf(tokenId);
console.log('Owner:', owner);
console.log('Sender:', senderAddress);
```

### TBA作成が失敗する

**症状**: TBAアドレスが生成されない

**確認事項**:
1. NFTの所有者であるか
2. TBAが既に存在しないか
3. 実装コントラクトが正しいか

**解決方法**:
```typescript
// TBAの存在確認
const tbaAddress = await getTbaConnect.getTbaInfo(nftContract, tokenId);
const isContract = await utils.isContract(tbaAddress);
if (isContract) {
  console.log('TBA already exists:', tbaAddress);
}
```

---

## ビルド・デプロイ

### Webpackビルドエラー

**症状**: `Module not found`エラー

**解決方法**:
```bash
# 依存関係の確認
npm ls [missing-module]

# 不足しているモジュールをインストール
npm install [missing-module]
```

### デプロイ時のSCPエラー

**症状**: `Permission denied`

**解決方法**:
1. SSH設定を確認
   ```bash
   ssh bizendao "echo 'OK'"
   ```

2. 権限を確認
   ```bash
   ssh bizendao "ls -la web/stg"
   ```

3. 手動でデプロイ
   ```bash
   scp -r public/* bizendao:web/stg/
   ```

### 環境別設定が反映されない

**症状**: 開発環境なのに本番設定が使われる

**確認方法**:
```javascript
// const.tsの内容を確認
console.log(CONST.HEADER_TITLE);
console.log(CONST.BC_NETWORK_ID);
```

**解決方法**:
```bash
# 手動で設定ファイルをコピー
cp deploy/settings/front_dev.cnf src/module/common/const.ts

# ビルドをやり直す
npm run dev
```

---

## パフォーマンス問題

### ページロードが遅い

**原因と対策**:
1. **大量のRPCリクエスト**
   - キャッシュが有効か確認
   - バッチ処理を使用

2. **大きな画像ファイル**
   - 画像を最適化
   - 遅延読み込みを実装

3. **バンドルサイズ**
   ```bash
   # バンドルサイズを確認
   npx webpack-bundle-analyzer
   ```

### メモリリーク

**症状**: 長時間使用でブラウザが重くなる

**確認方法**:
- Chrome DevTools > Memory でヒープスナップショット
- イベントリスナーの解放忘れを確認

**解決方法**:
```typescript
// イベントリスナーを適切に解放
element.removeEventListener('click', handler);

// 不要なDOMを削除
parentElement.innerHTML = '';
```

---

## エラーメッセージ一覧

### ブロックチェーン関連

| エラーメッセージ | 原因 | 解決方法 |
|---------------|------|---------|
| `UNPREDICTABLE_GAS_LIMIT` | トランザクションがリバート | 権限や条件を確認 |
| `INSUFFICIENT_FUNDS` | ガス代不足 | POLを補充 |
| `NONCE_TOO_LOW` | Nonce重複 | MetaMaskをリセット |
| `NETWORK_ERROR` | RPC接続エラー | ネットワークを確認 |

### アプリケーション関連

| エラーメッセージ | 原因 | 解決方法 |
|---------------|------|---------|
| `checkUser is not a function` | ABI不一致 | ABIを更新 |
| `Invalid address` | 不正なアドレス形式 | アドレスを確認 |
| `Token does not exist` | 存在しないトークンID | IDを確認 |

### キャッシュ関連

| エラーメッセージ | 原因 | 解決方法 |
|---------------|------|---------|
| `Failed to open IndexedDB` | ブラウザ非対応 | 別のブラウザを使用 |
| `QuotaExceededError` | 容量超過 | キャッシュをクリア |
| `Cache validation failed` | データ破損 | キャッシュを再生成 |

---

## デバッグツール

### ブラウザコンソールコマンド

```javascript
// キャッシュ状態確認
await bizenCache.getMetrics()

// RPC URL確認
CONST.RPC_URL

// ウォレット接続状態
await utils.checkBalance()

// 特定のトークン情報取得
await getTokenConnect.getToken('tokenURI', '0x...', '1')
```

### 開発者向けURL

- `/cacheinfo.html` - キャッシュ管理画面
- `?lang=en` - 英語表示
- `?debug=true` - デバッグモード（実装予定）

---

## サポート

問題が解決しない場合は、以下の情報と共に開発チームに連絡してください：

1. エラーメッセージの全文
2. 再現手順
3. 使用環境（ブラウザ、MetaMaskバージョン等）
4. コンソールログ
5. ネットワークタブのスクリーンショット