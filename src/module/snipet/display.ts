import getTokenConnect from "../connect/getToken";
import { LANGSET } from "../common/lang";
import { getOwn } from "../connect/getOwn";
import utils from "../common/utils";
import { router } from "../common/router";
import detailDisplay from "./detailDisplay";
import commonSnipet from "../snipet/common";
import setElement from "./setElement";
import { CONST } from "../common/const";
import getManagerConnect from "../connect/getManager";
import getTbaConnect from "../connect/getTbaConnect";
import setToken from "../connect/setToken";
import donateConnect from "../connect/donate";
import manageService from "../service/manageService";
const mainContents = document.getElementById("mainContents");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getDiffTime = (date: string): string => {
  const targetDate = new Date(date);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - targetDate.getTime();

  const millisecondsPerMinute = 60 * 1000;
  const millisecondsPerHour = 60 * 60 * 1000;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const millisecondsPerWeek = 7 * millisecondsPerDay;
  const millisecondsPerMonth = 30 * millisecondsPerDay;
  const millisecondsPerYear = 365 * millisecondsPerDay;

  if (diffInMilliseconds >= millisecondsPerYear) {
    const yearsDifference = Math.floor(
      diffInMilliseconds / millisecondsPerYear
    );
    return `${yearsDifference} year${yearsDifference !== 1 ? "s" : ""} ago`;
  } else if (diffInMilliseconds >= millisecondsPerMonth) {
    const monthsDifference = Math.floor(
      diffInMilliseconds / millisecondsPerMonth
    );
    return `${monthsDifference} month${monthsDifference !== 1 ? "s" : ""} ago`;
  } else if (diffInMilliseconds >= millisecondsPerWeek) {
    const weeksDifference = Math.floor(
      diffInMilliseconds / millisecondsPerWeek
    );
    return `${weeksDifference} week${weeksDifference !== 1 ? "s" : ""} ago`;
  } else if (diffInMilliseconds >= millisecondsPerDay) {
    const daysDifference = Math.floor(diffInMilliseconds / millisecondsPerDay);
    return `${daysDifference} day${daysDifference !== 1 ? "s" : ""} ago`;
  } else if (diffInMilliseconds >= millisecondsPerHour) {
    const hoursDifference = Math.floor(
      diffInMilliseconds / millisecondsPerHour
    );
    return `${hoursDifference} hour${hoursDifference !== 1 ? "s" : ""} ago`;
  } else {
    const minutesDifference = Math.floor(
      diffInMilliseconds / millisecondsPerMinute
    );
    return `${minutesDifference} minute${
      minutesDifference !== 1 ? "s" : ""
    } ago`;
  }
};

export const displayMintUI = async (targetElem, params) => {
  const balance = await utils.checkBalance();
  const mintableInfo = await getTokenConnect.getTokenInfo(params[2]);
  console.dir(mintableInfo);
  console.log("creatorOlny:" + mintableInfo.creatorOnly);
  const balanceElement = document.createElement("p");
  balanceElement.innerHTML =
    "<h2>" + mintableInfo.name + " MINT PAGE" + "</h2>";
  targetElem.appendChild(balanceElement);

  let mintable = true;

  console.dir(mintableInfo.creatorOnly);
  if (
    mintableInfo.creatorOnly &&
    !utils.isAddressesEqual(mintableInfo.creator, balance.eoa) &&
    !utils.isAddressesEqual(mintableInfo.owner, balance.eoa)
  ) {
    balanceElement.innerHTML += LANGSET("CREATOR_ONLY");
    mintable = false;
  }

  if (balance.dpoint < mintableInfo.needPoint) {
    balanceElement.innerHTML +=
      LANGSET("NOT_ENOUGH_DBIZ") + mintableInfo.needPoint + " pt";
    mintable = false;
  }

  if (balance.chainId != CONST.BC_NETWORK_ID) {
    balanceElement.innerHTML +=
      "PLEASE CONNECT " + CONST.BC_NETWORK_NAME + " NETWORK ";
    mintable = false;
  }

  if (mintable) {
    if (mintableInfo.needPoint > 0) {
      balanceElement.innerHTML +=
        "<p> USE POINT:" + mintableInfo.needPoint + " pt</p>";
    }
    detailDisplay.mintForm(targetElem);
  }
};

