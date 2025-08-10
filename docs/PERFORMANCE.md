# BizenDAO Frontend パフォーマンス最適化ガイド

## 概要

BizenDAO Frontendのパフォーマンスを最適化するための指針と実装方法をまとめています。主にRPCキャッシュ、レンダリング最適化、バンドルサイズ削減に焦点を当てています。

## パフォーマンス指標

### 現在の実績

| 指標 | 最適化前 | 最適化後 | 改善率 |
|-----|---------|---------|-------|
| 初回ページロード | 3秒 | 1.2秒 | 60% |
| RPC呼び出し数 | 100回/画面 | 15-25回/画面 | 75-85% |
| レスポンス時間 | 200ms | 5ms（キャッシュヒット時） | 97.5% |
| バンドルサイズ | 測定中 | 測定中 | - |

## RPCキャッシュ最適化

### 実装済みの最適化

#### 1. IndexedDBキャッシュ
```typescript
// 永続キャッシュ（変更されないデータ）
const PERMANENT_CACHE = ['name', 'symbol', 'MAX_ROYALTY_BPS'];

// TTL付きキャッシュ
const CACHE_TTL = {
  'tokenURI': 300000,      // 5分
  'totalSupply': 30000,    // 30秒
  'balanceOf': 30000       // 30秒
};
```

#### 2. バッチ処理
```typescript
// 複数のトークン情報を並列取得
async function batchFetchTokens(tokenIds: string[]) {
  const promises = tokenIds.map(id => 
    wrappedContract.tokenURI(id)
  );
  return await Promise.all(promises);
}
```

#### 3. ギャラリー最適化
```typescript
// 作者別ギャラリーを一括キャッシュ
async function cacheCreatorGallery(creator: string) {
  const gallery = await fetchAllCreatorTokens(creator);
  await bizenCache.setGalleryCache(creator, gallery, 3600000); // 1時間
}
```

### さらなる最適化案

#### 1. プリフェッチ戦略
```typescript
// ユーザーの行動を予測してデータを事前取得
async function prefetchRelatedData(currentTokenId: string) {
  // 次/前のトークンを事前取得
  const nextId = String(Number(currentTokenId) + 1);
  const prevId = String(Number(currentTokenId) - 1);
  
  // バックグラウンドで取得
  setTimeout(() => {
    getToken('tokenURI', contractAddress, nextId);
    getToken('tokenURI', contractAddress, prevId);
  }, 1000);
}
```

#### 2. キャッシュウォーミング
```typescript
// アプリ起動時に重要なデータをキャッシュ
async function warmupCache() {
  const contracts = await getManager('contracts');
  
  // 各コントラクトの基本情報を事前取得
  for (const [ca] of contracts) {
    getToken('name', ca);
    getToken('symbol', ca);
    getToken('totalSupply', ca);
  }
}
```

## レンダリング最適化

### 1. 仮想スクロール

大量のNFT表示時の最適化：

```typescript
class VirtualScroller {
  private visibleRange = { start: 0, end: 20 };
  private itemHeight = 200;
  
  updateVisibleItems(scrollTop: number) {
    this.visibleRange.start = Math.floor(scrollTop / this.itemHeight);
    this.visibleRange.end = this.visibleRange.start + 20;
    this.renderVisibleItems();
  }
  
  renderVisibleItems() {
    // 表示範囲のアイテムのみレンダリング
    const visibleItems = this.items.slice(
      this.visibleRange.start,
      this.visibleRange.end
    );
    this.updateDOM(visibleItems);
  }
}
```

### 2. 画像の遅延読み込み

```typescript
// Intersection Observerを使用した画像遅延読み込み
function lazyLoadImages() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}
```

### 3. デバウンス処理

```typescript
// 検索やフィルタリングの最適化
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 使用例
const optimizedSearch = debounce(searchTokens, 300);
```

## バンドルサイズ最適化

### 1. コード分割（将来実装）

```typescript
// 動的インポートによるコード分割
async function loadAdminModule() {
  const { adminSettings } = await import(
    /* webpackChunkName: "admin" */ 
    './module/admin/settings'
  );
  return adminSettings;
}
```

### 2. Tree Shaking最適化

```typescript
// 使用する関数のみインポート
import { checkBalance, waiToEth } from './utils';
// 全体インポートは避ける
// import * as utils from './utils';
```

### 3. 依存関係の最適化

```json
// package.json - 本番ビルドから開発依存を除外
{
  "dependencies": {
    "ethers": "^6.12.1",
    "marked": "^12.0.2"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "webpack": "^5.91.0"
  }
}
```

