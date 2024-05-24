import { ethers } from "ethers";
import { CONST } from "../common/const";
import { ABIS } from "./abi";
import { getManager } from "../../module/connect/getManager";
const rpc_url = CONST.RPC_URL;
const provider = new ethers.JsonRpcProvider(rpc_url);

const getTbaContracts = async () => {
  const result = await getManager("contracts");
  var tbaContracts = result.filter(function (contract) {
    return contract[2] == "tba";
  });
  return tbaContracts;
};

const getTbaInfo = async (ca, id) => {
  var tbaContracts = await getTbaContracts();
  const tba = [];
  for (const key in tbaContracts) {
    console.dir(tbaContracts[key]);
    const tokenBoundAccount = await getTba.getAddress(
      tbaContracts[key][1],
      tbaContracts[key][0],
      CONST.BC_NETWORK_ID,
      ca,
      id,
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

export const getAddress = async (
  contractAddress: string,
  implementation: string,
  chainId: string,
  tokenContract: string,
  tokenId: string,
  salt: string
) => {
  const abi = ABIS.tbaRegistry;
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    const result = await contract
      .account(implementation, chainId, tokenContract, tokenId, salt)
      .then((response) => {
        return response;
      });
    return result;
  } catch (error) {
    console.dir(error);
  }
};

export const checkOwner = async (contractAddress: string) => {
  const abi = ABIS.tbaAccount;
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const result = await contract
    .owner()
    .then((response) => {
      return response;
    })
    .catch(() => {
      return false;
    });
  return result;
};

export const checkToken = async (contractAddress: string) => {
  const abi = ABIS.tbaAccount;
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const result = await contract
    .token()
    .then((response) => {
      return response;
    })
    .catch(() => {
      return false;
    });
  return result;
};

export const executeCall = async (
  tokenBoundAccount: string, // TBAのCA
  contractAddress: string, //操作対象CA
  value: number, // 送信金額
  byteCode: string // 操作対象に流すcalldata
) => {
  const abi = ABIS.tbaAccount;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(tokenBoundAccount, abi, signer);
  });
  const result = await contract
    .executeCall(contractAddress, value, byteCode)
    .then((response) => {
      return response;
    })
    .catch((e) => {
      console.dir(e);
      throw new Error("can not control");
    });
  return result;
};

export const createAccount = async (ca: string, id: string) => {
  var tbaContracts = await getTbaContracts();
  const abi = ABIS.tbaRegistry;
  const tbaRegistCa = tbaContracts[0][1];
  const tbaAccountCa = tbaContracts[0][0];

  const browserProvider = new ethers.BrowserProvider(window.ethereum);
  const contract = await browserProvider.getSigner().then((signer) => {
    return new ethers.Contract(tbaRegistCa, abi, signer);
  });

  const result = await contract
    .createAccount(
      tbaAccountCa,
      CONST.BC_NETWORK_ID,
      ca,
      id,
      CONST.TBA_SALT,
      "0x"
    )
    .catch((e) => {
      throw new Error("txCancelMes");
    });
  return result;
};

export const getTba = {
  getTbaInfo,
  getAddress,
  executeCall,
  checkOwner,
  checkToken,
  createAccount,
};
