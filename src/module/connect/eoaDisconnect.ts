import { router } from "../common/router";
import { ethers } from "ethers";
import { CONST } from "../common/const";
import setElement from "../snipet/setElement";
import utils from "../common/utils";
import getTokenConnect from "../connect/getToken";

const mainContents = document.getElementById("mainContents");

export const getUI = async () => {
  const balance = await utils.checkBalance();
  console.dir(balance);

  const memberscard = await getTokenConnect.getToken(
    "balanceOf",
    CONST.MEMBERSCARD_CA,
    balance.eoa
  );

  const makeDiscordDiv = document.createElement("div");
  makeDiscordDiv.classList.add("editorLink");
  mainContents.appendChild(makeDiscordDiv);
  const makeDiscordCont = document.createElement("div");
  makeDiscordDiv.id = "meta-section";
  makeDiscordCont.id = "meta-control";
  makeDiscordDiv.appendChild(makeDiscordCont);

  if (Number(memberscard) > 0) {
    //-- MAIN -------------------------------------
    const Title = document.createElement("H2");
    Title.classList.add("controlLavel");
    Title.innerHTML = "BURN MEMBERS CARD";
    makeDiscordCont.appendChild(Title);
    const Main = document.createElement("p");
    Main.classList.add("controlLavel");
    Main.innerHTML =
      "ウォレット解除を行うためにはメンバーカードのBURNが必要です。";
    makeDiscordCont.appendChild(Main);
    var childLink = document.createElement("a");
    childLink.href = "/account/" + balance.eoa;
    childLink.innerHTML =
      "こちらからメンバーカードのSBTを開き、BURNを行なってください。";
    makeDiscordCont.appendChild(childLink);
    /*
    const setBurnForm = setElement.makeInput(
      "submit",
      "submitID",
      "BaseSubmit",
      "BURN",
      "BURN"
    );
    setBurnForm.classList.add("w3p");
    makeDiscordCont.appendChild(setBurnForm);
    setBurnForm.addEventListener("click", async () => {
      sendBurn();
    });
    */
  } else {
    utils.getUserByEoa(balance.eoa).then((eoaUser) => {
      console.log("discord id:" + eoaUser.discordUser.DiscordId);
      if (eoaUser.discordUser.DiscordId != undefined) {
        const Title = document.createElement("H2");
        Title.classList.add("controlLavel");
        Title.innerHTML = "EOA disconnect";

        makeDiscordCont.appendChild(Title);
        const Main = document.createElement("p");
        Main.classList.add("controlLavel");
        Main.innerHTML =
          "DiscordID:" +
          eoaUser.discordUser.DiscordId +
          "<br>EOA:" +
          balance.eoa +
          "<br />こちらのウォレット接続を解除します";

        makeDiscordCont.appendChild(Main);
        const setBurnForm = setElement.makeInput(
          "submit",
          "submitID",
          "BaseSubmit",
          "DISCONNECT",
          "DISCONNECT"
        );
        setBurnForm.classList.add("w3p");
        makeDiscordCont.appendChild(setBurnForm);
        setBurnForm.addEventListener("click", async () => {
          const result = sendDiscon(eoaUser.discordUser.DiscordId);
          console.dir(result);
          window.location.href = "/disconnect";
        });
      } else {
        const Title = document.createElement("H2");
        Title.classList.add("controlLavel");
        Title.innerHTML = "EOA disconnect";

        makeDiscordCont.appendChild(Title);
        const Main = document.createElement("p");
        Main.classList.add("controlLavel");
        Main.innerHTML =
          balance.eoa +
          "は登録可能です。<br />DISCORDにて /regist コマンドを実行してください。 ";
        makeDiscordCont.appendChild(Main);
      }
    });
  }
};

const sendBurn = async () => {
  if (confirm("BURNしますか")) {
    alert("BURNしました");
  }
};

const sendDiscon = async (discordId) => {
  if (confirm("本当に接続解除しますか?")) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const eoa = await signer.getAddress();
    const data = {
      eoa: eoa,
      discordId: discordId,
    };
    const Url = CONST.BOT_API_URL + "disconnect";
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

const eoaDisconnect = {
  getUI,
};

export default eoaDisconnect;
