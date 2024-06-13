import { getManager } from "../connect/getManager";
import getTokenConnect, { getToken } from "../connect/getToken";
import { getOwn } from "../connect/getOwn";
import utils from "../common/utils";
import { router } from "../common/router";
import detailDisplay from "./detailDisplay";
import commonSnipet from "../snipet/common";
import setElement from "./setElement";
import { CONST } from "../common/const";
import getManagerConnect from "../connect/getManager";
import setToken from "../connect/setToken";
import donateConnect from "../connect/donate";
import discordConnect from "../connect/discordConnect";
import manageService from "../service/manageService";
const mainContents = document.getElementById("mainContents");

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
    balanceElement.innerHTML += "このNFTのMINTは作家限定です";
    mintable = false;
  }

  if (balance.dpoint < mintableInfo.needPoint) {
    balanceElement.innerHTML +=
      "このNFTのMINTには donationPointが " +
      mintableInfo.needPoint +
      " pt 必要です";
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
  const owner = await getTokenConnect.getToken("ownerOf", ca, id);
  divElement.classList.add("tokenUri_" + tokenUri);
  displayTokenElement.appendChild(divElement);

  const divTbaElement = document.createElement("div");
  divTbaElement.classList.add("TbaInfo");
  displayTokenElement.appendChild(divTbaElement);

  const balance = await utils.checkBalance();
  const tbaInfoElement = document.createElement("p");

  if (tbaOwner) {
    tbaInfoElement.appendChild(commonSnipet.span("This NFT has TBA: "));
    tbaInfoElement.appendChild(
      commonSnipet.eoa(tokenBoundAccount, {
        link: "/assets/" + tokenBoundAccount,
        target: "",
      })
    );
  } else {
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

  console.log(utils.getLocalTime() + " 遅延実行開始 " + tokenUri);
  utils.fetchData(tokenUri).then(async (result) => {
    await detailDisplay.showToken(
      "pc_normal",
      result,
      owner,
      tokenUri,
      divElement,
      tokenBoundAccount
    );
    console.log(utils.getLocalTime() + " 遅延実行完了 " + tokenUri);

    if (
      balance.balance != undefined &&
      utils.isAddressesEqual(owner, balance.eoa)
    ) {
      detailDisplay.sendForm(divElement);
    }
  });
};

export const displayOwnTokens = async (
  tokensElement,
  ca,
  eoa,
  parentElement
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
    var childNftDiv = document.createElement("div");
    childNftDiv.classList.add("childNft");
    childNftDiv.id = "token_" + ca + "_" + i;
    //newArea.appendChild(childNftDiv);
    document.getElementById("child_nft_area_" + ca).appendChild(childNftDiv);

    getTokenConnect.getToken("tokenURI", ca, i).then(async (tokenUri) => {
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
        newLink.appendChild(squareImg);
        return newLink;
      });

      var childNftBg = document.createElement("div");
      childNftBg.classList.add("childNftBg");
      childNftBg.appendChild(newLink);

      document.getElementById("token_" + ca + "_" + i).appendChild(childNftBg);
      console.log(utils.getLocalTime() + " 遅延実行完了" + tokenUri);
    });
  }
};

