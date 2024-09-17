import { router } from "../common/router";
import { ethers } from "ethers";
import { CONST } from "../common/const";
import setElement from "../snipet/setElement";
import utils from "../common/utils";

const mainContents = document.getElementById("mainContents");

export const getUI = async () => {
  const balance = await utils.checkBalance();
  const params = router.params;
  const makeDiscordDiv = document.createElement("div");
  makeDiscordDiv.classList.add("editorLink");
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
  Title.innerHTML = "Editor regist";
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
    "LOGIN",
    "LOGIN"
  );
  setEoaRegist.classList.add("w3p");
  makeDiscordCont.appendChild(setEoaRegist);

  setEoaRegist.addEventListener("click", async () => {
    const result = await sendRegist(params[2], setSecret.value);
    if (result.result) {
      console.log("id" + params[2]);
      console.log("eoa" + balance.eoa);
      console.log("secret" + setSecret.value);
      postAndRedirect("https://article.bizen.sbs/login.php", {
        id: params[2],
        eoa: balance.eoa,
        secret: setSecret.value,
      });
    } else {
      alert("check user result :" + result.message);
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
    console.error("There was a problem with the fetch operation:", error);
  }
};

function postAndRedirect(url, data) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    }
  }
  document.body.appendChild(form);
  form.submit(); // POSTリクエストを実行してリダイレクト
}

const editorConnect = {
  getUI,
};

export default editorConnect;
