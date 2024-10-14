import { CONST } from "./module/common/const";
import { router } from "./module/common/router";
import getTokenConnect from "./module/connect/getToken";
import getTbaConnect from "./module/connect/getTbaConnect";
import { donate, getDonate } from "./module/connect/donateConnect";
import getManagerConnect from "./module/connect/getManager";
import setManagerConnect from "./module/connect/setManager";
import discordConnect from "./module/connect/discordConnect";
import editorConnect from "./module/connect/editorConnect";
import eoaDisconnect from "./module/connect/eoaDisconnect";
import memberSbtConnect from "./module/connect/memberSbtConnect";
import homeSnipet from "./module/snipet/home";
import managerSnipet from "./module/snipet/manager";
import articleSnipet from "./module/snipet/article";
import utils from "./module/common/utils";
import displaySnipet from "./module/snipet/display";
import accountSnipet from "./module/snipet/account";
import cSnip from "./module/snipet/common";

import adminSettings from "./module/admin/settings";

import permawebcon from "./module/connect/permaweb";
import setMeta from "./module/connect/metabuilder";

document.getElementById("headerTitle").innerHTML = CONST.HEADER_TITLE;
document.getElementById("pageTitle").innerHTML = CONST.HEADER_TITLE;
const mainContents = document.getElementById("mainContents");

async function adminSetting() {
  await adminSettings.getUI();
}
async function memberSbt() {
  const checkBalance = await utils.checkBalance();
  if (checkBalance.eoa == undefined) {
    displaySnipet.isNotConnect();
    return;
  }
  await memberSbtConnect.getUI();
}

async function disconnect() {
  const checkBalance = await utils.checkBalance();
  if (checkBalance.eoa == undefined) {
    displaySnipet.isNotConnect();
    return;
  }
  await eoaDisconnect.getUI();
}
async function editorLink() {
  const checkBalance = await utils.checkBalance();
  if (checkBalance.eoa == undefined) {
    displaySnipet.isNotConnect();
    return;
  }
  await editorConnect.getUI();
}
async function discordRegist() {
  const checkBalance = await utils.checkBalance();
  if (checkBalance.eoa == undefined) {
    displaySnipet.isNotConnect();
    return;
  }
  await discordConnect.getUI();
}
async function metabuilder() {
  await setMeta.getUI();
}
async function permaweb() {
  const checkBalance = await utils.checkBalance();
  if (checkBalance.eoa == undefined) {
    displaySnipet.isNotConnect();
    return;
  }
  await permawebcon.getUI();
}
async function setArticle() {
  articleSnipet.getMdPath();
}
async function setArticleDir(dir) {
  articleSnipet.getMdDir(dir);
}
const setContents = async () => {
  articleSnipet.getMdSiteMap();
};

