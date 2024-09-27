import { ethers } from "ethers";
import { CONST } from "../common/const";
import { ABIS } from "./abi";

export const setManager = async (mode: string, input?: any) => {
  try {
    const abi = ABIS.manager;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = await provider.getSigner().then((signer) => {
      return new ethers.Contract(CONST.MANAGER_CA, abi, signer);
    });

    if (mode == "contracts") {
      const result = await contract.getAllContracts().then((response) => {
        return response;
      });
      return arrayPivot(result);
    } else if (mode == "creators") {
      const result = await contract.getAllCreators().then((response) => {
        return response;
      });
      return arrayPivot(result);
    } else if (mode == "getAdmins") {
      const result = await contract.getAdmins().then((response) => {
        return response;
      });
      return arrayCheck(result);
    } else if (mode == "setAdmin") {
      const result = await contract.setAdmin(input[0]).then((response) => {
        return response;
      });
    } else if (mode == "delAdmin") {
      const result = await contract.delAdmin(input[0]).then((response) => {
        return response;
      });
      return result;
    } else if (mode == "checkUser") {
      const result = await contract.checkUser().then((response) => {
        return response;
      });
      return result;
    } else if (mode == "hiddenCreator") {
      const result = await contract.hiddenCreator(input[0]).then((response) => {
        return response;
      });
    } else if (mode == "publicCreator") {
      const result = await contract.publicCreator(input[0]).then((response) => {
        return response;
      });
    } else if (mode == "setCreator") {
      const result = await contract
        .setCreator(input[0], input[1], input[2])
        .then((response) => {
          return response;
        });
    } else if (mode == "delCreator") {
      const result = await contract.delCreator(input[0]).then((response) => {
        return response;
      });
    } else if (mode == "setCreatorInfo") {
      const result = await contract
        .setCreatorInfo(input[0], input[1], input[2])
        .then((response) => {
          return response;
        });
    } else if (mode == "hiddenContract") {
      const result = await contract
        .hiddenContract(input[0])
        .then((response) => {
          return response;
        });
    } else if (mode == "publicContract") {
      const result = await contract
        .publicContract(input[0])
        .then((response) => {
          return response;
        });
    } else if (mode == "setContract") {
      const result = await contract
        .setContract(input[0], input[1], input[2])
        .then((response) => {
          return response;
        });
    } else if (mode == "deleteContract") {
      const result = await contract
        .deleteContract(input[0])
        .then((response) => {
          return response;
        });
    } else if (mode == "setContractInfo") {
      const result = await contract
        .setContractInfo(input[0], input[1], input[2])
        .then((response) => {
          return response;
        });
    }
  } catch (error) {
    console.dir(error);
  }
};

const arrayCheck = (input) => {
  let result = [];
  for (const key in input[0]) {
    result.push([input[0][key]]);
  }
  return result;
};

const arrayPivot = (input) => {
  let result = [];
  for (const key in input[0]) {
    result.push([input[0][key], input[1][key], input[2][key], input[3][key]]);
  }
  return result;
};

const setManagerConnect = {
  setManager,
};

export default setManagerConnect;
