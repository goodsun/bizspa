import { ethers } from "ethers";
import { CONST } from "../common/const";
import util from "../common/util";
import { ABIS } from "./abi";

export const donate = async (
  mode: string,
  contractAddress: string,
  input?: Array<string>
) => {
  console.log("MODE:" + mode);
  const abi = [
    "function balanceOf(address account) view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function donate(address donor) public payable",
  ];
  const donateAbi = ABIS.donate;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, abi, signer);
  });

  try {
    if (mode == "donate") {
      const result = await contract
        .donate(input[0], input[1], input[2])
        .then((response) => {
          return response;
        });
      return result;
    } else if (mode == "balance") {
      const signer = await provider.getSigner();
      const eoa = await signer.getAddress();
      const result = await contract.balanceOf(eoa).then((response) => {
        return response;
      });
      return util.waiToEth(Number(result));
    } else if (mode == "total") {
      const result = await contract.totalSupply().then((response) => {
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