async function setDonate(params) {
  const checkBalance = await utils.checkBalance();
  const creators = await getManagerConnect.getManager("creators");
  const calcElement = document.createElement("div");
  calcElement.classList.add("calcratorArea");
  mainContents.appendChild(calcElement);

  for (const key in creators) {
    if (creators[key][0] == checkBalance.eoa) {
      const creatorDonateElement = document.createElement("div");
      creatorDonateElement.classList.add("donateArea");
      mainContents.appendChild(creatorDonateElement);
      displaySnipet.creatorDonateList(creatorDonateElement, checkBalance.eoa);
    }
  }

  const divDonateElement = document.createElement("div");
  divDonateElement.classList.add("donateArea");
  mainContents.appendChild(divDonateElement);

  const ca = await getManagerConnect.getCA("donate");
  const donateTitle = document.createElement("h2");
  donateTitle.innerHTML = "Donation";
  donateTitle.appendChild(cSnip.span(" CA: "));
  donateTitle.appendChild(cSnip.eoa(ca));
  divDonateElement.appendChild(donateTitle);

  const PATH = router.lang + "/common/donate";
  const mdPath = CONST.BOT_API_URL + "contents/get/" + PATH;
  const path = `${PATH}.md`;

  articleSnipet.parseMdPage(mdPath, path, divDonateElement);

  const historyDiv = document.createElement("div");
  historyDiv.classList.add("creatorDonateHistory");
  divDonateElement.appendChild(historyDiv);

  const donationList = await donate("getDonationHistory", ca);
  for (let key = donationList.length - 1; key >= 0; key--) {
    const val = donationList[key];
    const log = document.createElement("p");
    log.appendChild(cSnip.span(utils.formatUnixTime(Number(val[1]) * 1000)));
    log.appendChild(cSnip.donateDetail(val[2]));
    log.appendChild(
      cSnip.span(utils.waiToEth(val[0]) + " " + CONST.DEFAULT_SYMBOL)
    );
    historyDiv.appendChild(log);
  }

  const allTotalUsed = await getDonate("allTotalUsed", ca, params);
  const allTotalDonation = await getDonate("allTotalDonation", ca, params);

  const donateContents = document.createElement("div");
  divDonateElement.appendChild(donateContents);

  if (checkBalance.eoa != undefined) {
    const donateBalance = await donate("balance", ca, params);
    const usedpoints = await donate("usedpoints", ca, params);
    const totaldonations = await donate("totaldonations", ca, params);

    if (totaldonations > 0) {
      donateContents.innerHTML +=
        "<p>Total donations : " +
        totaldonations +
        " " +
        CONST.DONATE_SYMBOL +
        "</p>";
    }
    if (usedpoints > 0) {
      donateContents.innerHTML +=
        "<p>Used points : " + usedpoints + " " + CONST.DONATE_SYMBOL + "</p>";
    }
    if (donateBalance > 0) {
      donateContents.innerHTML +=
        "<p>Balance : " + donateBalance + " " + CONST.DONATE_SYMBOL + "</p>";
    }
  }

  if (allTotalDonation > 0) {
    donateContents.innerHTML +=
      "<p>Total donation (All dao) : " +
      allTotalDonation +
      " " +
      CONST.DONATE_SYMBOL +
      "</p>";
  }
  if (allTotalUsed > 0) {
    donateContents.innerHTML +=
      "<p>Total used point (All dao) : " +
      allTotalUsed +
      " " +
      CONST.DONATE_SYMBOL +
      "</p>";
  }
  divDonateElement.appendChild(donateContents);
}

const setHome = async () => {
  mainContents.appendChild(await homeSnipet.getHome());
  await homeSnipet.getHomeContents();
  mainContents.appendChild(await homeSnipet.getItems());
  mainContents.appendChild(await homeSnipet.getGallarys());
};

const setContracts = async () => {
  await displaySnipet.displayManagedData("contracts", "CONTRACTS", (filter) => {
    return filter[3] == true;
  });
};

const setCreators = async () => {
  await displaySnipet.displayManagedData("creators", "CREATORS", false);
};

const setCreator = async () => {
  const PATH = router.lang + "/creator/" + router.params[2];
  const mdPath = CONST.BOT_API_URL + "contents/get/" + PATH;
  const path = `${PATH}.md`;
  articleSnipet.parseMdPage(mdPath, path);
  setOwnTokenContracts((filter) => {
    return filter[3] == true;
  });
};

const setAdmins = async () => {
  await displaySnipet.displayManagedData("admins", "Admins", false);
};

const setOwner = async (eoa) => {
  const divOwnerElement = document.createElement("div");
  divOwnerElement.classList.add("ownerArea");
  mainContents.appendChild(divOwnerElement);
  const ownerTitle = document.createElement("h2");
  ownerTitle.textContent = "Owner Info";
  divOwnerElement.appendChild(ownerTitle);
  const tbaOwner = await getTbaConnect.checkOwner(eoa);
  const usertype = await setManagerConnect.setManager("checkUser");
  const checkBalance = await utils.checkBalance();
  const minter = checkBalance.eoa;

  if (
    (usertype == "admin" || usertype == "creator") &&
    Number(eoa) == Number(checkBalance.eoa)
  ) {
    var link = document.createElement("a");
    link.classList.add("litelink");
    link.href = "/setting/";
    link.textContent = "  setting";
    ownerTitle.appendChild(link);
  }

  accountSnipet.showAccount(eoa, tbaOwner, divOwnerElement);

  const discordUser = await utils.getUserByEoa(minter);
  if (
    minter == tbaOwner ||
    (discordUser.discordUser &&
      discordUser.discordUser.Roles &&
      discordUser.discordUser.Roles.includes("Soul Binder"))
  ) {
    // ownerTitle.textContent = "SBT Mint for TBA";
    console.log("This tba ca:" + eoa);
    console.log("this tba owner:" + tbaOwner);
    console.log("minter eoa:" + minter);
    const mintableFormElm = document.createElement("div");
    mintableFormElm.classList.add("mintableArea");
    mintableFormElm.innerHTML =
      "<span><div class='minispinner'></div>mintable contract loading...</span>";
    mintableFormElm.style.display = "none";
    mainContents.appendChild(mintableFormElm);
    displaySnipet.setMintableForm(mintableFormElm, eoa);
  }
  setOwns(eoa);
};