export const displayToken = async (
  displayTokenElement,
  ca,
  id,
  tokenBoundAccount,
  tbaOwner
) => {
  console.log("displayToken:" + ca + "/" + id);
  const divElement = document.createElement("div");
  const tokenUri = await getTokenConnect.getToken("tokenURI", ca, id);
  const caName = await getTokenConnect.getToken("name", ca, id);
  const caSymbol = await getTokenConnect.getToken("symbol", ca, id);
  const owner = await getTokenConnect.getToken("ownerOf", ca, id);
  const burnable = await setToken.burnable(ca, id);

  divElement.classList.add("tokenUri_" + tokenUri);
  displayTokenElement.appendChild(divElement);

  const divTbaElement = document.createElement("div");
  divTbaElement.classList.add("TbaInfo");
  displayTokenElement.appendChild(divTbaElement);

  const balance = await utils.checkBalance();
  const tbaInfoElement = document.createElement("p");

  if (!tbaOwner) {
    if (
      balance.balance != undefined &&
      utils.isAddressesEqual(owner, balance.eoa)
    ) {
      detailDisplay.tbaRegist(tbaInfoElement, ca, id, balance.eoa);
    }
  }

  divTbaElement.appendChild(tbaInfoElement);

  const pElement = document.createElement("p");
  pElement.classList.add("tokenBreadCrumb");
  divElement.appendChild(pElement);

  var tokenLink = document.createElement("a");
  tokenLink.href = "/tokens/";
  tokenLink.textContent = "NftCollection";
  pElement.appendChild(tokenLink);

  const spanSpace = document.createElement("span");
  spanSpace.textContent = " | ";
  pElement.appendChild(spanSpace);

  var caLink = document.createElement("a");
  caLink.href = "/tokens/" + ca;
  caLink.textContent = caName;
  pElement.appendChild(caLink);

  const spanSpace2 = document.createElement("span");
  spanSpace2.textContent = " #" + id;
  pElement.appendChild(spanSpace2);

  var openseaLink = document.createElement("a");
  openseaLink.classList.add("openseaLink");
  openseaLink.href = "https://opensea.io/assets/matic/" + ca + "/" + id;
  openseaLink.innerHTML = '<i class="opensea">';
  openseaLink.target = "_blank";
  pElement.appendChild(openseaLink);

  const Url = CONST.BOT_API_URL + "shop/eoa/" + owner;
  try {
    const response = await fetch(Url);
    const shopJson = await response.json();
    const shopinfo = JSON.parse(shopJson.Json)[router.lang];
    var shopInfoArea = document.createElement("div");
    shopInfoArea.classList.add("shopInfoArea");
    var shopTitle = document.createElement("h2");
    shopTitle.classList.add("shopTitle");
    shopTitle.innerHTML = "shop info : " + shopinfo.name;
    shopInfoArea.appendChild(shopTitle);

    var shopMainArea = document.createElement("div");
    shopMainArea.classList.add("shopMainArea");

    var squareImg = document.createElement("div");
    squareImg.classList.add("shopThumbSquare");
    var shopImg = document.createElement("img");
    shopImg.src = shopJson.Imgurl;
    shopImg.classList.add("shopThumb");
    squareImg.appendChild(shopImg);
    var infoArea = document.createElement("div");
    infoArea.classList.add("shopDetail");

    infoArea.appendChild(
      commonSnipet.labeledElm("p", " : " + shopinfo.workplace, [
        "fa-solid",
        "fa-shop",
      ])
    );

    infoArea.appendChild(
      commonSnipet.labeledElm("p", " : " + shopinfo.location, [
        "fa-solid",
        "fa-location-dot",
      ])
    );

    infoArea.appendChild(
      commonSnipet.labeledElm("p", " : " + shopinfo.station, [
        "fa-solid",
        "fa-train-subway",
      ])
    );

    shopMainArea.appendChild(squareImg);
    shopMainArea.appendChild(infoArea);
    shopInfoArea.appendChild(shopMainArea);

    if (owner == balance.eoa) {
      var askDiscord = document.createElement("p");
      askDiscord.classList.add("askDiscordBot");
      askDiscord.innerHTML =
        "ask to Discord Bot : <b class='commandInline'>/getkey </b> nftinfo : <b class='commandInline'>" +
        utils.shortname(ca + "/" + id, 6, 6);
      ("</b>");

      askDiscord.appendChild(commonSnipet.linkCopy(ca + "/" + id));
      shopInfoArea.appendChild(askDiscord);
    } else {
      utils.getUserByEoa(balance.eoa).then((eoaUser) => {
        if (eoaUser.type == "discordConnect") {
          const userName = eoaUser.discordUser.Name;
          const image = document.createElement("img");
          image.classList.add("discordIconMini");
          image.src = eoaUser.discordUser.Icon;

          var askDiscord = document.createElement("p");
          const password = setElement.makeInput(
            "input",
            "transfarRequest",
            "miniInput",
            "password"
          );
          const sendRequest = setElement.makeInput(
            "submit",
            "submitID",
            "miniSubmit",
            "REQUEST",
            "REQUEST"
          );
          askDiscord.classList.add("askDiscordBot");
          askDiscord.appendChild(image);
          askDiscord.appendChild(
            commonSnipet.span(userName + LANGSET("ARE_YOU_BUYER"))
          );
          askDiscord.appendChild(password);
          askDiscord.appendChild(sendRequest);
          shopInfoArea.appendChild(askDiscord);
          sendRequest.addEventListener("click", async () => {
            const secret = password.value;
            const eoa = balance.eoa;
            password.value = "";
            const Url = CONST.BOT_API_URL + "transrequest";
            const data = {
              eoa: eoa,
              secret: secret,
              ca: ca,
              id: id,
            };
            try {
              const response = await fetch(Url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              });
              const result = await response.json();
              alert(result.message);
              console.dir(result);
            } catch (error) {
              console.error(
                "There was a problem with the fetch operation:",
                error
              );
            }
          });
        }
      });
    }
    pElement.appendChild(shopInfoArea);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }

  console.log(utils.getLocalTime() + " 遅延実行開始 " + tokenUri);
  utils.fetchData(tokenUri).then(async (result) => {
    await detailDisplay.showToken(
      "pc_normal",
      result,
      owner,
      tokenUri,
      divElement,
      tokenBoundAccount,
      caSymbol
    );
    console.log(utils.getLocalTime() + " 遅延実行完了 " + tokenUri);

    if (
      balance.balance != undefined &&
      utils.isAddressesEqual(owner, balance.eoa)
    ) {
      if (caSymbol != "SBT") {
        if (caSymbol.includes("SBT")) {
          alert(
            "このNFTはSBTの可能性があります。送信できない可能性があります。"
          );
        }
        detailDisplay.sendForm(divElement);
      }
    }
    if (burnable) {
      detailDisplay.burnForm(divElement);
    }
  });
};

