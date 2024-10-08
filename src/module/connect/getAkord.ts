import { ethers } from "ethers";
import { CONST } from "../common/const";

const getSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signerAddr = await signer.getAddress();
  return signerAddr;
};

const upload = async () => {
  const signer = await getSigner();
  console.log("SIGNER:" + signer);
};

const getStack = async (stackId) => {
  console.log("getStack:" + stackId);
  let Url = CONST.AKORD_API_URL + "/stack/" + stackId;
  try {
    const response = await fetch(Url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const stackDetail = await response.json();
    console.log("parmaweb Stack Detail");
    console.dir(stackDetail);
    return stackDetail.stack;
  } catch (error) {
    console.warn("There was a problem with the fetch operation:", error);
  }
};

const getStackList = async (searchKey) => {
  const signer = await getSigner();
  let Url = CONST.AKORD_API_URL + "/list/" + signer;
  if (searchKey != "") {
    Url = Url + "/" + searchKey;
  }
  console.log("getStackList:" + Url);
  try {
    const response = await fetch(Url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const assetList = await response.json();
    console.log("parmaweb uploaded list");
    console.dir(assetList);
    return assetList.stackList.sort(
      (b, a) => parseInt(a.createdAt) - parseInt(b.createdAt)
    );
  } catch (error) {
    console.warn("There was a problem with the fetch operation:", error);
  }
  try {
    const response = await fetch(Url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.warn("There was a problem with the fetch operation:", error);
  }
};

const getAkord = {
  upload,
  getStackList,
  getStack,
  getSigner,
};

export default getAkord;
