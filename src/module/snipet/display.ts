import { getManager } from "../connect/getManager";
import { getToken } from "../connect/getToken";
import { getOwn } from "../connect/getOwn";
import utils from "../common/util";
import detailDisplay from "./detailDisplay";
//import { fetchData, getLocalTime } from "../common/util";
const mainContents = document.getElementById("mainContents");

export const displayToken = async (
  displayTokenElement,
  ca,
  id,
  tokenBoundAccount,
  tbaOwner
) => {
  console.log("displayToken:" + ca + "/" + id);
  const divElement = document.createElement("div");
  const tokenUri = await getToken("tokenURI", ca, id);
  const caName = await getToken("name", ca, id);
  const owner = await getToken("ownerOf", ca, id);
  divElement.classList.add("tokenUri_" + tokenUri);
  displayTokenElement.appendChild(divElement);

  const divTbaElement = document.createElement("div");
  divTbaElement.classList.add("TbaInfo");
  displayTokenElement.appendChild(divTbaElement);

  const tbaInfoElement = document.createElement("p");

  if (tbaOwner) {
    tbaInfoElement.innerHTML =
      "tokenBoundAccount: <a href='/assets/" +
      tokenBoundAccount +
      "'>" +
      tokenBoundAccount +
      "</a>";
  } else {
    console.log("TBA未発行 : TBAオーナーならここでTBA発行できる");
  }

  divTbaElement.appendChild(tbaInfoElement);

  const pElement = document.createElement("p");
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
  spanSpace2.textContent = " | ";
  pElement.appendChild(spanSpace2);

  console.log(utils.getLocalTime() + " 遅延実行開始 " + tokenUri);
  utils.fetchData(tokenUri).then(async (result) => {
    detailDisplay.showToken(
      "pc_normal",
      result,
      owner,
      tokenUri,
      divElement,
      pElement
    );
    console.log(utils.getLocalTime() + " 遅延実行完了 " + tokenUri);
    detailDisplay.sendForm(divElement);
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

          document
            .getElementById("token_" + ca + "_" + tokenData.tokenId)
            .appendChild(newLink);
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

  const tokenAmount = await getToken("tokenAmount", ca, "");
  for (let i = tokenAmount; i > 0; i--) {
    var childNftDiv = document.createElement("div");
    childNftDiv.classList.add("childNft");
    childNftDiv.id = "token_" + ca + "_" + i;
    //newArea.appendChild(childNftDiv);
    document.getElementById("child_nft_area_" + ca).appendChild(childNftDiv);

    getToken("tokenURI", ca, i).then(async (tokenUri) => {
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

      document.getElementById("token_" + ca + "_" + i).appendChild(newLink);
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
  dataList.classList.add("contractLinkList");
  mainContents.appendChild(dataList);

  for (const key in result) {
    if (!filter || filter(result[key])) {
      const link = document.createElement("a");
      link.href = "/" + type + "/" + result[key][0];
      if (type == "admins") {
        link.textContent = result[key][0];
      } else {
        link.textContent = result[key][1] + " [" + result[key][2] + "]";
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
        const link = document.createElement("a");
        link.href = "/tokens/" + result[key][0];
        link.textContent = result[key][1];
        nftList.appendChild(link);
        displayTokens(nftList, result[key][0], false);
        const floatClear = document.createElement("div");
        floatClear.classList.add("floatClear");
      } else if (result[key][2] === "sbt") {
        console.log("SBT add:" + result[key][1]);
        sbtArea.style.display = "block";
        const link = document.createElement("a");
        link.href = "/tokens/" + result[key][0];
        link.textContent = result[key][1];
        sbtList.appendChild(link);
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

const filteringJudge = async (target, filter: Function | false) => {
  if (!filter) {
    return true;
  } else if (filter(target)) {
    return true;
  }
  return false;
};
