export interface BrowserInfo {
  isMobile: boolean;
  isMetaMaskBrowser: boolean;
  hasMetaMaskExtension: boolean;
  userAgent: string;
}

export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  const isMetaMaskBrowser = userAgent.includes('metamask');
  
  const hasMetaMaskExtension = typeof window !== 'undefined' && 
    typeof (window as any).ethereum !== 'undefined' && 
    (window as any).ethereum.isMetaMask === true;
  
  return {
    isMobile,
    isMetaMaskBrowser,
    hasMetaMaskExtension,
    userAgent
  };
};

export const shouldShowMetaMaskModal = (): boolean => {
  const browserInfo = detectBrowser();
  
  if (browserInfo.isMobile && !browserInfo.isMetaMaskBrowser) {
    return true;
  }
  
  if (!browserInfo.isMobile && !browserInfo.hasMetaMaskExtension) {
    return true;
  }
  
  return false;
};