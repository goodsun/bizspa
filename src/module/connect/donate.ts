import { ethers } from "ethers";
import { CONST } from "../common/const";
import util from "../common/util";
import { ABIS } from "./abi";
const donateAbi = ABIS.donate;

export const getDonate = async (
  mode: string,
  contractAddress: string,
  input?: Array<string>
) => {
  const rpc_url = CONST.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc_url);
  const contract = new ethers.Contract(contractAddress, donateAbi, provider);
  try {
    if (mode == "total") {
      const result = await contract.totalSupply().then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "allTotalUsed") {
      const result = await contract._allUsedPoints().then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "allTotalDonation") {
      const result = await contract._allTotalDonations().then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    }
  } catch (error) {
    console.dir(error);
  }
};

export const donate = async (
  mode: string,
  contractAddress: string,
  input?: Array<string>
) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, donateAbi, signer);
  });
  const signer = await provider.getSigner();
  const eoa = await signer.getAddress();

  try {
    if (mode == "donate") {
      const result = await contract
        .donate(input[0], {
          value: input[1],
        })
        .then((response) => {
          return response;
        });
      return result;
    } else if (mode == "balance") {
      const result = await contract.balanceOf(eoa).then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "total") {
      const result = await contract.totalSupply().then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "usedpoints") {
      const result = await contract._usedPoints(eoa).then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "totaldonations") {
      const result = await contract._totalDonations(eoa).then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "allTotalUsed") {
      const result = await contract._allUsedPoints().then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "allTotalDonation") {
      const result = await contract._allTotalDonations().then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "list") {
      console.log("test");
    }
  } catch (error) {
    console.dir(error);
  }
};