export const displayOwnTokens = async (
  ca,
  eoa,
  parentElement,
  tokensElement,
  titleElement
) => {
  var newArea = document.createElement("div");
  newArea.classList.add("childNftArea");
  newArea.id = "child_nft_area_" + ca;
  tokensElement.appendChild(newArea);
  const floatClear = document.createElement("div");
  floatClear.classList.add("floatClear");
  tokensElement.appendChild(floatClear);

  getOwn(eoa, ca).then(async (result) => {
    if (result.length > 0) {
      for (const key in result) {
        parentElement.style.display = "block";
        tokensElement.style.display = "block";
        titleElement.style.display = "block";
        const tokenData = result[key];
        var childNftDiv = document.createElement("div");
        childNftDiv.classList.add("childNft");
        childNftDiv.id = "token_" + ca + "_" + tokenData.tokenId;
        document
          .getElementById("child_nft_area_" + ca)
          .appendChild(childNftDiv);

        utils.fetchData(tokenData.tokenURI).then((nftinfo) => {
          var newLink = document.createElement("a");
          newLink.href = "/tokens/" + ca + "/" + tokenData.tokenId;
          var newTitle = document.createElement("h4");
          newTitle.classList.add("titleThumb");
          newTitle.textContent = nftinfo["name"];
          newLink.appendChild(newTitle);
          var squareImg = document.createElement("div");
          squareImg.classList.add("nftThumbSquare");
          var newImage = document.createElement("img");
          newImage.src = nftinfo["image"];
          newImage.classList.add("nftThumb");
          squareImg.appendChild(newImage);

          getTbaConnect.getTbaInfo(ca, tokenData.tokenId).then((tba) => {
            getTbaConnect.checkOwner(tba).then((response) => {
              if (response) {
                var tbamark = document.createElement("i");
                tbamark.classList.add(
                  "far",
                  "fa-solid",
                  "fa-bag-shopping",
                  "tbamark"
                );
                squareImg.appendChild(tbamark);
              }
            });
          });

          newLink.appendChild(squareImg);

          var childNftBg = document.createElement("div");
          childNftBg.classList.add("childNftBg");
          childNftBg.appendChild(newLink);

          document
            .getElementById("token_" + ca + "_" + tokenData.tokenId)
            .appendChild(childNftBg);
          console.log(
            utils.getLocalTime() + " 遅延実行完了" + tokenData.tokenURI
          );
        });
      }
    }
  });
};

export const displayTokens = async (tokensElement, ca, filter) => {
  console.log("filtering:", filter);
  var newArea = document.createElement("div");
  newArea.classList.add("childNftArea");
  newArea.id = "child_nft_area_" + ca;
  tokensElement.appendChild(newArea);
  const floatClear = document.createElement("div");
  floatClear.classList.add("floatClear");
  tokensElement.appendChild(floatClear);

  const tokenAmount = await getTokenConnect.getToken("tokenAmount", ca, "");
  for (let i = tokenAmount; i > 0; i--) {
    await sleep(300);
    var childNftDiv = document.createElement("div");
    childNftDiv.classList.add("childNft");
    childNftDiv.id = "token_" + ca + "_" + i;
    document.getElementById("child_nft_area_" + ca).appendChild(childNftDiv);
    getTokenConnect.getToken("tokenURI", ca, i).then(async (tokenUri) => {
      if (tokenUri == undefined) {
        console.log("undefined /tokens/" + ca + "/" + i);
        document.getElementById("token_" + ca + "_" + i).remove();
      } else {
        const newLink = await utils.fetchData(tokenUri).then((nftinfo) => {
          var newLink = document.createElement("a");
          newLink.href = "/tokens/" + ca + "/" + i;
          var newTitle = document.createElement("h3");
          newTitle.classList.add("titleThumb");
          newTitle.textContent = nftinfo["name"];
          newLink.appendChild(newTitle);
          var squareImg = document.createElement("div");
          squareImg.classList.add("nftThumbSquare");
          var newImage = document.createElement("img");
          newImage.src = nftinfo["image"];
          newImage.classList.add("nftThumb");
          squareImg.appendChild(newImage);

          getTbaConnect.getTbaInfo(ca, i).then((tba) => {
            getTbaConnect.checkOwner(tba).then((response) => {
              if (response) {
                var tbamark = document.createElement("i");
                tbamark.classList.add(
                  "far",
                  "fa-solid",
                  "fa-bag-shopping",
                  "tbamark"
                );
                squareImg.appendChild(tbamark);
              }
            });
          });

          newLink.appendChild(squareImg);
          return newLink;
        });

        var childNftBg = document.createElement("div");
        childNftBg.classList.add("childNftBg");
        childNftBg.appendChild(newLink);

        document
          .getElementById("token_" + ca + "_" + i)
          .appendChild(childNftBg);
      }
      console.log(utils.getLocalTime() + " 遅延実行完了" + tokenUri);
    });
  }
};

export const displayManagedData = async (type, title, filter) => {
  const result = await getManagerConnect.getManager(type);
  const header = document.createElement("h2");
  header.textContent = title;
  mainContents.appendChild(header);

  const dataList = document.createElement("div");
  dataList.classList.add(type + "LinkList");
  mainContents.appendChild(dataList);

  for (const key in result) {
    if (!filter || filter(result[key])) {
      const link = document.createElement("a");
      link.href = "/" + type + "/" + result[key][0];
      if (type == "admins") {
        link.textContent = result[key][0];
      } else if (type == "creators") {
        link.innerHTML =
          JSON.parse(result[key][1])[router.lang] +
          "<span class='litelink'>" +
          result[key][2] +
          "<span>";
      } else {
        link.innerHTML =
          result[key][1] +
          "<span class='litelink'>" +
          result[key][2] +
          "</span>";
      }
      dataList.appendChild(link);
      const lineBreak = document.createElement("br");
      dataList.appendChild(lineBreak);
    }
  }
};

