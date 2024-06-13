import { getManager } from "../connect/getManager";
import getTokenConnect from "../connect/getToken";

const getAllContracts = async (filter: Array<String>) => {
  let result = [];
  const allList = await getManager("contracts");
  for (const key in allList) {
    console.log("allContracts:" + key);
    console.dir(allList[key]);
    if (filter.includes(allList[key][2])) {
      result.push(allList[key]);
    }
  }
  return result;
};

const getMintableContract = async (eoa) => {
  const contracts = await getAllContracts(["nft", "sbt"]);
  console.log("getMintableContract: p1 getAllContract");
  console.dir(contracts);
  let result = [];
  for (const key in contracts) {
    console.log(
      "getMintableContract: loop " + key + " CA " + contracts[key][0]
    );
    const contract = await getTokenConnect.getTokenInfo(contracts[key][0]);
    if (
      !contract.creatorOnly ||
      contract.creator == eoa ||
      contract.owner == eoa
    ) {
      result.push(contract);
    } else {
      console.log(contract.name + " is not mintable");
      console.dir(contract);
    }
  }
  return result;
};

const manageService = {
  getMintableContract,
  getAllContracts,
};

export default manageService;
