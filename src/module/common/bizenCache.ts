import { CONST } from './const';

interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  expiry: number | null;
  category: string;
  size: number;
}

interface GalleryCacheEntry {
  creator: string;
  tokenCount: number;
  tokens: any[];
  metadata: any[];
  lastUpdated: number;
}

export const BIZEN_CACHE_CONFIG: Record<string, number | null> = {
  // 永続キャッシュ - 絶対に変わらない値
  'name': null,
  'symbol': null,
  'MAX_ROYALTY_BPS': null,
  
  // 長期キャッシュ（1時間）- めったに変わらない値
  'mintFee': 3600000,
  'royaltyInfo': 3600000,
  
  // 中期キャッシュ（5分）- 作品情報など
  'tokenURI': 300000,
  'creatorTokens': 300000,
  'normalTokens': 300000,
  'sbtTokens': 300000,
  'creatorTokenCount': 300000,
  'normalTokenCount': 300000,
  'sbtTokenCount': 300000,
  
  // 短期キャッシュ（30秒）- 頻繁に変わる可能性がある値
  'totalSupply': 30000,
  
  // キャッシュしない動的メソッド（コメントとして記載）
  // 'tokenOfOwnerByIndex': undefined - 所有者のトークンインデックスは常に最新を取得
  // 'balanceOf': undefined - 残高は常に最新を取得
  // 'ownerOf': undefined - 所有者は常に最新を取得
  // 'checkUser': undefined - ユーザー権限は常に最新を取得
  // 'checkOwner': undefined - オーナー確認は常に最新を取得
  // 'checkToken': undefined - トークン確認は常に最新を取得
  // 'isApprovedForAll': undefined - 承認状態は常に最新を取得
  // 'getApproved': undefined - 承認状態は常に最新を取得
  // 'tokenLocked': undefined - ロック状態は常に最新を取得
  // 'burnHistory': undefined - バーン履歴は常に最新を取得
};

export class BizenDAOCache {
  private dbName = 'bizenDAO_rpc_cache';
  private version = 1;
  private db: IDBDatabase | null = null;
  
