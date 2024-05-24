import { CONST } from "./module/common/const";
import { router } from "./module/common/router";
import { getManager } from "./module/connect/getManager";
import { getToken } from "./module/connect/getToken";
import { getTba } from "./module/connect/getTba";
import { donate } from "./module/connect/donate";
import parmawebcon from "./module/connect/parmaweb";
import setMeta from "./module/connect/metabuilder";
import homeSnipet from "./module/snipet/home";
import managerSnipet from "./module/snipet/manager";
import articleSnipet from "./module/snipet/article";
import util from "./module/common/util";
import {
  displayAssets,
  displayManagedData,
  displayTokenContracts,
  displayTokens,
  displayToken,
  displayOwns,
  displayMintUI,
} from "./module/snipet/display";

document.getElementById("headerTitle").innerHTML = CONST.HEADER_TITLE;
document.getElementById("pageTitle").innerHTML = CONST.HEADER_TITLE;
const connectButton = document.getElementById("connectButton");
const mainContents = document.getElementById("mainContents");
/*
const modalbase = document.getElementById("modalbase");
const modalcontent = document.getElementById("modalcontent");
let dispmodal = false;
let connected = null;
*/

async function metabuilder() {
  await setMeta.getUI();
}
async function parmaweb() {
  await parmawebcon.getUI();
}
async function setArticle() {
  articleSnipet.getMdPath();
  articleSnipet.getMdDir();
}
async function setDonate(params) {
  const ca = "0xD66bC4a4cfA6ef752a35822867E80aca5a4B0C9B";
  const total = await donate("total", ca, params);
  const balance = await donate("balance", ca, params);
  const usedpoints = await donate("usedpoints", ca, params);
  const totaldonations = await donate("totaldonations", ca, params);
  const allTotalUsed = await donate("allTotalUsed", ca, params);
  const allTotalDonation = await donate("allTotalDonation", ca, params);

  const divDonateElement = document.createElement("div");
  divDonateElement.classList.add("ownerArea");
  mainContents.appendChild(divDonateElement);

  const donateTitle = document.createElement("h2");
  donateTitle.innerHTML =
    "<h1>Donation</h1>" + "<p>Donation CA : " + ca + "</p>";

  if (balance > 0) {
    donateTitle.innerHTML +=
      "<p>Balance : " + balance + " donatePoint" + "</p>";
  }
  if (totaldonations > 0) {
    donateTitle.innerHTML +=
      "<p>Total donations : " + allTotalDonation + " donatePoint" + "</p>";
  }
  if (usedpoints > 0) {
    donateTitle.innerHTML +=
      "<p>Used points : " + usedpoints + " donatePoint" + "</p>";
  }

  if (allTotalDonation > 0) {
    donateTitle.innerHTML +=
      "<p>Total donation (All dao) : " +
      allTotalDonation +
      " donatePoint" +
      "</p>";
  }
  if (allTotalUsed > 0) {
    donateTitle.innerHTML +=
      "<p>Total used point (All dao) : " +
      allTotalUsed +
      " donatePoint" +
      "</p>";
  }

  divDonateElement.appendChild(donateTitle);
}

connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    util.checkMetaMask();
  } else {
    alert("メタマスクをインストールしてください");
  }
});

const setHome = async () => {
  homeSnipet.getHome();
};
const setContracts = async () => {
  await displayManagedData("contracts", "CONTRACTS", (filter) => {
    return filter[3] == true;
  });
};

const setCreators = async () => {
  await displayManagedData("creators", "CREATORS", false);
};

const setCreator = async () => {
  /*
  await displayManagedData("creators", "CREATOR", (filter) => {
    return filter[0] == router.params[2] && filter[3] == true;
  });
  */
  const mdPath =
    CONST.ARTICLE_REPO_URL + "md/ja/creator/" + router.params[2] + ".md";
  articleSnipet.parseMdPage(mdPath);
  setOwnTokenContracts((filter) => {
    return filter[3] == true;
  });
};

const setAdmins = async () => {
  await displayManagedData("admins", "Admins", false);
};

const setOwner = async (eoa) => {
  const divOwnerElement = document.createElement("div");
  divOwnerElement.classList.add("ownerArea");
  mainContents.appendChild(divOwnerElement);

  const ownerTitle = document.createElement("h2");
  ownerTitle.textContent = "Owner Info";
  divOwnerElement.appendChild(ownerTitle);

  const pElement = document.createElement("p");
  pElement.textContent = "EOA : " + eoa;
  divOwnerElement.appendChild(pElement);

  const tbaOwner = await getTba.checkOwner(eoa);
  const tbaToken = await getTba.checkToken(eoa);
  if (tbaOwner) {
    pElement.textContent = "TokenBoundAccount : " + eoa;
    const tbaOwnerElement = document.createElement("p");
    tbaOwnerElement.innerHTML =
      "TBA OWNER: <a href='/assets/" + tbaOwner + "'>" + tbaOwner + "</a>";
    divOwnerElement.appendChild(tbaOwnerElement);
    const tbaTokenElement = document.createElement("p");
    tbaTokenElement.innerHTML =
      "TOKEN: <a href='/tokens/" +
      tbaToken[1] +
      "/" +
      tbaToken[2] +
      "'>" +
      tbaToken[1] +
      "/" +
      tbaToken[2] +
      "</a>";
    divOwnerElement.appendChild(tbaTokenElement);
    console.dir(tbaToken);
  }
  setOwns(eoa);
};

const setOwns = async (eoa) => {
  const divAssetElement = document.createElement("div");
  divAssetElement.classList.add("assetArea");
  mainContents.appendChild(divAssetElement);

  const result = await getManager("contracts");
  displayOwns(divAssetElement, result, eoa);
};

