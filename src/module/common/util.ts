import { ethers } from "ethers";
import { CONST } from "../../module/common/const";
import { donate } from "../../module/connect/donate";
import getManagerConnect from "../../module/connect/getManager";
import discordConnect from "../../module/connect/discordConnect";
import orderConnect from "../../module/connect/order";
import commonSnipet from "../snipet/common";

const connectWallet = document.getElementById("connectWallet");
const modalbase = document.getElementById("modalbase");
const closeModal = document.getElementById("closemodal");
const modalcontent = document.getElementById("modalcontent");
let dispmodal = false;

function containsBrowserName(browserName) {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes(browserName.toLowerCase());
}

function openInNativeBrowser(url) {
  window.open(url, "_blank");
}

closeModal.addEventListener("click", async () => {
  toggleModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleModal();
  }
});

const formatUnixTime = (unixTime) => {
  const date = new Date(Number(unixTime) * 1000); // UNIXタイムスタンプは秒単位なのでミリ秒に変換
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const getParmawebList = async () => {
  modalcontent.innerHTML = "<div class='spinner'></div>loading...";

  const orderCa = await getManagerConnect.getCA("order");
  const assetListOrg = await orderConnect.getAsset(orderCa);

  modalcontent.innerHTML = "parmaweb assets";
  const reload = document.createElement("span");
  reload.classList.add("litelink");
  reload.classList.add("reloadLink");
  reload.id = "vaultReload";
  reload.innerHTML = "reload";
  modalcontent.appendChild(reload);
  const vaultListDiv = document.createElement("div");
  modalcontent.appendChild(vaultListDiv);

  const assetList = assetListOrg.reverse();
  for (const key in assetList) {
    console.dir(assetList[key]);
    vaultListDiv.innerHTML +=
      "<br />" +
      "<span class='datetime'>" +
      formatUnixTime(assetList[key].Date) +
      "</span>" +
      ' <a href="' +
      assetList[key].Url +
      '" target="_blank">' +
      assetList[key].Filename +
      "</a>";
    addCopyButton(
      vaultListDiv,
      "COPYBUTTON_" + key,
      "COPYBTN",
      String(assetList[key].Url)
    );
  }
  const COPYBTNS = document.querySelectorAll(".COPYBTN");
  COPYBTNS.forEach((element) => {
    element.addEventListener("click", () => {
      const copytext = element.getAttribute("data-clipboard-text");
      navigator.clipboard
        .writeText(copytext)
        .then(function () {
          alert("URLがクリップボードにコピーされました");
        })
        .catch(function (error) {
          alert("コピーに失敗しました: " + error);
        });
    });
  });

  document
    .getElementById("vaultReload")
    .addEventListener("click", function (event) {
      getParmawebList();
    });
};

const addCopyButton = (
  elm: HTMLElement,
  id: string,
  classname: string,
  url: string
) => {
  const copybtn = document.createElement("span");
  copybtn.id = id;
  copybtn.classList.add(classname);
  copybtn.innerHTML = "copy";
  copybtn.classList.add("liteLink");
  copybtn.classList.add("copyLink");
  copybtn.setAttribute("data-clipboard-text", url);

  const copyicon = document.createElement("i");
  copybtn.appendChild(copyicon);
  copyicon.classList.add("far");
  copyicon.classList.add("fa-copy");
  copyicon.classList.add("fa-fw");

  elm.appendChild(copybtn);
  document.getElementById(id).addEventListener("click", function (event) {
    console.log(id + ":" + url);
  });
};

const toggleModal = async () => {
  if (dispmodal) {
    modalbase.classList.remove("active");
    dispmodal = false;
  } else {
    modalbase.classList.add("active");
    dispmodal = true;
    const chk = await checkBalance();
    if (chk.balance != undefined) {
      utils.getParmawebList();
    }
  }
};

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
  if (String(balanceData.chainId) != String(CONST.BC_NETWORK_ID)) {
    connectWallet.innerHTML =
      "NETWORK DIFFERENT | PLEASE CONNECT " +
      CONST.BC_NETWORK_NAME +
      " NETWORK ";
  } else if (balanceData.eoa != undefined) {
    connectWallet.innerHTML = "";
    var discordArea = document.createElement("div");
    discordArea.classList.add("walletDiscordArea");
    connectWallet.appendChild(discordArea);

    discordConnect.getUserByEoa(balanceData.eoa).then((discordUser) => {
      if (discordUser.Eoa) {
        discordArea.appendChild(commonSnipet.discordByEoa(discordUser));
      }
    });

    connectWallet.appendChild(commonSnipet.span("EOA: "));
    connectWallet.appendChild(
      commonSnipet.eoa(balanceData.eoa, {
        link: "#",
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

const callCheckMetamask = async () => {
  try {
    await checkMetamask();
  } catch (error) {
    console.error("Error handling accountsChanged event:", error);
  }
};

export async function checkBalance() {
  let chainId: string;
  let eoa: string;
  let balance: bigint;
  let symbol: string;
  let dpoint: number;
  if (window.ethereum && window.ethereum.isMetaMask) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      chainId = String(network.chainId);
      if (chainId == CONST.BC_NETWORK_ID) {
        eoa = await signer.getAddress();
        balance = await provider.getBalance(eoa);
        symbol = network.name;
        if (symbol == "unknown") {
          symbol = CONST.DEFAULT_SYMBOL;
        }
        const ca = await getManagerConnect.getCA("donate");
        dpoint = await donate("balance", ca, []);
      }
      window.ethereum.removeListener("accountsChanged", callCheckMetamask);
      window.ethereum.removeListener("chainChanged", callCheckMetamask);
      window.ethereum.on("accountsChanged", callCheckMetamask);
      window.ethereum.on("chainChanged", callCheckMetamask);
    } catch (error) {
      console.info("wallet not connected");
      console.error("Error details:", error);
    }
  }
  return {
    chainId: chainId,
    eoa: eoa,
    balance: balance,
    symbol: symbol,
    dpoint: dpoint,
  };
}

const utils = {
  containsBrowserName,
  checkMetamask,
  getLocalTime,
  sleep,
  fetchData,
  isAddressesEqual,
  waiToEth,
  ethToWai,
  checkBalance,
  toggleModal,
  getParmawebList,
  formatUnixTime,
  openInNativeBrowser,
};

export default utils;