  // キャッシュメトリクス
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    errors: 0
  };

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // キャッシュストア
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
          cacheStore.createIndex('category', 'category', { unique: false });
        }

        // ギャラリーキャッシュストア
        if (!db.objectStoreNames.contains('gallery_cache')) {
          const galleryStore = db.createObjectStore('gallery_cache', { keyPath: 'creator' });
          galleryStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
      };
    });
  }

  generateCacheKey(method: string, params: any, contractAddress?: string): string {
    const chainId = CONST.BC_NETWORK_ID;
    
    // BigIntを文字列に変換してからJSON.stringifyする
    const sanitizedParams = this.sanitizeParams(params);
    const paramsStr = JSON.stringify(sanitizedParams || {});
    
    if (contractAddress) {
      return `${chainId}:${contractAddress}:${method}:${paramsStr}`;
    }
    return `${chainId}:${method}:${paramsStr}`;
  }
  
  private sanitizeParams(params: any): any {
    if (params === null || params === undefined) return params;
    
    if (typeof params === 'bigint') {
      return params.toString();
    }
    
    if (Array.isArray(params)) {
      return params.map(p => this.sanitizeParams(p));
    }
    
    if (typeof params === 'object') {
      const sanitized: any = {};
      for (const key in params) {
        sanitized[key] = this.sanitizeParams(params[key]);
      }
      return sanitized;
    }
    
    return params;
  }

  private isExpired(entry: CacheEntry): boolean {
    if (entry.expiry === null) return false; // 永続キャッシュ
    return Date.now() > entry.expiry;
  }

  async get(key: string): Promise<any | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(key);

        request.onsuccess = () => {
          const entry = request.result;
          
          if (!entry) {
            this.metrics.misses++;
            resolve(null);
            return;
          }

          if (this.isExpired(entry)) {
            this.metrics.misses++;
            this.delete(key); // 期限切れエントリを削除
            resolve(null);
            return;
          }

          this.metrics.hits++;
          resolve(entry.value);
        };

        request.onerror = () => {
          this.metrics.errors++;
          console.error('Cache get error:', request.error);
          resolve(null);
        };
      } catch (error) {
        this.metrics.errors++;
        console.error('Cache get error:', error);
        resolve(null);
      }
    });
  }

  async set(key: string, value: any, ttlMs?: number | null, category: string = 'general'): Promise<void> {
    if (!this.db) await this.initDB();

    const expiry = ttlMs === null ? null : (ttlMs ? Date.now() + ttlMs : null);
    const size = new Blob([JSON.stringify(value)]).size;

    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      expiry,
      category,
      size
    };

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.put(entry);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          this.metrics.errors++;
          console.error('Cache set error:', request.error);
          reject(request.error);
        };
      } catch (error) {
        this.metrics.errors++;
        console.error('Cache set error:', error);
        reject(error);
      }
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.delete(key);

        request.onsuccess = () => {
          this.metrics.evictions++;
          resolve();
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.openCursor();

        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            const key = cursor.value.key;
            if (this.matchPattern(key, pattern)) {
              cursor.delete();
              this.metrics.evictions++;
            }
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  private matchPattern(str: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(str);
  }

  // ギャラリーキャッシュ専用メソッド
  async setGalleryCache(creator: string, gallery: GalleryCacheEntry, ttlMs: number): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['gallery_cache'], 'readwrite');
        const store = transaction.objectStore('gallery_cache');
        const request = store.put(gallery);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getGalleryCache(creator: string): Promise<GalleryCacheEntry | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(['gallery_cache'], 'readonly');
        const store = transaction.objectStore('gallery_cache');
        const request = store.get(creator);

        request.onsuccess = () => {
          const gallery = request.result;
          if (!gallery) {
            resolve(null);
            return;
          }

          // 1時間以上経過していたら無効
          if (Date.now() - gallery.lastUpdated > 3600000) {
            this.deleteGalleryCache(creator);
            resolve(null);
            return;
          }

          resolve(gallery);
        };

        request.onerror = () => resolve(null);
      } catch (error) {
        resolve(null);
      }
    });
  }

  async deleteGalleryCache(creator: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['gallery_cache'], 'readwrite');
        const store = transaction.objectStore('gallery_cache');
        const request = store.delete(creator);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  // キャッシュクリア
  async clearAll(): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['cache', 'gallery_cache'], 'readwrite');
        
        const cacheStore = transaction.objectStore('cache');
        const galleryStore = transaction.objectStore('gallery_cache');
        
        cacheStore.clear();
        galleryStore.clear();

        transaction.oncomplete = () => {
          this.metrics = { hits: 0, misses: 0, evictions: 0, errors: 0 };
          resolve();
        };

        transaction.onerror = () => reject(transaction.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  // メトリクス取得
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;

    return {
      ...this.metrics,
      hitRate: hitRate.toFixed(2) + '%',
      totalRequests: total
    };
  }

  // ストレージ使用量取得
  async getStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
      };
    }
    return null;
  }

  // バーン時のキャッシュ無効化
  async handleTokenBurn(tokenId: string, creator: string): Promise<void> {
    // 個別トークンのキャッシュをクリア
    await this.deletePattern(`*tokenURI.*"tokenId":"${tokenId}"*`);
    await this.deletePattern(`*ownerOf.*"tokenId":"${tokenId}"*`);
    await this.deletePattern(`*tokenLocked.*"tokenId":"${tokenId}"*`);
    
    // 集計系のキャッシュを無効化
    await this.deletePattern('*totalSupply*');
    await this.deletePattern('*TokenCount*');
    await this.deletePattern(`*creatorTokens.*"creator":"${creator}"*`);
    
    // ギャラリーキャッシュも無効化
    await this.deleteGalleryCache(creator);
  }
}

// シングルトンインスタンス
export const bizenCache = new BizenDAOCache();