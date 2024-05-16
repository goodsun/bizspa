function roundToDecimalPlace(num, decimalPlaces) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(num * factor) / factor;
}

export const getLocalTime = () => {
  return new Date().toLocaleTimeString() + "." + new Date().getMilliseconds();
};

export const sleep = (waitTime) => {
  if (waitTime < 1) {
    return;
  }
  const startTime = Date.now();
  while (Date.now() - startTime < waitTime);
};

export const fetchData = async (Url) => {
  // IPSFの場合URLを置換
  Url = Url.replace("ipfs://", "https://ipfs.io/ipfs/");
  console.log(getLocalTime() + " fetchData:" + Url);
  try {
    const response = await fetch(Url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

export const isAddressesEqual = (address1: string, address2: string) => {
  return address1.toLowerCase() === address2.toLowerCase();
};

export const waiToEth = (input) => {
  return roundToDecimalPlace(Number(input) / 1000000000000000000, 4);
};

export const ethToWai = (input) => {
  return BigInt(input * 1000000000000000000);
};

const utils = {
  getLocalTime,
  sleep,
  fetchData,
  isAddressesEqual,
  waiToEth,
  ethToWai,
};

export default utils;