export const displayOwns = async (parentElement, result, eoa) => {
  console.log(utils.getLocalTime() + " DisplayOwns:開始");

  const mcArea = document.createElement("div");
  mcArea.classList.add("nftContractArea");
  mcArea.style.display = "block";
  const mcListElm = document.createElement("div");
  mcListElm.style.display = "block";
  mcListElm.classList.add("contractLinkList");
  mcArea.appendChild(mcListElm);
  parentElement.appendChild(mcArea);

  const titleElm = document.createElement("h2");
  titleElm.classList.add("ownTokenCaTitle");
  titleElm.style.display = "none";
  const link = document.createElement("a");
  link.href = "/tokens/" + CONST.MEMBERSCARD_CA;
  link.textContent = "MEMBERS CARD";
  titleElm.appendChild(link);
  mcListElm.appendChild(titleElm);
  displayOwnTokens(CONST.MEMBERSCARD_CA, eoa, mcArea, mcListElm, titleElm);
  const floatClear = document.createElement("div");
  floatClear.classList.add("floatClear");

  const nftArea = document.createElement("div");
  nftArea.classList.add("nftContractArea");
  nftArea.style.display = "none";
  const nftHeader = document.createElement("h3");
  nftHeader.textContent = "NFT COLLECTIONS";
  const nftListElm = document.createElement("div");
  nftListElm.style.display = "none";
  nftListElm.classList.add("contractLinkList");
  nftArea.appendChild(nftHeader);
  nftArea.appendChild(nftListElm);
  parentElement.appendChild(nftArea);

  const nftfloatClear = document.createElement("div");
  nftfloatClear.classList.add("floatClear");
  parentElement.appendChild(nftfloatClear);

  const sbtArea = document.createElement("div");
  sbtArea.style.display = "none";
  sbtArea.classList.add("sbtContractArea");
  const sbtHeader = document.createElement("h3");
  sbtHeader.textContent = "SBT COLLECTIONS";
  const sbtListElm = document.createElement("div");
  sbtListElm.style.display = "none";
  sbtListElm.classList.add("contractLinkList");
  parentElement.appendChild(sbtListElm);
  sbtArea.appendChild(sbtHeader);
  sbtArea.appendChild(sbtListElm);
  parentElement.appendChild(sbtArea);

  const sbtfloatClear = document.createElement("div");
  sbtfloatClear.classList.add("floatClear");
  parentElement.appendChild(sbtfloatClear);

  for (const key in result) {
    await sleep(300);
    if (!result[key][3]) {
      console.log(utils.getLocalTime() + "非表示判定" + result[key]);
    } else if (result[key][2] === "nft") {
      const titleElm = document.createElement("h2");
      titleElm.classList.add("ownTokenCaTitle");
      titleElm.style.display = "none";
      const link = document.createElement("a");
      link.href = "/tokens/" + result[key][0];
      link.textContent = result[key][1];
      titleElm.appendChild(link);
      nftListElm.appendChild(titleElm);
      displayOwnTokens(result[key][0], eoa, nftArea, nftListElm, titleElm);
      const floatClear = document.createElement("div");
      floatClear.classList.add("floatClear");
    } else if (result[key][2] === "sbt") {
      const titleElm = document.createElement("h2");
      titleElm.classList.add("ownTokenCaTitle");
      titleElm.style.display = "none";
      const link = document.createElement("a");
      link.href = "/tokens/" + result[key][0];
      link.textContent = result[key][1];
      titleElm.appendChild(link);
      sbtListElm.appendChild(titleElm);
      displayOwnTokens(result[key][0], eoa, sbtArea, sbtListElm, titleElm);
      const floatClear = document.createElement("div");
      floatClear.classList.add("floatClear");
    }
  }
};

export const displayTokenContracts = async (result, filter) => {
  const nftArea = document.createElement("div");
  nftArea.classList.add("nftContractArea");
  nftArea.style.display = "none";
  const nftHeader = document.createElement("h3");
  nftHeader.textContent = "NFT COLLECTIONS";
  const nftListElm = document.createElement("div");
  nftListElm.classList.add("contractLinkList");
  nftArea.appendChild(nftHeader);
  nftArea.appendChild(nftListElm);
  mainContents.appendChild(nftArea);

  const nftfloatClear = document.createElement("div");
  nftfloatClear.classList.add("floatClear");
  mainContents.appendChild(nftfloatClear);

  const sbtArea = document.createElement("div");
  sbtArea.style.display = "none";
  sbtArea.classList.add("sbtContractArea");
  const sbtHeader = document.createElement("h3");
  sbtHeader.textContent = "SBT COLLECTIONS";
  const sbtListElm = document.createElement("div");
  sbtListElm.classList.add("contractLinkList");
  mainContents.appendChild(sbtListElm);
  sbtArea.appendChild(sbtHeader);
  sbtArea.appendChild(sbtListElm);
  mainContents.appendChild(sbtArea);

  const sbtfloatClear = document.createElement("div");
  sbtfloatClear.classList.add("floatClear");
  mainContents.appendChild(sbtfloatClear);

  for (const key in result) {
    filteringJudge(result[key], filter).then((judge) => {
      if (!judge) {
        console.log("非表示判定" + result[key]);
      } else if (result[key][2] === "nft") {
        console.log("NFT add:" + result[key][1]);
        nftArea.style.display = "block";
        const contractTitle = document.createElement("h3");
        nftListElm.appendChild(contractTitle);
        const contractLink = document.createElement("a");
        contractLink.href = "/tokens/" + result[key][0];
        contractLink.innerHTML = result[key][1];
        contractTitle.appendChild(contractLink);

        const mintLinkArea = document.createElement("span");
        contractTitle.appendChild(mintLinkArea);
        createMintLinkElm(result[key][0], mintLinkArea);

        displayTokens(nftListElm, result[key][0], false);
        const floatClear = document.createElement("div");
        floatClear.classList.add("floatClear");
      } else if (result[key][2] === "sbt") {
        console.log("SBT add:" + result[key][1]);
        sbtArea.style.display = "block";
        const contractTitle = document.createElement("h3");
        sbtListElm.appendChild(contractTitle);
        const contractLink = document.createElement("a");
        contractLink.href = "/tokens/" + result[key][0];
        contractLink.innerHTML = result[key][1];
        contractTitle.appendChild(contractLink);

        const mintLinkArea = document.createElement("span");
        contractTitle.appendChild(mintLinkArea);
        // createMintLinkElm(result[key][0], mintLinkArea);

        displayTokens(sbtListElm, result[key][0], false);
        const floatClear = document.createElement("div");
        floatClear.classList.add("floatClear");
      }
    });
    await sleep(100);
  }
};

