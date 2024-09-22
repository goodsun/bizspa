import { router } from "../common/router";
import { ethers } from "ethers";
import { CONST } from "../common/const";
import setElement from "../snipet/setElement";
import setToken from "../connect/setToken";
import utils from "../common/utils";
import { LANGSET } from "../common/lang";
const mainContents = document.getElementById("mainContents");

export const getUI = async () => {
  const balance = await utils.checkBalance();
  const params = router.params;
  const makeDiscordDiv = document.createElement("div");
  makeDiscordDiv.classList.add("memberSbtLink");
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
  Title.innerHTML = "Mint Member SBT";
  makeDiscordCont.appendChild(Title);
  const main = document.createElement("p");
  main.innerHTML = CONST.MEMBERSCARD_CA;
  makeDiscordCont.appendChild(main);

  if (balance.dpoint >= 1) {
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
      "LOGIN",
      "LOGIN"
    );
    setEoaRegist.classList.add("w3p");
    makeDiscordCont.appendChild(setEoaRegist);

    setEoaRegist.addEventListener("click", async () => {
      const result = await sendRegist(params[2], setSecret.value);
      if (result.result) {
        console.dir(result.role);
        if (result.role.includes("Holder &Fan")) {
          alert("メンバーSBTを発行します。");
          const result = await setToken.mint(
            CONST.MEMBERSCARD_CA, // CA
            balance.eoa, // EOA
            params[2] // DISCORD_ID
          );
          if (result == "success") {
            alert(LANGSET("WAIT_MINT_TX"));
            window.location.href = "/account/" + balance.eoa;
          } else if (result == undefined) {
            alert(LANGSET("MEMBER_SBT_EXIST"));
            window.location.href = "/account/" + balance.eoa;
          }
        } else {
          alert("MEMBER_NOT_PARMITTED");
        }
      } else {
        alert("check user result :" + result.message);
      }
    });
  } else {
    const pointNotExist = document.createElement("p");
    pointNotExist.innerHTML = LANGSET("POINT_NOT_EXIST");
    makeDiscordCont.appendChild(pointNotExist);
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

const memberSbtConnect = {
  getUI,
};

export default memberSbtConnect;