export const displayManagedData = async (type, title, filter) => {
  const result = await getManager(type);
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
  const nftArea = document.createElement("div");
  nftArea.classList.add("nftContractArea");
  nftArea.style.display = "none";
  const nftHeader = document.createElement("h3");
  nftHeader.textContent = "NFT COLLECTIONS";
  const nftList = document.createElement("div");
  nftList.style.display = "none";
  nftList.classList.add("contractLinkList");
  nftArea.appendChild(nftHeader);
  nftArea.appendChild(nftList);
  parentElement.appendChild(nftArea);

  const nftfloatClear = document.createElement("div");
  nftfloatClear.classList.add("floatClear");
  parentElement.appendChild(nftfloatClear);

  const sbtArea = document.createElement("div");
  sbtArea.style.display = "none";
  sbtArea.classList.add("sbtContractArea");
  const sbtHeader = document.createElement("h3");
  sbtHeader.textContent = "SBT COLLECTIONS";
  const sbtList = document.createElement("div");
  sbtList.style.display = "none";
  sbtList.classList.add("contractLinkList");
  parentElement.appendChild(sbtList);
  sbtArea.appendChild(sbtHeader);
  sbtArea.appendChild(sbtList);
  parentElement.appendChild(sbtArea);

  const sbtfloatClear = document.createElement("div");
  sbtfloatClear.classList.add("floatClear");
  parentElement.appendChild(sbtfloatClear);

  for (const key in result) {
    if (!result[key][3]) {
      console.log(utils.getLocalTime() + "非表示判定" + result[key]);
    } else if (result[key][2] === "nft") {
      console.log(utils.getLocalTime() + "NFT add:" + result[key][1]);
      // nftArea.style.display = "block";
      const link = document.createElement("a");
      link.href = "/tokens/" + result[key][0];
      link.textContent = result[key][1];
      nftList.appendChild(link);
      displayOwnTokens(nftList, result[key][0], eoa, nftArea);
      const floatClear = document.createElement("div");
      floatClear.classList.add("floatClear");
    } else if (result[key][2] === "sbt") {
      console.log(utils.getLocalTime() + "SBT add:" + result[key][1]);
      // sbtArea.style.display = "block";
      const link = document.createElement("a");
      link.href = "/tokens/" + result[key][0];
      link.textContent = result[key][1];
      sbtList.appendChild(link);
      displayOwnTokens(sbtList, result[key][0], eoa, sbtArea);
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
  const nftList = document.createElement("div");
  nftList.classList.add("contractLinkList");
  nftArea.appendChild(nftHeader);
  nftArea.appendChild(nftList);
  mainContents.appendChild(nftArea);

  const nftfloatClear = document.createElement("div");
  nftfloatClear.classList.add("floatClear");
  mainContents.appendChild(nftfloatClear);

  const sbtArea = document.createElement("div");
  sbtArea.style.display = "none";
  sbtArea.classList.add("sbtContractArea");
  const sbtHeader = document.createElement("h3");
  sbtHeader.textContent = "SBT COLLECTIONS";
  const sbtList = document.createElement("div");
  sbtList.classList.add("contractLinkList");
  mainContents.appendChild(sbtList);
  sbtArea.appendChild(sbtHeader);
  sbtArea.appendChild(sbtList);
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
        nftList.appendChild(contractTitle);
        const contractLink = document.createElement("a");
        contractLink.href = "/tokens/" + result[key][0];
        contractLink.innerHTML = result[key][1];
        const mintLink = document.createElement("a");
        mintLink.classList.add("litelink");
        mintLink.classList.add("mintlink");
        mintLink.href = "/tokens/" + result[key][0] + "/mint";
        mintLink.innerHTML = "mint";
        contractTitle.appendChild(contractLink);
        contractTitle.appendChild(mintLink);
        displayTokens(nftList, result[key][0], false);
        const floatClear = document.createElement("div");
        floatClear.classList.add("floatClear");
      } else if (result[key][2] === "sbt") {
        console.log("SBT add:" + result[key][1]);
        sbtArea.style.display = "block";
        const contractTitle = document.createElement("h3");
        sbtList.appendChild(contractTitle);
        const contractLink = document.createElement("a");
        contractLink.href = "/tokens/" + result[key][0];
        contractLink.innerHTML = result[key][1];
        const mintLink = document.createElement("a");
        mintLink.classList.add("litelink");
        mintLink.classList.add("mintlink");
        mintLink.href = "/tokens/" + result[key][0] + "/mint";
        mintLink.innerHTML = "mint";
        contractTitle.appendChild(contractLink);
        contractTitle.appendChild(mintLink);
        /*
        const link = document.createElement("a");
        link.href = "/tokens/" + result[key][0];
        link.innerHTML = "<h3>" + result[key][1] + " mint</h3>";
        sbtList.appendChild(link);
        */
        displayTokens(sbtList, result[key][0], false);
        const floatClear = document.createElement("div");
        floatClear.classList.add("floatClear");
      }
    });
  }
};

