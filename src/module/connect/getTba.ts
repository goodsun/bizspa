import { ethers } from "ethers";
import { CONST } from "../common/const";
import { ABIS } from "./abi";
const rpc_url = CONST.RPC_URL;
const provider = new ethers.JsonRpcProvider(rpc_url);

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

export const executeCall = async (contractAddress: string, input) => {
  const abi = ABIS.tbaAccount;
  const contract = new ethers.Contract(contractAddress, abi, provider);
  /*
  inputs: [
    { internalType: "address", name: "to", type: "address", },
    { internalType: "uint256", name: "value", type: "uint256", },
    { internalType: "bytes", name: "data", type: "bytes", },
  ],
  */
  const result = await contract
    .executeCall(input[0], input[1], input[2])
    .then((response) => {
      return response;
    })
    .catch((e) => {
      console.dir(e);
      throw new Error("registable");
    });
  return result;
};

export const getTba = {
  getAddress,
  executeCall,
  checkOwner,
  checkToken,
};
