import { detectBrowser } from "../common/browserDetect";
import { LANG } from "../common/lang";
import { router } from "../common/router";

let modalElement: HTMLDivElement | null = null;
let isModalShown = false;

const createMetaMaskModal = (): HTMLDivElement => {
  const modal = document.createElement("div");
  modal.id = "metamask-modal";
  modal.className = "metamask-modal-overlay";
  
  const modalContent = document.createElement("div");
  modalContent.className = "metamask-modal-content";
  
  const closeButton = document.createElement("button");
  closeButton.className = "metamask-modal-close";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = hideMetaMaskModal;
  
  const title = document.createElement("h2");
  title.className = "metamask-modal-title";
  
  const description = document.createElement("p");
  description.className = "metamask-modal-description";
  
  const browserInfo = detectBrowser();
  const lang = router.lang || "en";
  
  if (browserInfo.isMobile) {
    title.textContent = LANG[lang]?.metamask_mobile_title || "Access with MetaMask Browser";
    description.textContent = LANG[lang]?.metamask_mobile_desc || 
      "Please access this site using the MetaMask mobile app's built-in browser for the best experience.";
  } else {
    title.textContent = LANG[lang]?.metamask_desktop_title || "MetaMask Extension Required";
    description.textContent = LANG[lang]?.metamask_desktop_desc || 
      "Please install the MetaMask browser extension to interact with this site.";
  }
  
  const linkContainer = document.createElement("div");
  linkContainer.className = "metamask-modal-links";
  
  if (browserInfo.isMobile) {
    const deepLink = document.createElement("a");
    deepLink.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}?timestamp=${Date.now()}`;
    deepLink.className = "metamask-modal-button primary";
    deepLink.textContent = LANG[lang]?.metamask_open_app || "Open in MetaMask";
    linkContainer.appendChild(deepLink);
  } else {
    const downloadLink = document.createElement("a");
    downloadLink.href = "https://metamask.io/download/";
    downloadLink.target = "_blank";
    downloadLink.className = "metamask-modal-button primary";
    downloadLink.textContent = LANG[lang]?.metamask_download || "Download MetaMask";
    linkContainer.appendChild(downloadLink);
  }
  
  const continueButton = document.createElement("button");
  continueButton.className = "metamask-modal-button secondary";
  continueButton.textContent = LANG[lang]?.metamask_continue || "Continue Anyway";
  continueButton.onclick = hideMetaMaskModal;
  linkContainer.appendChild(continueButton);
  
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(description);
  modalContent.appendChild(linkContainer);
  
  modal.appendChild(modalContent);
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      hideMetaMaskModal();
    }
  };
  
  return modal;
};

export const showMetaMaskModal = (): void => {
  if (isModalShown) return;
  
  modalElement = createMetaMaskModal();
  document.body.appendChild(modalElement);
  isModalShown = true;
  
  setTimeout(() => {
    modalElement?.classList.add("show");
  }, 10);
};

export const hideMetaMaskModal = (): void => {
  if (!modalElement) return;
  
  modalElement.classList.remove("show");
  
  setTimeout(() => {
    if (modalElement && modalElement.parentNode) {
      modalElement.parentNode.removeChild(modalElement);
    }
    modalElement = null;
    isModalShown = false;
  }, 300);
};

export const checkAndShowMetaMaskModal = (): void => {
  const browserInfo = detectBrowser();
  
  if (browserInfo.isMobile && !browserInfo.isMetaMaskBrowser) {
    showMetaMaskModal();
  } else if (!browserInfo.isMobile && !browserInfo.hasMetaMaskExtension) {
    showMetaMaskModal();
  }
};