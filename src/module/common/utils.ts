import { ethers } from "ethers";
import { LANGSET } from "../common/lang";
import { CONST } from "../../module/common/const";
import { donate } from "../../module/connect/donate";
import getManagerConnect from "../../module/connect/getManager";
import discordConnect from "../../module/connect/discordConnect";
import orderConnect from "../../module/connect/order";
import commonSnipet from "../snipet/common";
import getTokenConnect from "../../module/connect/getToken";
import getTbaConnect from "../../module/connect/getTbaConnect";
import setElement from "../snipet/setElement";

const connectWallet = document.getElementById("connectWallet");
const modalbase = document.getElementById("modalbase");
const closeModal = document.getElementById("closemodal");
const modalcontent = document.getElementById("modalcontent");
let dispmodal = false;

const isContract = async (address) => {
  const provider = new ethers.JsonRpcProvider(CONST.RPC_URL);
  const code = await provider.getCode(address);
  return code !== "0x" && code !== "0x0";
};

function containsBrowserName(browserName) {
  var userAgent = navigator.userAgent.toLowerCase();
  console.log(userAgent.toLowerCase());
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

const getParmawebList = async (data = []) => {
  console.log("getParmawebList data:" + JSON.stringify(data));
  modalcontent.innerHTML = "<div class='spinner'></div>loading...";

  const orderCa = await getManagerConnect.getCA("order");
  const assetListOrg = await orderConnect.getAsset(orderCa);

  modalcontent.innerHTML = "permaweb assets";
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
    let dispcheck = true;
    const filename = assetList[key].Filename as String;
    if (data[0] == "jsonOnly") {
      dispcheck = filename.includes(".json");
    }
    if (data[0] == "notJson") {
      dispcheck = !filename.includes(".json");
    }
    if (assetList[key].Url == "upload_waiting") {
      dispcheck = false;
    }
    if (dispcheck) {
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
  }
  const COPYBTNS = document.querySelectorAll(".COPYBTN");
  COPYBTNS.forEach((element) => {
    element.addEventListener("click", () => {
      const copytext = element.getAttribute("data-clipboard-text");
      navigator.clipboard
        .writeText(copytext)
        .then(function () {
          alert("URL" + LANGSET("COPYED"));
        })
        .catch(function (error) {
          alert(LANGSET("COPYFAILED") + error);
        });
    });
  });

  document
    .getElementById("vaultReload")
    .addEventListener("click", function (event) {
      getParmawebList(data);
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

const toggleModal = async (mode = "permawebList", data = []) => {
  console.log(mode);
  if (dispmodal) {
    modalbase.classList.remove("active");
    dispmodal = false;
  } else {
    modalbase.classList.add("active");
    dispmodal = true;
    const chk = await checkBalance();
    if (mode == "permawebList" && chk.balance != undefined) {
      utils.getParmawebList(data);
    }
    if (mode == "replaceValue") {
      return getReplaceValue(data);
    }
  }
};

function getReplaceValue(data) {
  console.dir(data);
  modalcontent.innerHTML = "Replace Attrebute";
  const inputElm = document.createElement("div");
  const setAttrForm = setElement.makeInput(
    "traittype",
    "traittype",
    "BaseInput",
    "TRAIT TYPE"
  );
  setAttrForm.classList.add("w7p");
  inputElm.appendChild(setAttrForm);
  const attrSet = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "SET",
    "SET"
  );
  attrSet.classList.add("w3p");
  inputElm.appendChild(attrSet);
  const setValForm = setElement.makeTextarea(
    "attrvalue",
    "BaseTextarea",
    "VALUE",
    ""
  );
  setValForm.classList.add("wfull");
  inputElm.appendChild(setValForm);
  modalcontent.appendChild(inputElm);
  return {
    setAttrForm,
    attrSet,
    setValForm,
  };
}
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
    console.dir(response);
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

const getTbaInfoByEoa = async (eoa) => {
  const tbaToken = await getTbaConnect.checkToken(eoa);
  if (tbaToken) {
    const tbaToken = await getTbaConnect.checkToken(eoa);
    const caName = await getTokenConnect.getToken("name", tbaToken[1]);
    const tokenUri = await getTokenConnect.getToken(
      "tokenURI",
      tbaToken[1],
      tbaToken[2]
    );
    const tokenInfo = await fetchData(tokenUri);
    return {
      eoa: eoa,
      ca: tbaToken[1],
      caName: caName,
      tokenId: tbaToken[2],
      tokenUri: tokenUri,
      tokenInfo: tokenInfo,
    };
  } else {
    let type = "";
    if (await isContract(eoa)) {
      type = "ca";
    } else {
      type = "eoa";
    }
    return { type: type };
  }
};

const getUserByEoa = async (eoa) => {
  let type = "none";
  const tbaInfo = await getTbaInfoByEoa(eoa);
  const discordUser = await discordConnect.getUserByEoa(eoa);
  if (tbaInfo.tokenUri) {
    type = "tba";
    console.dir(tbaInfo);
  } else {
    type = tbaInfo.type;
  }
  if (discordUser.DiscordId) {
    type = "discordConnect";
  }
  return {
    type: type,
    discordUser: discordUser,
    tbaInfo: tbaInfo,
    eoa: eoa,
  };
};

export const checkMetamask = async () => {
  const balanceData = await checkBalance();
  if (String(balanceData.chainId) != String(CONST.BC_NETWORK_ID)) {
    connectWallet.innerHTML =
      "PLEASE CONNECT " + CONST.BC_NETWORK_NAME + " NETWORK ";
  } else if (balanceData.eoa != undefined) {
    connectWallet.innerHTML = "";
    var discordArea = document.createElement("div");
    discordArea.classList.add("walletOwnerArea");
    connectWallet.appendChild(discordArea);

    getUserByEoa(balanceData.eoa).then((eoaUser) => {
      //メタマスクでつなぐ場合TBAはない
      if (eoaUser.type == "discordConnect") {
        discordArea.appendChild(
          commonSnipet.dispDiscordUser(eoaUser.discordUser)
        );
      }
    });

    connectWallet.appendChild(
      commonSnipet.eoa(
        balanceData.eoa,
        {
          link: "#",
          target: "",
          icon: "copy",
        },
        "wallet"
      )
    );

    connectWallet.appendChild(
      commonSnipet.labeledElm("span", String(waiToEth(balanceData.balance)), [
        "fa-solid",
        "fa-coins",
      ])
    );

    (document.getElementById("accountLink") as HTMLLinkElement).href =
      "/account/" + balanceData.eoa;

    if (balanceData.dpoint > 0) {
      connectWallet.appendChild(
        commonSnipet.labeledElm("span", String(balanceData.dpoint), [
          "fa-solid",
          "fa-circle-dollar-to-slot",
        ])
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

const getMaticPrice = async () => {
  const url = "https://api.coingecko.com/api/v3/simple/price";
  const params = new URLSearchParams({
    ids: "matic-network",
    vs_currencies: "usd,jpy",
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const maticPriceInUsd = data["matic-network"].usd;
    const jpy = data["matic-network"].jpy;
    const usdToMatic = 1 / maticPriceInUsd;

    console.log(`1ドルは約${usdToMatic.toFixed(4)} MATICです。`);
    console.log(`1MATICは約${jpy.toFixed(4)} JPYです。`);
    return {
      matic_usd: usdToMatic.toFixed(4),
      jpy_matic: jpy.toFixed(4),
    };
  } catch (error) {
    console.error("価格データの取得中にエラーが発生しました:", error);
  }
};
const getMaticYen = async () => {
  const url = "https://api.coingecko.com/api/v3/simple/price";
  const params = new URLSearchParams({
    ids: "matic-network",
    vs_currencies: "jpy",
  });
  try {
    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const jpy = data["matic-network"].jpy;
    return 1 / jpy;
  } catch (error) {
    console.error("価格データの取得中にエラーが発生しました:", error);
  }
};
const shortname = (text: string, prenum, afternum) => {
  const front = text.substring(0, prenum);
  const end = text.substring(text.length - afternum);
  return front + "..." + end;
};

const utils = {
  isContract,
  getMaticPrice,
  getMaticYen,
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
  getUserByEoa,
  getTbaInfoByEoa,
  shortname,
};

export default utils;
