import { ethers } from "ethers";
import { CONST } from "../common/const";
import { ABIS } from "./abi";
import manageConnect from "./getManager";
import {
  createWrappedProvider,
  createWrappedContract,
} from "../common/rpcWrapper";
import { showLoadingSpinner, hideLoadingSpinner, updateLoadingMessage } from "../snipet/loadingSpinner";

const abi = ABIS.nft;
const rpc_url = CONST.RPC_URL;
const provider = createWrappedProvider(new ethers.JsonRpcProvider(rpc_url));

export const getToken = async (
  method: string,
  ca: string,
  id?: string | null
) => {
  const contract = createWrappedContract(
    new ethers.Contract(ca, abi, provider)
  );
  try {
    if (method == "getInfo") {
      const result = await contract.getInfo().then((response) => {
        return response;
      });
      return result;
    } else if (method == "name") {
      const result = await contract.name().then((response) => {
        return response;
      });
      return result;
    } else if (method == "symbol") {
      const result = await contract.symbol().then((response) => {
        return response;
      });
      return result;
    } else if (method == "creatorOnly") {
      const result = await contract._creatorOnly().then((response) => {
        return response;
      });
      return result;
    } else if (method == "owner") {
      const result = await contract._owner().then((response) => {
        return response;
      });
      return result;
    } else if (method == "creator") {
      const result = await contract._creator().then((response) => {
        return response;
      });
      return result;
    } else if (method == "tokenAmount") {
      const result = await contract._lastTokenId().then((response) => {
        return response;
      });
      return result;
    } else if (method == "unlockPrice") {
      const result = await contract._unlockPrice().then((response) => {
        return parseInt(response) / 1000000000000000000;
      });
      return result;
    } else if (method == "ownerOf") {
      const result = await contract.ownerOf(id).then((response) => {
        return response;
      });
      return result;
    } else if (method == "tokenURI") {
      console.log("get Token URI" + ca + ":" + id);
      const result = await contract.tokenURI(id).then((response) => {
        return response;
      });
      return result;
    } else if (method == "balanceOf") {
      const result = await contract.balanceOf(id).then((response) => {
        return response;
      });
      return result;
    } else if (method == "supportInterface") {
      const result = await contract.supportInterface().then((response) => {
        return response;
      });
      return result;
    } else if (method == "_locked") {
      const result = await contract._locked(id).then((response) => {
        return response;
      });
      return result;
    }
  } catch (error) {
    console.error("can't get tokenInfo" + ca + ":" + method);
    console.error("Error details:", error);
    // エラー時はnullを返して、キャッシュされないようにする
    return null;
  }
};

export const getDonatePoint = async (contractAddress: string) => {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  try {
    const result = await contract._usePoint().then((response) => {
      return parseInt(response) / 1000000000000000000;
    });
    return result;
  } catch (error) {
    console.dir(error);
  }
};

export const getTokenInfo = async (ca: string) => {
  try {
    const result = {
      ca: ca,
      name: await getToken("name", ca),
      creator: await getToken("creator", ca),
      owner: await getToken("owner", ca),
      creatorOnly: await getToken("creatorOnly", ca),
      needPoint: await getDonatePoint(ca),
    };
    return result;
  } catch (error) {
    console.dir(error);
  }
};

export const getCallData = async (ca: string, mode, args) => {
  const contract = createWrappedContract(
    new ethers.Contract(ca, abi, provider)
  );
  const result = contract.interface.encodeFunctionData(mode, args);
  return result;
};

export const tokenOfOwnerByIndex = async (ca: string, eoa, index) => {
  const contract = createWrappedContract(
    new ethers.Contract(ca, abi, provider)
  );
  try {
    const result = await contract
      .tokenOfOwnerByIndex(eoa, index)
      .then((response) => {
        return response;
      });
    return result;
  } catch (error) {
    console.dir(error);
  }
};

export const hasTokenList = async (eoa: string) => {
  console.log("hasTokenList:" + eoa);
  showLoadingSpinner("所有NFTを検索中...");
  
  let result = [];
  try {
    const contracts = await manageConnect.getManager("contracts");
    let nftContractCount = 0;
    let processedCount = 0;
    
    // NFTコントラクトの数をカウント
    for (const contract of contracts) {
      if (contract[2] == "nft") {
        nftContractCount++;
      }
    }
    
    for (const contract of contracts) {
      if (contract[2] == "nft") {
        processedCount++;
        const ca = contract[0];
        updateLoadingMessage(`NFTコントラクトを確認中... (${processedCount}/${nftContractCount})`);
        
        const balance = await getToken("balanceOf", ca, eoa);
        for (let i = balance; i > 0; i--) {
          updateLoadingMessage(`トークンを取得中... ${ca.slice(0,6)}...${ca.slice(-4)} #${i}`);
          const tokenId = await tokenOfOwnerByIndex(ca, eoa, Number(i) - 1);
          const name = await getToken("name", ca);
          const tokenUri = await getToken("tokenURI", ca, tokenId);
          result.push({
            ca: ca,
            tokenId: tokenId,
            name: name,
            tokenUri: tokenUri,
          });
        }
      }
    }
  } finally {
    hideLoadingSpinner();
  }
  
  console.log("hasTokenList:" + eoa + " END");
  return result;
};

const getTokenConnect = {
  getToken,
  getTokenInfo,
  getCallData,
  hasTokenList,
};

export default getTokenConnect;
