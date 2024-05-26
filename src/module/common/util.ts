import { ethers } from "ethers";
import { CONST } from "../../module/common/const";
import { donate } from "../../module/connect/donate";
import getManagerConnect from "../../module/connect/getManager";
import commonSnipet from "../snipet/common";

const connectWallet = document.getElementById("connectWallet");
const assetLink = document.getElementById("assetLink");
const adminLink = document.getElementById("adminLink");

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
  return (
    address1 != undefined &&
    address2 != undefined &&
    address1.toLowerCase() === address2.toLowerCase()
  );
};

export const waiToEth = (input) => {
  return roundToDecimalPlace(Number(input) / 1000000000000000000, 4);
};

export const ethToWai = (input) => {
  return BigInt(Math.round(input * 1000000000000000000));
};

export const checkMetamask = async () => {
  const balanceData = await checkBalance();
  if (balanceData.eoa != undefined) {
    connectWallet.innerHTML = "";
    connectWallet.appendChild(commonSnipet.span("EOA: "));
    connectWallet.appendChild(
      commonSnipet.eoa(balanceData.eoa, {
        link: "/assets/" + balanceData.eoa,
        target: "",
      })
    );
    connectWallet.appendChild(commonSnipet.span(" balance: "));
    connectWallet.appendChild(
      commonSnipet.span(String(waiToEth(balanceData.balance)))
    );
    connectWallet.appendChild(commonSnipet.span(" " + balanceData.symbol));

    (document.getElementById("assetLink") as HTMLLinkElement).href =
      "/assets/" + balanceData.eoa;
    if (balanceData.dpoint > 0) {
      connectWallet.appendChild(
        commonSnipet.span(" / " + balanceData.dpoint + " donationPoint")
      );
    }
  } else {
    connectWallet.innerHTML =
      "wallet not connected. please connect <a href='https://metamask.io/' target='_blank'>metamask</a>";
  }
};

export async function checkBalance() {
  let eoa: string;
  let balance: bigint;
  let symbol: string;
  let dpoint: number;
  console.log("begin checkBalance");
  if (window.ethereum && window.ethereum.isMetaMask) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      eoa = await signer.getAddress();
      balance = await provider.getBalance(eoa);
      const network = await provider.getNetwork();
      symbol = network.name;
      if (symbol == "unknown") {
        symbol = CONST.DEFAULT_SYMBOL;
      }
      const ca = await getManagerConnect.getCA("donate");
      dpoint = await donate("balance", ca, []);
      window.ethereum.on("accountsChanged", async (accounts) => {
        try {
          await checkMetamask();
        } catch (error) {
          console.error("Error handling accountsChanged event:", error);
        }
      });
    } catch (error) {
      console.info("wallet not connected");
      console.error("Error details:", error);
    }
  }
  console.log("end checkBalance");
  return {
    eoa: eoa,
    balance: balance,
    symbol: symbol,
    dpoint: dpoint,
  };
}

const utils = {
  checkMetamask,
  getLocalTime,
  sleep,
  fetchData,
  isAddressesEqual,
  waiToEth,
  ethToWai,
  checkBalance,
};

export default utils;
