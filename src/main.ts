import { ethers } from "ethers";
import { router } from "./module/common/router";
import { getManager } from "./module/connect/getManager";
import { getToken } from "./module/connect/getToken";
import { getTba } from "./module/connect/getTba";
import { setManager } from "./module/connect/setManager";
import {
  displayAssets,
  displayManagedData,
  displayTokenContracts,
  displayTokens,
  displayToken,
  displayOwns,
} from "./module/snipet/display";

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
  const result = await setManager("contracts");
  console.dir(result);
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
  const tokenBoundAccount = await getTbaInfo();
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

const setTokens = async () => {
  const divTokensElement = document.createElement("div");
  divTokensElement.classList.add("tokensList");
  mainContents.appendChild(divTokensElement);

  divTokensElement.innerHTML = "";
  const divElement = document.createElement("div");
  divTokensElement.appendChild(divElement);

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
  tokenName.textContent = await getToken("name", router.params[2], "");
  pElement.appendChild(tokenName);
  // ----------------------------------------

  displayTokens(divTokensElement, router.params[2], false);
};

const getTbaInfo = async () => {
  const tokenBoundAccount = await getTba.getAddress(
    "0x63c8A3536E4A647D48fC0076D442e3243f7e773b", // contractAddress(registContract),
    "0xa8a05744C04c7AD0D31Fcee368aC18040832F1c1", // implementation(accountContract),
    "137", //chainId: string,
    router.params[2], //tokenContract: string,
    router.params[3], // tokenId: string,
    "1" // salt: string
  );
  return tokenBoundAccount;
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
  } else if (param1 === "assets" && param2) {
    setOwner(param2);
  } else if (param1 === "assets") {
    setAssets((filter) => {
      return filter[3] == true;
    });
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
