import { router } from "../common/router";
import utils from "../common/utils";
import { ethers } from "ethers";
import { CONST } from "../common/const";
import { ABIS } from "./abi";
import setElement from "../snipet/setElement";
import detailDisplay from "../snipet/detailDisplay";

const mainContents = document.getElementById("mainContents");

export const getUI = async () => {
  const params = router.params;
  const makeDiscordDiv = document.createElement("div");
  makeDiscordDiv.classList.add("metadatabuilder");
  mainContents.appendChild(makeDiscordDiv);
  const makeDiscordDisp = document.createElement("div");
  const makeDiscordCont = document.createElement("div");
  makeDiscordDiv.id = "meta-section";
  makeDiscordDisp.id = "meta-disp";
  makeDiscordCont.id = "meta-control";
  makeDiscordDiv.appendChild(makeDiscordDisp);
  makeDiscordDiv.appendChild(makeDiscordCont);

  //-- MAIN -------------------------------------
  const Title = document.createElement("H2");
  Title.classList.add("controlLavel");
  Title.innerHTML = "Regist EOA | for Connect Discord";
  makeDiscordCont.appendChild(Title);

  const setSecret = setElement.makeInput(
    "input",
    "nameForm",
    "BaseInput",
    "SECRET"
  );
  setSecret.classList.add("w7p");
  makeDiscordCont.appendChild(setSecret);

  const setEoaRegist = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "REGIST",
    "REGIST"
  );
  setEoaRegist.classList.add("w3p");
  makeDiscordCont.appendChild(setEoaRegist);

  setEoaRegist.addEventListener("click", async () => {
    const result = await sendRegist(params[2], setSecret.value);
    alert("check user result :" + result.message);
    console.dir(result);
    location.reload();
  });
};

const getUserByEoa = async (eoa) => {
  const Url = CONST.BOT_API_URL + "member/" + eoa;
  try {
    const response = await fetch(Url);
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

const sendRegist = async (discordId, secret) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const eoa = await signer.getAddress();
  const data = {
    eoa: eoa,
    discordId: discordId,
    secret: secret,
  };
  const Url = CONST.BOT_API_URL + "regist";
  try {
    const response = await fetch(Url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

const discordConnect = {
  getUI,
  getUserByEoa,
};

export default discordConnect;