export const displayAssets = async (result, filter) => {
  const nftArea = document.createElement("div");
  nftArea.classList.add("nftContractArea");
  nftArea.style.display = "none";
  const nftHeader = document.createElement("h4");
  nftHeader.textContent = "NFT ASSETS";
  const nftListElm = document.createElement("div");
  nftListElm.classList.add("contractLinkList");
  nftArea.appendChild(nftHeader);
  nftArea.appendChild(nftListElm);
  mainContents.appendChild(nftArea);

  const sbtArea = document.createElement("div");
  sbtArea.style.display = "none";
  sbtArea.classList.add("sbtContractArea");
  const sbtHeader = document.createElement("h4");
  sbtHeader.textContent = "SBT ASSETS";
  const sbtListElm = document.createElement("div");
  sbtListElm.classList.add("contractLinkList");
  mainContents.appendChild(sbtListElm);
  sbtArea.appendChild(sbtHeader);
  sbtArea.appendChild(sbtListElm);
  mainContents.appendChild(sbtArea);

  for (const key in result) {
    filteringJudge(result[key], filter).then((judge) => {
      if (!judge) {
        console.log("非表示判定" + result[key]);
      } else if (result[key][2] === "nft") {
        nftArea.style.display = "block";
        const dataList = document.createElement("div");
        dataList.classList.add("tokenLinkList");
        nftListElm.appendChild(dataList);
        const nftTitle = document.createElement("h3");
        nftTitle.textContent = result[key][1];
        dataList.appendChild(nftTitle);

        const divAssetList = document.createElement("div");
        divAssetList.classList.add("nftAssetList");
        dataList.appendChild(divAssetList);
        displayTokens(divAssetList, result[key][0], false);
        const floatClear = document.createElement("div");
        floatClear.classList.add("floatClear");
        divAssetList.appendChild(floatClear);
      } else if (result[key][2] === "sbt") {
        sbtArea.style.display = "block";
        const dataList = document.createElement("div");
        dataList.classList.add("tokenLinkList");
        sbtListElm.appendChild(dataList);
        const sbtTitle = document.createElement("h3");
        sbtTitle.textContent = result[key][1];
        dataList.appendChild(sbtTitle);

        const divAssetList = document.createElement("div");
        divAssetList.classList.add("sbtAssetList");
        dataList.appendChild(divAssetList);
        displayTokens(divAssetList, result[key][0], false);
        const floatClear = document.createElement("div");
        floatClear.classList.add("floatClear");
        divAssetList.appendChild(floatClear);
      }
    });
  }
};

export const displayArticleCard = (article, parentElm) => {
  const cardArea = document.createElement("div");
  cardArea.classList.add("cardContractArea");
  parentElm.appendChild(cardArea);
  var cardLink = document.createElement("a");
  cardLink.href = "/contents/" + article.Path.substring(3);
  cardArea.appendChild(cardLink);
  const cardImg = document.createElement("img");
  cardImg.src = article.Imgurl;
  cardLink.appendChild(cardImg);
  const textArea = document.createElement("div");
  textArea.classList.add("cardTextArea");
  cardLink.appendChild(textArea);
  const cardHeader = document.createElement("h2");
  cardHeader.textContent = article.Title;
  textArea.appendChild(cardHeader);
  const cardMain = document.createElement("p");
  cardMain.innerHTML =
    "Created <span class='date'>" +
    getDiffTime(article.Created) +
    "</span> | Last Access <span class='date'>" +
    getDiffTime(article.Updated) +
    "</span> | Access <span class='date'>" +
    article.AccessCount +
    " hit</span>";
  textArea.appendChild(cardMain);
};

const filteringJudge = async (target, filter: Function | false) => {
  if (!filter) {
    return true;
  } else if (filter(target)) {
    return true;
  }
  return false;
};

