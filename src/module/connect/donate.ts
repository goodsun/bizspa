import { ethers } from "ethers";
import { CONST } from "../common/const";
import util from "../common/util";
import { ABIS } from "./abi";

export const donate = async (
  mode: string,
  contractAddress: string,
  input?: Array<string>
) => {
  const donateAbi = ABIS.donate;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, donateAbi, signer);
  });
  const signer = await provider.getSigner();
  const eoa = await signer.getAddress();

  try {
    if (mode == "donate") {
      const result = await contract
        .donate(input[0], input[1], input[2])
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
