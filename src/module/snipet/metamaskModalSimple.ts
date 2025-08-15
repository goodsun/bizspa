import { detectBrowser } from "../common/browserDetect";
import { LANG } from "../common/lang";
import { router } from "../common/router";

export const initMetaMaskModal = (): void => {
  console.log("MetaMask Modal: Initializing...");
  
  // DOMが完全に読み込まれるのを待つ
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndShowModal);
  } else {
    checkAndShowModal();
  }
};

const checkAndShowModal = (): void => {
  console.log("MetaMask Modal: Checking browser...");
  const browserInfo = detectBrowser();
  console.log("Browser Info:", browserInfo);
  
  const shouldShow = (browserInfo.isMobile && !browserInfo.isMetaMaskBrowser) || 
                     (!browserInfo.isMobile && !browserInfo.hasMetaMaskExtension);
  
  console.log("Should show modal:", shouldShow);
  
  if (shouldShow) {
    createAndShowModal();
  }
};

const createAndShowModal = (): void => {
  console.log("MetaMask Modal: Creating modal...");
  
  // 既存のモーダルがあれば削除
  const existing = document.getElementById('metamask-modal-simple');
  if (existing) {
    existing.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'metamask-modal-simple';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background-color: white;
    border-radius: 12px;
    padding: 50px;
    max-width: 800px;
    width: 90%;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 36px;
    cursor: pointer;
    color: #666;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeBtn.onclick = () => modal.remove();
  
  const browserInfo = detectBrowser();
  const lang = router.lang || "en";
  
  const title = document.createElement('h2');
  title.style.cssText = `
    font-size: 42px;
    margin-bottom: 24px;
    color: #333;
    font-weight: 600;
    line-height: 1.2;
  `;
  
  const description = document.createElement('p');
  description.style.cssText = `
    font-size: 36px;
    line-height: 1.6;
    color: #666;
    margin-bottom: 32px;
  `;
  
  if (browserInfo.isMobile) {
    title.textContent = LANG[lang]?.metamask_mobile_title || "Access with MetaMask Browser";
    description.textContent = LANG[lang]?.metamask_mobile_desc || 
      "Please access this site using the MetaMask mobile app's built-in browser for the best experience.";
  } else {
    title.textContent = LANG[lang]?.metamask_desktop_title || "MetaMask Extension Required";
    description.textContent = LANG[lang]?.metamask_desktop_desc || 
      "Please install the MetaMask browser extension to interact with this site.";
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;
  
  if (browserInfo.isMobile) {
    const deepLink = document.createElement('a');
    deepLink.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}?timestamp=${Date.now()}`;
    deepLink.textContent = LANG[lang]?.metamask_open_app || "Open in MetaMask";
    deepLink.style.cssText = `
      padding: 20px 40px;
      font-size: 36px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      background-color: #f6851b;
      color: white;
      font-weight: 500;
      display: block;
    `;
    buttonContainer.appendChild(deepLink);
  } else {
    const downloadLink = document.createElement('a');
    downloadLink.href = "https://metamask.io/download/";
    downloadLink.target = "_blank";
    downloadLink.textContent = LANG[lang]?.metamask_download || "Download MetaMask";
    downloadLink.style.cssText = `
      padding: 20px 40px;
      font-size: 36px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      background-color: #f6851b;
      color: white;
      font-weight: 500;
      display: block;
    `;
    buttonContainer.appendChild(downloadLink);
  }
  
  const continueBtn = document.createElement('button');
  continueBtn.textContent = LANG[lang]?.metamask_continue || "Continue Anyway";
  continueBtn.style.cssText = `
    padding: 20px 40px;
    font-size: 36px;
    border-radius: 8px;
    border: 1px solid #ddd;
    cursor: pointer;
    text-align: center;
    background-color: transparent;
    color: #666;
    font-weight: 500;
    width: 100%;
  `;
  continueBtn.onclick = () => modal.remove();
  buttonContainer.appendChild(continueBtn);
  
  content.appendChild(closeBtn);
  content.appendChild(title);
  content.appendChild(description);
  content.appendChild(buttonContainer);
  
  modal.appendChild(content);
  
  // モーダル外クリックで閉じる
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };
  
  document.body.appendChild(modal);
  console.log("MetaMask Modal: Modal appended to body");
};