const creatorDonateList = async (elm, eoa) => {
  const title = document.createElement("h2");
  title.classList.add("creatorDonatetitle");
  title.innerHTML = "CreatorDonate";
  elm.appendChild(title);
  const subject = document.createElement("p");
  subject.classList.add("creatorDonatetitle");
  subject.innerHTML = LANGSET("DONATEMESSAGE");
  elm.appendChild(subject);

  const hasNftList = await getTokenConnect.hasTokenList(eoa);
  const selectForm = setElement.makeSelect("nftSelect", "BaseInput");
  selectForm.classList.add("wfull");

  let metaDataInfo = [];
  for (const key in hasNftList) {
    const option = document.createElement("option");
    option.value = key;
    const nftInfo = hasNftList[key];
    const metadata = await utils.fetchData(nftInfo.tokenUri);
    option.innerHTML =
      nftInfo.name + " #" + nftInfo.tokenId + " | " + metadata.name;
    selectForm.appendChild(option);
    metaDataInfo.push(metadata);
  }

  const donate = setElement.makeInput(
    "input",
    "sendTo",
    "BaseInput",
    LANGSET("DONATEPRICE")
  );
  donate.classList.add("w5p");
  const cashback = setElement.makeInput(
    "input",
    "sendTo",
    "BaseInput",
    LANGSET("CASHBACK")
  );
  cashback.classList.add("w5p");
  elm.appendChild(document.createElement("br"));
  const sendTo = setElement.makeInput(
    "input",
    "sendTo",
    "BaseInput",
    LANGSET("DONOR")
  );
  sendTo.classList.add("wfull");
  const sendDonateNftArea = document.createElement("div");
  sendDonateNftArea.classList.add("sendDonateNftArea");
  const sendNftFormArea = document.createElement("div");
  sendNftFormArea.classList.add("sendDonateFormArea");
  sendNftFormArea.appendChild(selectForm);

  const priceConfirmArea = document.createElement("div");
  priceConfirmArea.classList.add("priceConfirmArea");
  priceConfirmArea.style.display = "none";
  sendNftFormArea.appendChild(priceConfirmArea);

  sendNftFormArea.appendChild(donate);
  sendNftFormArea.appendChild(cashback);

  const discordUserCheckArea = document.createElement("div");
  sendNftFormArea.appendChild(discordUserCheckArea);

  sendNftFormArea.appendChild(sendTo);
  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    LANGSET("SUBDONATE"),
    LANGSET("SUBDONATE")
  );
  makeSubmit.classList.add("wfull");
  sendNftFormArea.appendChild(makeSubmit);
  const sendNftPreviewArea = document.createElement("div");
  const sendNftPreviewBg = document.createElement("div");
  sendNftPreviewBg.classList.add("sendDonateNftPreviewBg");
  sendNftPreviewArea.classList.add("sendDonateNftPreviewArea");
  sendNftPreviewArea.appendChild(sendNftPreviewBg);
  sendDonateNftArea.appendChild(sendNftPreviewArea);
  sendDonateNftArea.appendChild(sendNftFormArea);

  elm.appendChild(sendDonateNftArea);

  const checkPrice = async () => {
    const maticPrice = await utils.getMaticYen();
    if (maticPrice != undefined) {
      priceConfirmArea.style.display = "block";
      priceConfirmArea.innerHTML = "";
      const donateMatic = Number(donate.value) * Number(maticPrice);
      const cashbackMatic = Number(cashback.value) * Number(maticPrice);
      let disp =
        "<i class='fa-solid fa-money-check-dollar'></i> <span class='chkprice'>" +
        donateMatic.toFixed(4) +
        "</span> " +
        CONST.DEFAULT_SYMBOL +
        " <i class='fa-solid fa-circle-left'></i> <span class='chkprice'>" +
        cashbackMatic.toFixed(4) +
        "</span> " +
        CONST.DEFAULT_SYMBOL +
        "<br />" +
        "<i class='fa-solid fa-money-check-dollar'></i> <span class='chkpricemini'>" +
        donate.value +
        "</span> JPY " +
        " <i class='fa-solid fa-circle-left'></i> <span class='chkpricemini'>" +
        cashback.value +
        "</span> JPY " +
        " | <i class='fa-solid fa-calculator'></i> : <span class='chkpricemini'>" +
        maticPrice.toFixed(4) +
        "</span> " +
        CONST.DEFAULT_SYMBOL +
        "/JPY";

      if (donateMatic / 2 <= cashbackMatic) {
        disp = "キャッシュバック額が大きすぎます";
        cashback.value = "";
      }

      priceConfirmArea.innerHTML = disp;
    } else {
      priceConfirmArea.style.display = "block";
      priceConfirmArea.innerHTML =
        "現在価格が取得できませんでした。しばらくお待ち下さい。";
    }
  };

  donate.addEventListener("change", async (event) => {
    if (Number(donate.value) > 0) {
      checkPrice();
    }
  });
  cashback.addEventListener("change", async (event) => {
    if (Number(cashback.value) >= 0) {
      checkPrice();
    }
  });

  sendTo.addEventListener("input", async (event) => {
    setUserName();
  });

  const setUserName = async () => {
    discordUserCheckArea.innerHTML = "";
    discordUserCheckArea.classList.remove("sendToUser");
    if (sendTo.value != "") {
      discordUserCheckArea.classList.add("sendToUser");
      utils.getUserByEoa(sendTo.value).then(async (eoaUser) => {
        if (eoaUser.type == "tba") {
          discordUserCheckArea.appendChild(
            commonSnipet.dispTbaOwner(eoaUser.tbaInfo)
          );

          const checkSend = await getTbaConnect.sendToEoaCheck(
            eoaUser.tbaInfo.eoa,
            { ca: eoaUser.tbaInfo.ca, tokenId: eoaUser.tbaInfo.ca },
            0
          );

          if (!checkSend.result) {
            alert(LANGSET("CANTSEND") + " : " + checkSend.reason);
            sendTo.value = "";
            discordUserCheckArea.innerHTML = "";
            discordUserCheckArea.classList.remove("sendToUser");
            return false;
          }

          utils.getUserByEoa(checkSend.eoa).then((eoaUser) => {
            if (eoaUser.type == "discordConnect") {
              discordUserCheckArea.appendChild(
                commonSnipet.dispDiscordUser(eoaUser.discordUser)
              );
            } else if (eoaUser.type == "eoa") {
              discordUserCheckArea.appendChild(
                commonSnipet.scan(checkSend.eoa, "Final owner", "unknownCa")
              );
            }
          });
        } else if (eoaUser.type == "discordConnect") {
          discordUserCheckArea.appendChild(
            commonSnipet.dispDiscordUser(eoaUser.discordUser)
          );
        } else if (eoaUser.type == "eoa") {
          discordUserCheckArea.appendChild(
            commonSnipet.scan(eoaUser.eoa, "UNKNOWN EOA", "unknownEoa")
          );
        } else if (eoaUser.type == "ca") {
          discordUserCheckArea.appendChild(
            commonSnipet.scan(eoaUser.eoa, "UNKNOWN CA", "unknownCa")
          );
        }
      });
    }
  };

  const setSendNft = async () => {
    sendNftPreviewBg.innerHTML = "";
    if (metaDataInfo[selectForm.value]) {
      const nftimg = document.createElement("img");
      nftimg.classList.add("sendNftPreviewImg");
      nftimg.src = metaDataInfo[selectForm.value].image;
      sendNftPreviewBg.appendChild(nftimg);
    }
  };

  selectForm.addEventListener("change", async (event) => {
    setSendNft();
  });

  if (router.params[2]) {
    for (const key in hasNftList) {
      if (
        hasNftList[key].ca == router.params[3] &&
        hasNftList[key].tokenId == router.params[4]
      ) {
        selectForm.value = key;
        setSendNft();
      }
    }
    sendTo.value = router.params[2];
    setUserName();
  }
  creatorDonateHistory(elm);

  const sendSubDonate = async () => {
    if (donate.value == "") {
      alert(LANGSET("MES1"));
      return;
    }
    const maticPrice = await utils.getMaticYen();
    if (maticPrice == undefined) {
      alert(LANGSET("MES2"));
      return;
    }

    const donateMatic = Number(donate.value) * Number(maticPrice);
    const cashbackMatic = Number(cashback.value) * Number(maticPrice);

    const balance = await utils.checkBalance();
    if (utils.waiToEth(balance.balance) < Number(donateMatic)) {
      alert(CONST.DEFAULT_SYMBOL + LANGSET("NOT_ENOUGH"));
      return;
    }
    if (donateMatic / 2 <= cashbackMatic) {
      alert(LANGSET("MES3"));
      return;
    }
    const mes =
      "balance:" +
      utils.waiToEth(balance.balance) +
      "\nSEND TOKEN:" +
      metaDataInfo[selectForm.value].name +
      "\nSEND TO:" +
      sendTo.value +
      "\nVALUE:" +
      donateMatic +
      "\nCASHBACK:" +
      cashbackMatic;
    if (confirm(mes)) {
      console.log(mes);
      const ca = await getManagerConnect.getCA("donate");
      const donateResult = await donateConnect.donate("donate", ca, [
        sendTo.value,
        String(utils.ethToWai(donateMatic) + utils.ethToWai(cashbackMatic)),
        "SEND TOKEN:" +
          hasNftList[selectForm.value].ca +
          "/" +
          hasNftList[selectForm.value].tokenId,
        String(utils.ethToWai(cashbackMatic)),
      ]);
      console.dir(donateResult);
      if (donateResult != undefined) {
        alert(metaDataInfo[selectForm.value].name + LANGSET("MES4"));
        const sendResult = await setToken.send(
          hasNftList[selectForm.value].ca,
          sendTo.value,
          hasNftList[selectForm.value].tokenId
        );
        if (sendResult != undefined) {
          alert(metaDataInfo[selectForm.value].name + LANGSET("MES5"));
          console.dir(sendResult);
          location.reload();
        }
      }
    }
  };

  makeSubmit.addEventListener("click", async () => {
    sendSubDonate();
  });
};

