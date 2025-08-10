import { bizenCache } from './module/common/bizenCache';

interface CacheEntryDisplay {
  key: string;
  size: number;
  timestamp: number;
  expiry: number | null;
  category: string;
}

async function updateMetrics() {
  const metrics = bizenCache.getMetrics();
  
  const metricsContainer = document.getElementById('metrics');
  if (metricsContainer) {
    metricsContainer.innerHTML = `
      <div class="metric-card">
        <div class="metric-value ${getHitRateClass(parseFloat(metrics.hitRate))}">${metrics.hitRate}</div>
        <div class="metric-label">Hit Rate</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.totalRequests}</div>
        <div class="metric-label">Total Requests</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.hits}</div>
        <div class="metric-label">Cache Hits</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.misses}</div>
        <div class="metric-label">Cache Misses</div>
      </div>
    `;
  }
}

function getHitRateClass(rate: number): string {
  if (rate >= 80) return 'status-good';
  if (rate >= 50) return 'status-warning';
  return 'status-danger';
}

async function updateStorageInfo() {
  const storageInfo = await bizenCache.getStorageInfo();
  
  if (storageInfo) {
    const usageMB = (storageInfo.usage / 1024 / 1024).toFixed(2);
    const quotaMB = (storageInfo.quota / 1024 / 1024).toFixed(2);
    const percentage = storageInfo.percentage.toFixed(1);
    
    const progressBar = document.getElementById('storage-progress') as HTMLDivElement;
    const storageText = document.getElementById('storage-text') as HTMLSpanElement;
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (storageText) {
      storageText.textContent = `${usageMB} MB / ${quotaMB} MB (${percentage}%)`;
    }
  }
}

async function getCacheEntries(): Promise<CacheEntryDisplay[]> {
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('bizenDAO_rpc_cache', 1);
    
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const entries = getAllRequest.result as CacheEntryDisplay[];
        resolve(entries);
      };
      
      getAllRequest.onerror = () => {
        resolve([]);
      };
    };
    
    dbRequest.onerror = () => {
      resolve([]);
    };
  });
}

async function updateCacheEntries() {
  const entries = await getCacheEntries();
  const container = document.getElementById('cache-entries');
  
  if (!container) return;
  
  if (entries.length === 0) {
    container.innerHTML = '<p>No cache entries found.</p>';
    return;
  }
  
  const sortedEntries = entries.sort((a, b) => b.timestamp - a.timestamp);
  const limitedEntries = sortedEntries.slice(0, 100); // 最新100件のみ表示
  
  container.innerHTML = limitedEntries.map(entry => {
    const date = new Date(entry.timestamp).toLocaleString();
    const expiry = entry.expiry ? new Date(entry.expiry).toLocaleString() : 'Never';
    const sizeKB = (entry.size / 1024).toFixed(2);
    
    return `
      <div class="cache-entry">
        <strong>Key:</strong> ${entry.key}<br>
        <strong>Category:</strong> ${entry.category}<br>
        <strong>Size:</strong> ${sizeKB} KB<br>
        <strong>Cached:</strong> ${date}<br>
        <strong>Expires:</strong> ${expiry}
      </div>
    `;
  }).join('');
}

async function refreshData() {
  await updateMetrics();
  await updateStorageInfo();
  await updateCacheEntries();
}

async function clearCache() {
  if (confirm('Are you sure you want to clear all cache? This action cannot be undone.')) {
    await bizenCache.clearAll();
    alert('Cache cleared successfully!');
    await refreshData();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-btn');
  const clearCacheBtn = document.getElementById('clear-cache-btn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshData);
  }
  
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', clearCache);
  }
  
  // Initial load
  refreshData();
  
  // Auto refresh every 5 seconds
  setInterval(refreshData, 5000);
});