import { CONST } from "./module/common/const";
import { router } from "./module/common/router";
import { getManager } from "./module/connect/getManager";
import { getToken } from "./module/connect/getToken";
import { getTba } from "./module/connect/getTba";
import { donate, getDonate } from "./module/connect/donate";
import getManagerConnect from "./module/connect/getManager";
import orderConnect from "./module/connect/order";
import parmawebcon from "./module/connect/parmaweb";
import setMeta from "./module/connect/metabuilder";
import homeSnipet from "./module/snipet/home";
import managerSnipet from "./module/snipet/manager";
import articleSnipet from "./module/snipet/article";
import commonSnipet from "./module/snipet/common";
import util from "./module/common/util";
// import getAkord from "./module/connect/getAkord";
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
const mainContents = document.getElementById("mainContents");

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
  const ca = await getManagerConnect.getCA("donate");
  const total = await getDonate("total", ca, params);
  const allTotalUsed = await getDonate("allTotalUsed", ca, params);
  const allTotalDonation = await getDonate("allTotalDonation", ca, params);

  const divDonateElement = document.createElement("div");
  divDonateElement.classList.add("ownerArea");
  mainContents.appendChild(divDonateElement);

  const donateTitle = document.createElement("h2");
  donateTitle.innerHTML = "Donation";
  donateTitle.appendChild(commonSnipet.span("Donation CA: "));
  donateTitle.appendChild(commonSnipet.eoa(ca));
  divDonateElement.appendChild(donateTitle);
  const donateContents = document.createElement("div");
  divDonateElement.appendChild(donateContents);

  const checkBalance = await util.checkBalance();
  if (checkBalance.eoa != undefined) {
    const donateBalance = await donate("balance", ca, params);
    const usedpoints = await donate("usedpoints", ca, params);
    const totaldonations = await donate("totaldonations", ca, params);

    if (donateBalance > 0) {
      donateContents.innerHTML +=
        "<p>Balance : " + donateBalance + " donatePoint" + "</p>";
    }
    if (totaldonations > 0) {
      donateContents.innerHTML +=
        "<p>Total donations : " + allTotalDonation + " donatePoint" + "</p>";
    }
    if (usedpoints > 0) {
      donateContents.innerHTML +=
        "<p>Used points : " + usedpoints + " donatePoint" + "</p>";
    }
  }

  if (allTotalDonation > 0) {
    donateContents.innerHTML +=
      "<p>Total donation (All dao) : " +
      allTotalDonation +
      " donatePoint" +
      "</p>";
  }
  if (allTotalUsed > 0) {
    donateContents.innerHTML +=
      "<p>Total used point (All dao) : " +
      allTotalUsed +
      " donatePoint" +
      "</p>";
  }
  divDonateElement.appendChild(donateContents);
}

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
  pElement.appendChild(commonSnipet.span("EOA: "));
  pElement.appendChild(
    commonSnipet.eoa(eoa, { link: "/assets/" + eoa, target: "" })
  );
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
  for (const key in allList) {
    if (allList[key][2] == "nft") {
      getToken("getInfo", allList[key][0], "").then((response) => {
        if (response[0] == router.params[2]) {
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

const checkRoute = () => {
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
  } else if (param1 === "tokens") {
    setTokenContracts((filter) => {
      return filter[3] == true;
    });
  } else if (param1 === "meta") {
    metabuilder();
  } else if (param1 === "parmaweb") {
    parmaweb();
  } else if (param1 === "test") {
    test();
  }
};

const test = async () => {
  console.log("TEST PLAY");
  //const result1 = await getAkord.getStack();
  //console.dir(result1);

  const orderCa = await getManagerConnect.getCA("order");
  const result2 = await orderConnect.getAsset(orderCa);
  console.dir(result2);
};

checkRoute();
util.checkMetamask();