const setOwns = async (eoa) => {
  const divAssetElement = document.createElement("div");
  divAssetElement.classList.add("assetArea");
  mainContents.appendChild(divAssetElement);

  const result = await getManagerConnect.getManager("contracts");
  displaySnipet.displayOwns(divAssetElement, result, eoa);
};

const setAssets = async (filter) => {
  const checkBalance = await utils.checkBalance();
  if (checkBalance.eoa == undefined) {
    window.location.href = "/tokens";
  }
  const result = await getManagerConnect.getManager("contracts");
  displaySnipet.displayAssets(result, filter);
};

const setTokenContracts = async (filter) => {
  const result = await getManagerConnect.getManager("contracts");
  displaySnipet.displayTokenContracts(result, filter);
};

const setOwnTokenContracts = async (filter) => {
  const allList = await getManagerConnect.getManager("contracts");
  for (const key in allList) {
    if (allList[key][2] == "nft") {
      console.log("Check Type:" + allList[key][0]);
      getTokenConnect
        .getToken("creator", allList[key][0], "")
        .then((response) => {
          console.log("setOwnTokenContracts checkCreator :" + allList[key]);
          console.dir("creator: " + response);
          console.dir("EOA: " + router.params[2]);
          if (response == router.params[2]) {
            displaySnipet.displayTokenContracts([allList[key]], filter);
          }
        });
    }
  }
};

const setToken = async () => {
  const params = router.params;
  const tokenBoundAccount = await getTbaConnect.getTbaInfo(
    params[2],
    params[3]
  );
  const tbaOwner = await getTbaConnect.checkOwner(tokenBoundAccount);
  const divElement = document.createElement("div");
  divElement.classList.add("nftArea");
  mainContents.appendChild(divElement);
  displaySnipet.displayToken(
    divElement,
    params[2],
    params[3],
    tokenBoundAccount,
    tbaOwner
  );
  if (tbaOwner) {
    setOwns(tokenBoundAccount);
  }
};
const mintToken = async () => {
  const params = router.params;
  const divElement = document.createElement("div");
  mainContents.appendChild(divElement);
  displaySnipet.displayMintUI(divElement, params);
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
  tokenName.textContent = await getTokenConnect.getToken(
    "name",
    router.params[2],
    ""
  );
  pElement.appendChild(tokenName);

  // SBTの場合ミントリンクエリア非表示
  const symbol = await getTokenConnect.getToken("symbol", router.params[2], "");
  // TODO サポーターの場合、他人のTBAにもミントできるようにする
  const checkBalance = await utils.checkBalance();
  const discordUser = await utils.getUserByEoa(checkBalance.eoa);
  if (
    symbol != "SBT" ||
    (discordUser.discordUser &&
      discordUser.discordUser.Roles &&
      discordUser.discordUser.Roles.includes("Soul Binder"))
  ) {
    const mintLinkArea = document.createElement("span");
    pElement.appendChild(mintLinkArea);
    displaySnipet.createMintLinkElm(router.params[2], mintLinkArea);
  }
  displaySnipet.displayTokens(divTokensElement, router.params[2], false);
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
  } else if (param1 === "contents" && param2 && param3) {
    setArticle();
  } else if (param1 === "contents" && param2 && !param3) {
    setArticleDir(param2);
  } else if (param1 === "contents") {
    setContents();
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
  } else if (param1 === "account" && param2) {
    setOwner(param2);
  } else if (param1 === "account") {
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
  } else if (param1 === "permaweb") {
    permaweb();
  } else if (param1 === "regist") {
    discordRegist();
  } else if (param1 === "editor") {
    editorLink();
  } else if (param1 === "disconnect") {
    disconnect();
  } else if (param1 === "membersbt") {
    memberSbt();
  } else if (param1 === "setting") {
    adminSetting();
  }
};

if (utils.containsBrowserName("mobile")) {
  document.querySelector("html").style.fontSize = "30px";
}

checkRoute();
utils.checkMetamask();