const creatorDonateHistory = async (elm) => {
  const historyTitle = document.createElement("h2");
  historyTitle.classList.add("creatorDonatetitle");
  historyTitle.innerHTML = "CreatorDonateHistory";
  elm.appendChild(historyTitle);
  const checkBalance = await utils.checkBalance();
  const subject = document.createElement("p");
  subject.classList.add("creatorDonatetitle");
  subject.innerHTML = LANGSET("SUBDONAHIST");
  elm.appendChild(subject);
  const historyDiv = document.createElement("div");
  historyDiv.classList.add("creatorDonateHistory");
  elm.appendChild(historyDiv);

  const ca = await getManagerConnect.getCA("donate");
  const subDonationList = await donateConnect.donate(
    "getsubstituteDonationHistory",
    ca
  );
  for (let key = subDonationList.length - 1; key >= 0; key--) {
    const val = subDonationList[key];
    const log = document.createElement("p");
    log.appendChild(commonSnipet.span(utils.formatUnixTime(val[2])));
    log.appendChild(commonSnipet.donateDetail(val[3]));
    log.appendChild(commonSnipet.eoa(val[1]));
    await utils.getUserByEoa(val[1]).then((eoaUser) => {
      if (eoaUser.type == "tba") {
        log.appendChild(
          commonSnipet.getTbaOwnerSnipet(
            eoaUser.tbaInfo,
            "span",
            "discordNameDisp"
          )
        );
      } else if (eoaUser.type == "discordConnect") {
        log.appendChild(
          commonSnipet.getDiscordUserSnipet(
            eoaUser.discordUser,
            "span",
            "discordNameDisp"
          )
        );
      }
    });
    log.appendChild(
      commonSnipet.span(utils.waiToEth(val[0]) + " " + CONST.DEFAULT_SYMBOL)
    );
    historyDiv.appendChild(log);
  }
};

