import { ethers } from "ethers";
import { router } from "./module/common/router";
import { manager } from "./module/connect/manager";
import { getToken } from "./module/connect/getToken";

const connectButton = document.getElementById("connectButton");
const disconnectButton = document.getElementById("disconnectButton");
const mintButton = document.getElementById("mintButton");
const makeTbaButton = document.getElementById("makeTbaButton");
const mainContents = document.getElementById("mainContents");
const status = document.getElementById("status");
const modalbase = document.getElementById("modalbase");
const modalcontent = document.getElementById("modalcontent");
let dispmodal = false;
let connected = null;

connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      connected = await signer.getAddress();
      status.innerHTML = `connected: ${connected}`;
    } catch (error) {
      status.innerHTML = `error: ${error.message}`;
    }
  } else {
    status.innerHTML = "get MetaMask";
  }
});

async function disconnectFromMetaMask() {
  if (window.ethereum && window.ethereum.isMetaMask) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try {
      await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
      console.log("Disconnected from MetaMask");
    } catch (error) {
      console.error("Failed to disconnect from MetaMask:", error);
    }
  } else {
    console.error("MetaMask is not installed");
  }
}

disconnectButton.addEventListener("click", async () => {
  if (connected) {
    status.innerHTML = "connect wallet";
    disconnectFromMetaMask();
    connected = null;
    updateDisplay();
  }
});

const updateDisplay = () => {
  if (connected) {
    modalcontent.innerHTML = `Connected: ${connected}`;
    toggleModal();
  } else {
    modalcontent.innerHTML = `notConnected`;
    toggleModal();
  }
};

