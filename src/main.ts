import { ethers } from "ethers";
import { router } from "./module/common/router";
import { fetchData, getLocalTime } from "./module/common/util";
import { manager } from "./module/connect/manager";
import { getToken } from "./module/connect/getToken";
import { getTba } from "./module/connect/getTba";
import {
  displayAssets,
  displayManagedData,
  displayTokenContracts,
  displayTokens,
  displayToken,
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
  await displayManagedData("admins", "Admins", false);
};

const setAssets = async (filter) => {
  const result = await manager("contracts");
  displayAssets(result, filter);
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

const setToken = async () => {
  const params = router.params;
  const tokenBoundAccount = await getTbaInfo();
  const divElement = document.createElement("div");
  divElement.classList.add("nftArea");
  mainContents.appendChild(divElement);
  displayToken(divElement, params[2], params[3], tokenBoundAccount);
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
  const tokenBoundAccount = await getTba(
    "0x63c8A3536E4A647D48fC0076D442e3243f7e773b", // contractAddress: string,
    "0xa8a05744C04c7AD0D31Fcee368aC18040832F1c1", // implementation: string,
    "137", //chainId: string,
    router.params[2], //tokenContract: string,
    router.params[3], // tokenId: string,
    "1" // salt: string
  );
  console.log("TODO: active get params|tba address:" + tokenBoundAccount);
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
