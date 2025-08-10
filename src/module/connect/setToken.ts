import { ethers } from "ethers";
import { CONST } from "../common/const";
import { ABIS } from "./abi";
import { LANGSET } from "../common/lang";
import { bizenCache } from "../common/bizenCache";

export const mint = async (
  contractAddress: string,
  eoa: string,
  tokenUri: string
) => {
  console.log("EOA : " + eoa);
  console.log("TOKENURI : " + tokenUri);
  const abi = ABIS.nft;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, abi, signer);
  });
  const signer = await provider.getSigner();
  const sinerid = await signer.getAddress();
  try {
    const result = await contract
      .mint(eoa, tokenUri.trim())
      .then(() => {
        alert(LANGSET("WAIT_MINT_TX"));
        return "success";
      })
      .catch((e) => {
        alert(LANGSET("MINT_TX_STOP"));
        console.dir(e);
        throw new Error("txCancelMes");
      });
    return result;
  } catch (error) {
    console.dir(error);
  }
};

export const send = async (contractAddress: string, to: string, id: string) => {
  const abi = ABIS.nft;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, abi, signer);
  });
  const signer = await provider.getSigner();
  const from = await signer.getAddress();

  const result = await contract
    .transferFrom(from, to, id)
    .then((response) => {
      return response;
    })
    .catch((e) => {
      console.dir(e);
      throw new Error("txCancelMes");
    });
  return result;
};

export const burn = async (contractAddress: string, id: string) => {
  const abi = ABIS.nft;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, abi, signer);
  });
  
  // 作者を取得（キャッシュ無効化のため）
  const signer = await provider.getSigner();
  const creator = await signer.getAddress();
  
  const result = await contract
    .burn(id)
    .then(async (response) => {
      // バーン成功後、関連するキャッシュを無効化
      await bizenCache.handleTokenBurn(id, creator);
      console.log(`Cache invalidated for burned token: ${id}`);
      return response;
    })
    .catch((e) => {
      console.dir(e);
      throw new Error("txCancelMes");
    });
  return result;
};

export const burnable = async (contractAddress: string, id: string) => {
  const abi = ABIS.nft;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = await provider.getSigner().then((signer) => {
      return new ethers.Contract(contractAddress, abi, signer);
    });
    const result = await contract
      .burnable(id)
      .then((response) => {
        return response;
      })
      .catch((e) => {
        console.dir(e);
        return false;
      });
    return result;
  } catch (error) {
    console.warn("setToken burnable check:", error);
  }
};

export const donatePoint = async (contractAddress: string) => {
  console.log("DONTATIONS!!!");
  const abi = ABIS.nft;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = await provider.getSigner().then((signer) => {
    return new ethers.Contract(contractAddress, abi, signer);
  });
  try {
    const result = await contract
      ._usePoint()
      .then((response) => {
        return response;
      })
      .catch((e) => {
        console.dir(e);
        throw new Error("txCancelMes");
      });
    return result;
  } catch (error) {
    console.dir(error);
  }
  console.log("DONTATIONS!!!");
};

export const getSupportIf = async (contractAddress: string) => {
  try {
    const abi = ABIS.nft;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = await provider.getSigner().then((signer) => {
      return new ethers.Contract(contractAddress, abi, signer);
    });
    const result = await contract
      .supportInterface()
      .then((response) => {
        return response;
      })
      .catch((e) => {
        console.dir(e);
        throw new Error("txCancelMes");
      });
  } catch (error) {
    console.dir(error);
  }
};

const setToken = {
  mint,
  send,
  donatePoint,
  burn,
  burnable,
  getSupportIf,
};

export default setToken;
