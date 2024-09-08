import { ethers } from "ethers";
// import { CONST } from "../common/const";
// import util from "../common/utils";
import { ABIS } from "./abi";
const orderAbi = ABIS.orders;

export const order = async (contractAddress: string, value: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, orderAbi, signer);
  });

  try {
    const tx = await contract.order({ value: value });
    const receipt = await tx.wait();
    let orderNumber;
    if (receipt.status === 1) {
      console.log("Order transaction hash:", tx.hash);
      for (let i in receipt.logs) {
        if (receipt.logs[i].args) {
          orderNumber = receipt.logs[i].args.orderNum.toString(); // orderIdを返す
          console.log("Order serial number:" + orderNumber);
        }
      }
      return orderNumber;
    } else {
      console.error("Order transaction failed");
    }
  } catch (error) {
    console.error("Error placing order:", error);
  }
};

export const setUrl = async (
  contractAddress: string,
  orderId: string,
  url: string,
  filename: string
) => {
  alert(
    "ファイル管理に登録しますか?:" +
      " filename:" +
      filename +
      " url:" +
      url +
      "\nファイル管理が不要な場合このトランザクションをキャンセルすることが可能です。\n" +
      "必ずpermawebURLを記録してください。。"
  );
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, orderAbi, signer);
  });
  try {
    const result = await contract
      .setUrl(orderId, filename, url)
      .then((response) => {
        return response;
      });
    console.log("order selial number:" + result);
    return result;
  } catch (error) {
    console.dir(error);
  }
};

export const getAsset = async (contractAddress: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, orderAbi, signer);
  });
  try {
    const signer = await provider.getSigner();
    const eoa = await signer.getAddress();
    const result = await contract.getOrdersByEOA(eoa);

    const orderNums = Array.from(result[0]);
    const orderFilenames = Array.from(result[1]);
    const orderUrls = Array.from(result[2]);
    const orderPrices = Array.from(result[3]);
    const orderDates = Array.from(result[4]);

    const pivotedResult = orderNums.map((_, index) => ({
      Num: orderNums[index],
      Filename: orderFilenames[index],
      Url: orderUrls[index],
      Price: orderPrices[index],
      Date: orderDates[index],
    }));

    return pivotedResult;
  } catch (error) {
    console.dir(error);
  }
};

const orderConnect = {
  order,
  setUrl,
  getAsset,
};

export default orderConnect;