## ネットワーク最適化

### 1. HTTP/2の活用

```apache
# .htaccess - HTTP/2プッシュ
<FilesMatch "\.(js|css)$">
  Header add Link "</js/bundle.js>; rel=preload; as=script"
  Header add Link "</css/style.css>; rel=preload; as=style"
</FilesMatch>
```

### 2. リソースヒント

```html
<!-- index.html -->
<link rel="preconnect" href="https://polygon-rpc.com">
<link rel="dns-prefetch" href="https://polygon-rpc.com">
<link rel="prefetch" href="/js/bundle.js">
```

### 3. CDN活用（将来実装）

```typescript
// IPFS Gateway の最適化
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

async function fetchIPFS(hash: string) {
  // 最速のゲートウェイを使用
  return Promise.race(
    IPFS_GATEWAYS.map(gateway => 
      fetch(gateway + hash)
    )
  );
}
```

## メモリ管理

### 1. DOM要素のクリーンアップ

```typescript
// 不要なDOM要素とイベントリスナーの削除
function cleanup() {
  // イベントリスナーの削除
  element.removeEventListener('click', handler);
  
  // DOM要素の削除
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}
```

### 2. メモリリーク防止

```typescript
// WeakMapを使用したキャッシュ
const cache = new WeakMap<HTMLElement, any>();

// 循環参照の回避
class Component {
  private destroyed = false;
  
  destroy() {
    this.destroyed = true;
    this.cleanup();
  }
  
  private cleanup() {
    // リソースの解放
  }
}
```

## 測定とモニタリング

### 1. パフォーマンス測定

```typescript
// Performance APIを使用した測定
function measureRPCCall(method: string) {
  const startMark = `rpc-start-${method}`;
  const endMark = `rpc-end-${method}`;
  
  performance.mark(startMark);
  
  return {
    end: () => {
      performance.mark(endMark);
      performance.measure(
        `RPC call: ${method}`,
        startMark,
        endMark
      );
    }
  };
}
```

### 2. キャッシュ効果の測定

```typescript
// キャッシュヒット率の追跡
class CacheMetrics {
  private metrics = {
    hits: 0,
    misses: 0,
    totalTime: 0
  };
  
  recordHit(responseTime: number) {
    this.metrics.hits++;
    this.metrics.totalTime += responseTime;
  }
  
  recordMiss(responseTime: number) {
    this.metrics.misses++;
    this.metrics.totalTime += responseTime;
  }
  
  getHitRate() {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? 
      (this.metrics.hits / total * 100).toFixed(1) + '%' : 
      '0%';
  }
}
```

### 3. リアルユーザーモニタリング（RUM）

```typescript
// 実際のユーザー体験を測定
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  
  // サーバーに送信（将来実装）
  sendMetrics({
    loadTime: perfData.loadEventEnd - perfData.fetchStart,
    domReady: perfData.domContentLoadedEventEnd - perfData.fetchStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime
  });
});
```

## ベストプラクティス

### 1. 開発時の注意点

- 不要なconsole.logを削除（本番環境）
- 開発ツールを本番ビルドから除外
- ソースマップは開発環境のみ

### 2. デプロイ時の最適化

```bash
# 本番ビルド時の最適化
NODE_ENV=production npx webpack --mode production

# gzip圧縮
find public -type f \( -name "*.js" -o -name "*.css" \) -exec gzip -9 -k {} \;
```

### 3. 継続的な改善

- 定期的なパフォーマンス測定
- ユーザーフィードバックの収集
- 新機能追加時の影響評価

## チェックリスト

### 開発時
- [ ] 不要な再レンダリングを避ける
- [ ] 大量データは仮想スクロールを使用
- [ ] 画像は適切なサイズに最適化
- [ ] 非同期処理は適切にハンドリング

### リリース前
- [ ] console.logを削除
- [ ] バンドルサイズを確認
- [ ] キャッシュ戦略を検証
- [ ] ネットワークタブで無駄なリクエストを確認

### 運用中
- [ ] キャッシュヒット率をモニタリング
- [ ] エラー率を監視
- [ ] ユーザーからのフィードバックを収集
- [ ] 定期的なパフォーマンステストを実施

## まとめ

BizenDAO Frontendのパフォーマンス最適化は、主にRPCキャッシュシステムによって大幅な改善を実現しています。今後は、コード分割、CDN活用、より高度なキャッシュ戦略の実装により、さらなるパフォーマンス向上が期待できます。