export const displayAssets = async (result, filter) => {
  const nftArea = document.createElement("div");
  nftArea.classList.add("nftContractArea");
  nftArea.style.display = "none";
  const nftHeader = document.createElement("h4");
  nftHeader.textContent = "NFT ASSETS";
  const nftList = document.createElement("div");
  nftList.classList.add("contractLinkList");
  nftArea.appendChild(nftHeader);
  nftArea.appendChild(nftList);
  mainContents.appendChild(nftArea);

  const sbtArea = document.createElement("div");
  sbtArea.style.display = "none";
  sbtArea.classList.add("sbtContractArea");
  const sbtHeader = document.createElement("h4");
  sbtHeader.textContent = "SBT ASSETS";
  const sbtList = document.createElement("div");
  sbtList.classList.add("contractLinkList");
  mainContents.appendChild(sbtList);
  sbtArea.appendChild(sbtHeader);
  sbtArea.appendChild(sbtList);
  mainContents.appendChild(sbtArea);

  for (const key in result) {
    filteringJudge(result[key], filter).then((judge) => {
      if (!judge) {
        console.log("非表示判定" + result[key]);
      } else if (result[key][2] === "nft") {
        nftArea.style.display = "block";
        const dataList = document.createElement("div");
        dataList.classList.add("tokenLinkList");
        nftList.appendChild(dataList);
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
        sbtList.appendChild(dataList);
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
  subject.innerHTML =
    "BizenDAO登録作家はこちらで購入者に代わって代理寄付が可能です。<br />またガス代としてキャッシュバックすることができます。";
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

  const donate = setElement.makeInput("input", "sendTo", "BaseInput", "寄付額");
  donate.classList.add("wfull");
  const cashback = setElement.makeInput(
    "input",
    "sendTo",
    "BaseInput",
    "キャッシュバック額"
  );
  cashback.classList.add("wfull");
  elm.appendChild(document.createElement("br"));
  const sendTo = setElement.makeInput("input", "sendTo", "BaseInput", "寄付者");
  sendTo.classList.add("wfull");
  const sendDonateNftArea = document.createElement("div");
  sendDonateNftArea.classList.add("sendDonateNftArea");
  const sendNftFormArea = document.createElement("div");
  sendNftFormArea.classList.add("sendDonateFormArea");
  sendNftFormArea.appendChild(selectForm);
  sendNftFormArea.appendChild(donate);
  sendNftFormArea.appendChild(cashback);

  const discordUserCheckArea = document.createElement("div");
  sendNftFormArea.appendChild(discordUserCheckArea);

  sendNftFormArea.appendChild(sendTo);
  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "SUBSTITUTE DONATION",
    "SUBSTITUTE DONATION"
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

  sendTo.addEventListener("change", async (event) => {
    discordUserCheckArea.innerHTML = "";
    discordUserCheckArea.classList.remove("sendToUser");
    if (sendTo.value != "") {
      utils.getUserByEoa(sendTo.value).then((eoaUser) => {
        if (eoaUser.type == "tba") {
          alert("DISP EOAUSER SUBDONATE");
        } else if (eoaUser.type == "discordConnect") {
          discordUserCheckArea.classList.add("sendToUser");
          discordUserCheckArea.appendChild(
            commonSnipet.discordByEoa(eoaUser.discordUser)
          );
        }
      });
    }
  });

  selectForm.addEventListener("change", async (event) => {
    sendNftPreviewBg.innerHTML = "";
    if (metaDataInfo[selectForm.value]) {
      console.log("NFTを選択しました。" + selectForm.value);
      console.dir(metaDataInfo[selectForm.value].image);
      const nftimg = document.createElement("img");
      nftimg.classList.add("sendNftPreviewImg");
      nftimg.src = metaDataInfo[selectForm.value].image;
      sendNftPreviewBg.appendChild(nftimg);
    } else {
      console.log("NFTを選択解除");
    }
  });

  creatorDonateHistory(elm);

  const sendSubDonate = async () => {
    const balance = await utils.checkBalance();
    if (utils.waiToEth(balance.balance) < Number(donate.value)) {
      alert(CONST.DEFAULT_SYMBOL + " が足りません");
      return;
    }
    if (parseInt(cashback.value) > parseInt(donate.value) / 2) {
      alert("キャッシュバックが高すぎます");
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
      donate.value +
      "\nCASHBACK:" +
      cashback.value;
    if (confirm(mes)) {
      console.log(mes);
      const ca = await getManagerConnect.getCA("donate");
      const donationList = await donateConnect.donate("donate", ca, [
        sendTo.value,
        String(utils.ethToWai(donate.value) + utils.ethToWai(cashback.value)),
        "SEND TOKEN:" +
          hasNftList[selectForm.value].ca +
          "/" +
          hasNftList[selectForm.value].tokenId,
        String(utils.ethToWai(cashback.value)),
      ]);
      console.dir(donationList);
      alert(metaDataInfo[selectForm.value].name + " を送信します。");
      const result = await setToken.send(
        hasNftList[selectForm.value].ca,
        sendTo.value,
        hasNftList[selectForm.value].tokenId
      );
      alert(metaDataInfo[selectForm.value].name + " を送信しました。");
      console.dir(donationList);
      location.reload();
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
  subject.innerHTML = "代理寄付履歴";
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
        alert("DISP EOAUSER SUBDONATELIST");
      } else if (eoaUser.type == "discordConnect") {
        log.appendChild(
          commonSnipet.getDiscordUserByEoa(
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
    option.innerHTML = contract.name + " | " + contract.needPoint;
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
  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "MINT",
    "MINT"
  );
  makeSubmit.classList.add("wfull");
  mintableFormArea.appendChild(makeSubmit);
  elm.appendChild(mintableFormArea);

  const previewElement = document.createElement("div");
  previewElement.classList.add("previewArea");
  elm.appendChild(previewElement);

  selectForm.addEventListener("change", async () => {
    console.log("フォーム変更" + mintableContract[selectForm.value].name);
  });

  makeSubmit.addEventListener("click", async () => {
    const contract = mintableContract[selectForm.value];
    console.dir(contract);
    let message =
      sendTo + "宛に" + contract.name + " をMINTしようとしています\n";
    if (contract.needPoint > 0) {
      message +=
        "このNFTのmintはdonatePointを" + contract.needPoint + "pt消費します。";
    }
    if (confirm(message)) {
      const result = await setToken.mint(contract.ca, sendTo, tokenUri.value);
    }
  });

  tokenUri.addEventListener("change", async (e) => {
    utils
      .fetchData(tokenUri.value)
      .then(async (tokenInfos) => {
        previewElement.innerHTML = "";
        detailDisplay.showToken(
          "pc_normal",
          tokenInfos,
          "",
          tokenUri.value,
          previewElement,
          ""
        );
      })
      .catch(() => {
        alert(tokenUri.value + " は無効なtokenURIです。");
      });
  });
};

const displaySnipet = {
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
};
export default displaySnipet;