const displayManagedData = async (type, title, filter) => {
  const result = await manager(type);
  console.log("manage type:" + type);
  console.dir(result);
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

const setContracts = async () => {
  await displayManagedData("contracts", "CONTRACTS", (filter) => {
    return filter[3] == true;
  });
};

const setCreators = async () => {
  await displayManagedData("creators", "CREATORS", false);
};

const setCreator = async () => {
  await displayManagedData("creators", "CREATOR", (filter) => {
    return filter[0] == router.params[2] && filter[3] == true;
  });
  setOwnTokenContracts((filter) => {
    return filter[3] == true;
  });
};

const setAdmins = async () => {
  await displayManagedData("admins", "Admins", false);
};

const setTokenContracts = async (filter) => {
  const result = await manager("contracts");
  displayTokenContracts(result, filter);
};

const setOwnTokenContracts = async (filter) => {
  const allList = await manager("contracts");
  let result = [];
  for (const key in allList) {
    if (allList[key][2] == "nft") {
      const owner = await getToken("getInfo", allList[key][0], "").then(
        (response) => {
          return response[0];
        }
      );

      if (owner == router.params[2]) {
        console.dir(owner + ":" + router.params[2]);
        result.push(allList[key]);
      }
    }
  }
  displayTokenContracts(result, filter);
};

const displayTokenContracts = async (result, filter) => {
  const nftHeader = document.createElement("h2");
  nftHeader.textContent = "NFT COLLECTIONS";

  const nftList = document.createElement("div");
  nftList.classList.add("contractLinkList");

  const sbtHeader = document.createElement("h2");
  sbtHeader.textContent = "SBT COLLECTIONS";

  const sbtList = document.createElement("div");
  sbtList.classList.add("contractLinkList");

  let nft_count = 0;
  let sbt_count = 0;
  for (const key in result) {
    if (!filter || filter(result[key])) {
      if (result[key][2] === "nft") {
        nft_count++;
        const link = document.createElement("a");
        link.href = "/tokens/" + result[key][0];
        link.textContent = result[key][1] + " [" + result[key][2] + "]";
        nftList.appendChild(link);
        const lineBreak = document.createElement("br");
        nftList.appendChild(lineBreak);
      } else if (result[key][2] === "sbt") {
        sbt_count++;
        const link = document.createElement("a");
        link.href = "/tokens/" + result[key][0];
        link.textContent = result[key][1] + " [" + result[key][2] + "]";
        sbtList.appendChild(link);
        const lineBreak = document.createElement("br");
        sbtList.appendChild(lineBreak);
      }
    }
  }
  if (nft_count > 0) {
    mainContents.appendChild(nftHeader);
    mainContents.appendChild(nftList);
  }
  if (sbt_count > 0) {
    mainContents.appendChild(sbtHeader);
    mainContents.appendChild(sbtList);
  }
};

const setToken = async () => {
  const result = await getToken("tokenURI", router.params[2], router.params[3]);
  const owner = await getToken("ownerOf", router.params[2], router.params[3]);
  const caName = await getToken("name", router.params[2], router.params[3]);
  const divElement = document.createElement("div");

  // ----------------------------------------
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
  caLink.href = "/tokens/" + router.params[2];
  caLink.textContent = caName;
  pElement.appendChild(caLink);

  const spanSpace2 = document.createElement("span");
  spanSpace2.textContent = " | ";
  pElement.appendChild(spanSpace2);

  const tokenName = document.createElement("span");
  tokenName.textContent = result["name"];
  pElement.appendChild(tokenName);

  // ----------------------------------------

  const h2Element = document.createElement("h2");
  h2Element.textContent = result["name"];
  divElement.appendChild(h2Element);

  const pDescriptionElement = document.createElement("p");
  pDescriptionElement.textContent = result["description"];
  divElement.appendChild(pDescriptionElement);

  const pOwnerElement = document.createElement("p");
  pOwnerElement.textContent = "owner: " + owner;
  divElement.appendChild(pOwnerElement);

  const imgElement = document.createElement("img");
  imgElement.classList.add("nftImage");
  imgElement.src = result["image"];
  divElement.appendChild(imgElement);

  mainContents.appendChild(divElement);
};

const setTokens = async () => {
  const title = await getToken("name", router.params[2], "");
  const tokenAmount = await getToken("tokenAmount", router.params[2], "");

  mainContents.innerHTML = "";
  const divElement = document.createElement("div");
  mainContents.appendChild(divElement);

  // ----------------------------------------
  const pElement = document.createElement("p");
  divElement.appendChild(pElement);

  var tokenLink = document.createElement("a");
  tokenLink.href = "/tokens/";
  tokenLink.textContent = "NftCollection";
  pElement.appendChild(tokenLink);

  const spanSpace = document.createElement("span");
  spanSpace.textContent = " | ";
  pElement.appendChild(spanSpace);

  const tokenName = document.createElement("span");
  tokenName.textContent = title;
  pElement.appendChild(tokenName);

  // ----------------------------------------

  var newArea = document.createElement("div");
  newArea.classList.add("childNftArea");
  mainContents.appendChild(newArea);

  for (let i = tokenAmount; i > 0; i--) {
    const nftinfo = await getToken("tokenURI", router.params[2], i);

    var childNftDiv = document.createElement("div");
    childNftDiv.classList.add("childNft");

    var newLink = document.createElement("a");
    newLink.href = "/tokens/" + router.params[2] + "/" + i;

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
    childNftDiv.appendChild(newLink);
    newArea.appendChild(childNftDiv);
  }
};

mintButton.addEventListener("click", async () => {
  modalcontent.innerHTML = `mint: ${router.params}`;
  toggleModal();
});

makeTbaButton.addEventListener("click", async () => {
  modalcontent.innerHTML = `makeTba: ${router.params}`;
  toggleModal();
});

modalbase.addEventListener("click", async () => {
  toggleModal();
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

const checkRoute = () => {
  console.log("checkRoute" + router.params);
  const params = router.params;
  const param1 = params[1];
  const param2 = params[2];
  const param3 = params[3];

  if (param1 === "contract") {
    setContracts();
  } else if (param1 === "creators" && param2) {
    setCreator();
  } else if (param1 === "creators") {
    setCreators();
  } else if (param1 === "admins") {
    setAdmins();
  } else if (param1 === "tokens" && param2 && param3) {
    setToken();
  } else if (param1 === "tokens" && param2 && !param3) {
    setTokens();
    console.log("caOnly" + params);
  } else if (param1 === "tokens") {
    setTokenContracts((filter) => {
      return filter[3] == true;
    });
  }
};

checkRoute();
