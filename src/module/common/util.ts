import { ethers } from "ethers";
import { CONST } from "../../module/common/const";
import { donate } from "../../module/connect/donate";

const connectWallet = document.getElementById("connectWallet");

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

export async function checkMetaMask() {
  if (window.ethereum) {
    if (window.ethereum.isMetaMask) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      try {
        const signer = await provider.getSigner();
        const eoa = await signer.getAddress();
        const balance = await provider.getBalance(eoa);
        const network = await provider.getNetwork();
        let symbol = network.name;
        if (symbol == "unknown") {
          symbol = CONST.DEFAULT_SYMBOL;
        }

        const ca = "0xD66bC4a4cfA6ef752a35822867E80aca5a4B0C9B";
        const dpoint = await donate("balance", ca, []);

        connectWallet.innerHTML =
          "EOA : " +
          eoa +
          "<br /> balance : " +
          waiToEth(balance) +
          " " +
          symbol;
        if (dpoint > 0) {
          connectWallet.innerHTML += " / donatePoint : " + dpoint + " pt";
        }

        window.ethereum.on("accountsChanged", async (accounts) => {
          console.dir(accounts);
          checkMetaMask();
        });
      } catch (error) {
        console.error("Error retrieving network currency symbol:", error);
      }
    }
  }
}

const utils = {
  checkMetaMask,
  getLocalTime,
  sleep,
  fetchData,
  isAddressesEqual,
  waiToEth,
  ethToWai,
};

export default utils;