const setMintableForm = async (parentElm, sendTo) => {
  utils.checkBalance().then(async (balance) => {
    if (balance.eoa) {
      parentElm.style.display = "block";
      const mintableInfo = await manageService.getMintableContract(balance.eoa);
      mintableContractSelect(parentElm, mintableInfo, sendTo);
    }
  });
};

const mintableContractSelect = async (elm, mintableContract, sendTo) => {
  const selectForm = setElement.makeSelect("nftSelect", "BaseInput");
  selectForm.classList.add("wfull");
  for (const key in mintableContract) {
    const option = document.createElement("option");
    option.value = key;
    const contract = mintableContract[key];
    option.innerHTML = contract.name;
    if (contract.needPoint) {
      option.innerHTML +=
        " | <span class='needpoint'>" + contract.needPoint + " pt</span>";
    }
    selectForm.appendChild(option);
  }
  elm.innerHTML = "";
  const tokenUri = setElement.makeInput(
    "input",
    "tokenUri",
    "BaseInput",
    "tokenUri"
  );
  tokenUri.classList.add("wfull");
  const mintableFormArea = document.createElement("div");
  mintableFormArea.classList.add("mintableFormArea");

  mintableFormArea.appendChild(selectForm);
  mintableFormArea.appendChild(tokenUri);
  const label = document.createElement("span");
  label.innerHTML = LANGSET("REQUIRE_META_URL");
  label.classList.add("labelspan");
  mintableFormArea.appendChild(label);
  mintableFormArea.appendChild(commonSnipet.br());

  const previewElement = document.createElement("div");
  previewElement.style.display = "none";
  previewElement.classList.add("previewArea");
  mintableFormArea.appendChild(previewElement);

  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "MINT",
    "MINT"
  );
  makeSubmit.classList.add("w7p");
  mintableFormArea.appendChild(makeSubmit);
  elm.appendChild(mintableFormArea);

  const vaultSelect = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "OPEN VAULT",
    "OPEN VAULT"
  );
  vaultSelect.classList.add("w3p");
  mintableFormArea.appendChild(vaultSelect);
  vaultSelect.addEventListener("click", async () => {
    utils.toggleModal("permawebList", ["jsonOnly"]);
  });

  selectForm.addEventListener("change", async () => {
    const cainfo = mintableContract[selectForm.value];
    const balance = await utils.checkBalance();
    console.dir(mintableContract[selectForm.value]);
    if (balance.dpoint < cainfo.needPoint) {
      alert(LANGSET("NOT_ENOUGH_DBIZ"));
      selectForm.value = LANGSET("SELECTMES");
    }
  });

  makeSubmit.addEventListener("click", async () => {
    const contract = mintableContract[selectForm.value];
    console.dir(contract);
    let message =
      LANGSET("TRYING_TO_MINT") +
      "\n" +
      "SEND TO : " +
      sendTo +
      "\n" +
      "NFT : " +
      contract.name;
    if (contract.needPoint > 0) {
      message += LANGSET("REQUIRE_DBIZ") + " : " + contract.needPoint + "pt";
    }
    if (confirm(message)) {
      const result = await setToken.mint(contract.ca, sendTo, tokenUri.value);
      console.log("setTokens" + result);
      if (result == "success") {
        alert(LANGSET("WAIT_MINT_TX"));
        window.location.href = "/tokens/" + contract.ca;
      }
    }
  });

  tokenUri.addEventListener("input", async (e) => {
    utils
      .fetchData(tokenUri.value)
      .then(async (tokenInfos) => {
        previewElement.style.display = "block";
        previewElement.innerHTML = "";
        detailDisplay.showToken(
          "pc_normal",
          tokenInfos,
          "",
          tokenUri.value,
          previewElement,
          "",
          ""
        );
      })
      .catch(() => {
        previewElement.style.display = "none";
        alert(tokenUri.value + LANGSET("INVALID_TOKENURI"));
      });
  });
};

const createMintLinkElm = (ca, elm) => {
  const mintLink = document.createElement("a");
  elm.appendChild(mintLink);
  utils.checkBalance().then(async (response) => {
    if (response.eoa) {
      if (await manageService.checkMintable(ca, response.eoa)) {
        console.log(ca + "is mintable");
        mintLink.classList.add("litelink");
        mintLink.classList.add("mintlink");
        mintLink.href = "/tokens/" + ca + "/mint";
        mintLink.innerHTML = "mint";
      }
    }
  });
};

export const isNotConnect = async () => {
  const header = document.createElement("h2");
  header.textContent = "ウォレットが接続されていません";
  mainContents.appendChild(header);
  const maincontent = document.createElement("p");
  maincontent.innerHTML = "こちらのサイトはメタマスクを利用します。 ";
  mainContents.appendChild(maincontent);
};

const displaySnipet = {
  isNotConnect,
  creatorDonateList,
  creatorDonateHistory,
  displayMintUI,
  displayToken,
  displayOwnTokens,
  displayTokens,
  displayManagedData,
  displayOwns,
  displayTokenContracts,
  displayAssets,
  displayArticleCard,
  setMintableForm,
  mintableContractSelect,
  createMintLinkElm,
};
export default displaySnipet;
