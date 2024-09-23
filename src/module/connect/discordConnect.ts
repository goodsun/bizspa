import { router } from "../common/router";
import { ethers } from "ethers";
import { CONST } from "../common/const";
import setElement from "../snipet/setElement";

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
  Title.innerHTML = "Regist EOA";
  makeDiscordCont.appendChild(Title);

  const setSecret = setElement.makeInput(
    "input",
    "nameForm",
    "BaseInput",
    "SECRET"
  );
  console.log("PARAM SET" + params[3]);
  setSecret.value = params[3];
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
    if (result.result) {
      window.location.href = "/";
    }
  });
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
    console.warn("There was a problem with the fetch operation:", error);
  }
};

const discordConnect = {
  getUI,
};

export default discordConnect;
