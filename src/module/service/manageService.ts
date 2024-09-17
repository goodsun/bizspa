import getManagerConnect from "../connect/getManager";
import getTokenConnect from "../connect/getToken";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getAllContracts = async (filter: Array<String>) => {
  let result = [];
  const allList = await getManagerConnect.getManager("contracts");
  for (const key in allList) {
    if (filter.includes(allList[key][2])) {
      result.push(allList[key]);
    }
  }
  console.log("manageService.getAllContracts");
  console.dir(result);
  return result;
};

const getMintableContract = async (eoa) => {
  await sleep(200);
  const contracts = await getAllContracts(["sbt"]);
  let result = [];
  for (const key in contracts) {
    console.log(
      "getMintableContract: loop " + key + " CA " + contracts[key][0]
    );
    const contract = await checkMintable(contracts[key][0], eoa);
    if (contract) {
      result.push(contract);
    }
    /*
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
      */
  }
  console.log("manageService.getMintableContract");
  console.dir(result);
  return result;
};

const getOwnTokens = async (eoa) => {
  const result = await getTokenConnect.hasTokenList(eoa);
  console.dir(result);
  return result;
};

const checkMintable = async (ca, eoa) => {
  const contract = await getTokenConnect.getTokenInfo(ca);
  if (
    !contract.creatorOnly ||
    contract.creator == eoa ||
    contract.owner == eoa
  ) {
    return contract;
  } else {
    console.log(contract.name + " is not mintable");
    console.dir(contract);
  }
  return false;
};

const manageService = {
  getMintableContract,
  getAllContracts,
  getOwnTokens,
  checkMintable,
};

export default manageService;
