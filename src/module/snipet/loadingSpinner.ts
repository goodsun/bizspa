let loadingOverlay: HTMLDivElement | null = null;

export function showLoadingSpinner(message: string = "読み込み中...") {
  if (loadingOverlay) return;

  // オーバーレイを作成（rpc-modalと同じスタイル）
  loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-spinner-overlay";
  loadingOverlay.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 0.6rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
    z-index: 1200;
    max-width: 300px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  `;

  // コンテンツコンテナを作成
  const content = document.createElement("div");
  content.style.cssText = `
    display: flex;
    align-items: center;
    gap: 1rem;
  `;

  // スピナーを作成
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.style.cssText = `
    width: 30px;
    height: 30px;
    flex-shrink: 0;
  `;

  // メッセージを作成
  const messageElement = document.createElement("div");
  messageElement.className = "loading-message";
  messageElement.style.cssText = `
    color: #cccccc;
    font-size: 0.8rem;
    font-weight: 500;
  `;
  messageElement.textContent = message;

  // 要素を組み立て
  content.appendChild(spinner);
  content.appendChild(messageElement);
  loadingOverlay.appendChild(content);
  document.body.appendChild(loadingOverlay);

  // アニメーション開始
  setTimeout(() => {
    loadingOverlay.style.opacity = "1";
    loadingOverlay.style.transform = "translateY(0)";
  }, 10);
}

export function hideLoadingSpinner() {
  if (loadingOverlay) {
    // フェードアウトアニメーション
    loadingOverlay.style.opacity = "0";
    loadingOverlay.style.transform = "translateY(10px)";

    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.remove();
        loadingOverlay = null;
      }
    }, 300);
  }
}

export function updateLoadingMessage(message: string) {
  if (loadingOverlay) {
    const messageElement = loadingOverlay.querySelector(".loading-message");
    if (messageElement) {
      messageElement.textContent = message;
    }
  }
}