const setAssets = async (filter) => {
  const result = await getManager("contracts");
  displayAssets(result, filter);
};

const setTokenContracts = async (filter) => {
  const result = await getManager("contracts");
  displayTokenContracts(result, filter);
};

const setOwnTokenContracts = async (filter) => {
  const allList = await getManager("contracts");
  //displayTokenContracts(allList, filter);
  console.log("ここですべて判定する");
  for (const key in allList) {
    if (allList[key][2] == "nft") {
      getToken("getInfo", allList[key][0], "").then((response) => {
        if (response[0] == router.params[2]) {
          console.dir("owner :" + router.params[2]);
          displayTokenContracts([allList[key]], filter);
        }
      });
    }
  }
};

const setToken = async () => {
  const params = router.params;
  const tokenBoundAccount = await getTba.getTbaInfo(params[2], params[3]);
  const tbaOwner = await getTba.checkOwner(tokenBoundAccount);
  const divElement = document.createElement("div");
  divElement.classList.add("nftArea");
  mainContents.appendChild(divElement);
  displayToken(divElement, params[2], params[3], tokenBoundAccount, tbaOwner);
  if (tbaOwner) {
    console.dir("TBAがセットされていればASSET取得");
    setOwns(tokenBoundAccount);
  }
};
const mintToken = async () => {
  const params = router.params;
  const divElement = document.createElement("div");
  mainContents.appendChild(divElement);
  displayMintUI(divElement, params);
};

const setTokens = async () => {
  const divTokensElement = document.createElement("div");
  divTokensElement.classList.add("tokensList");
  mainContents.appendChild(divTokensElement);

  divTokensElement.innerHTML = "";
  const divElement = document.createElement("div");
  divTokensElement.appendChild(divElement);

  // ----------------------------------------
  const pElement = document.createElement("h3");
  divElement.appendChild(pElement);

  var tokenLink = document.createElement("a");
  tokenLink.href = "/tokens/";
  tokenLink.textContent = "NftCollection";
  pElement.appendChild(tokenLink);

  const spanSpace = document.createElement("span");
  spanSpace.textContent = " | ";
  pElement.appendChild(spanSpace);

  const tokenName = document.createElement("span");
  tokenName.textContent = await getToken("name", router.params[2], "");
  pElement.appendChild(tokenName);

  var mintLink = document.createElement("a");
  mintLink.classList.add("litelink");
  mintLink.classList.add("mintlink");
  mintLink.href = "/tokens/" + router.params[2] + "/mint/";
  mintLink.textContent = "mint";
  pElement.appendChild(mintLink);

  // ----------------------------------------

  displayTokens(divTokensElement, router.params[2], false);
};

/*
const getTbaInfo = async () => {
  const result = await getManager("contracts");
  var tbaContracts = result.filter(function (contract) {
    return contract[2] == "tba";
  });

  const tba = [];
  for (const key in tbaContracts) {
    console.dir(tbaContracts[key]);
    const tokenBoundAccount = await getTba.getAddress(
      tbaContracts[key][1],
      tbaContracts[key][0],
      CONST.BC_NETWORK_ID,
      router.params[2], //tokenContract: string,
      router.params[3], // tokenId: string,
      CONST.TBA_SALT
    );
    tba.push(tokenBoundAccount);
  }
  if (tba.length > 1) {
    alert("このトークンには2つ以上のTBAが結びついています。");
    console.dir(tba);
  }
  if (tba.length > 0) {
    return tba[0];
  } else {
    return null;
  }
};
*/

/*
document.addEventListener("keydown", function (event) {
  //console.log(event.key);
  if (event.key === "Escape") {
    toggleModal();
  }
});

const toggleModal = () => {
  if (dispmodal) {
    modalbase.classList.remove("active");
    dispmodal = false;
  } else {
    modalbase.classList.add("active");
    dispmodal = true;
  }
};
*/

const checkRoute = () => {
  console.log("checkRoute" + router.params);
  const params = router.params;
  const param1 = params[1];
  const param2 = params[2];
  const param3 = params[3];
  const param4 = params[4];
  const param5 = params[5];

  if (param1 == "") {
    setHome();
  } else if (param1 === "contract1") {
    setContracts();
  } else if (param1 === "creators" && param2) {
    setCreator();
  } else if (param1 === "creators") {
    setCreators();
  } else if (param1 === "article") {
    setArticle();
  } else if (param1 === "donate") {
    setDonate(params);
  } else if (param1 === "admins" && param2 && param3 && param4 && param5) {
    managerSnipet.control4Set(param2, param3, param4, param5);
  } else if (param1 === "admins" && param2 && param3 && param4) {
    managerSnipet.control3Set(param2, param3, param4);
  } else if (param1 === "admins" && param2 && param3) {
    managerSnipet.control2Set(param2, param3);
  } else if (param1 === "admins" && param2) {
    setCreator();
  } else if (param1 === "admins") {
    setAdmins();
  } else if (param1 === "assets" && param2) {
    setOwner(param2);
  } else if (param1 === "assets") {
    setAssets((filter) => {
      return filter[3] == true;
    });
  } else if (param1 === "tokens" && param2 && param3 == "mint") {
    mintToken();
  } else if (param1 === "tokens" && param2 && param3) {
    setToken();
  } else if (param1 === "tokens" && param2 && !param3) {
    setTokens();
    console.log("caOnly" + params);
  } else if (param1 === "tokens") {
    setTokenContracts((filter) => {
      return filter[3] == true;
    });
  } else if (param1 === "meta") {
    metabuilder();
  } else if (param1 === "parmaweb") {
    parmaweb();
  }
};

checkRoute();
util.checkMetaMask();
