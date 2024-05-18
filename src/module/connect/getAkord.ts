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

const getStack = async () => {
  const signer = await getSigner();
  const Url = CONST.AKORD_API_URL + "/list/" + signer;
  console.log("getStack:" + Url);
  try {
    const response = await fetch(Url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
  try {
    const response = await fetch(Url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

const getAkord = {
  upload,
  getStack,
  getSigner,
};

export default getAkord;
