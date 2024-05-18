import utils from "../common/util";
import { router } from "../../module/common/router";
import setElement from "./setElement";
import setToken from "../connect/setToken";
const headJsArea = document.getElementById("pageHeader");
const footJsArea = document.getElementById("pageFooter");

export const showToken = (
  type: string,
  metadata: any,
  owner,
  tokenUri,
  divElement: HTMLParagraphElement,
  pElement: HTMLParagraphElement
) => {
  console.log("select type: " + type);
  console.dir(metadata);

  const tokenName = document.createElement("span");
  tokenName.textContent = metadata["name"];
  pElement.appendChild(tokenName);

  const h2Element = document.createElement("h2");
  h2Element.textContent = metadata["name"];
  divElement.appendChild(h2Element);

  const pDescriptionElement = document.createElement("p");
  pDescriptionElement.textContent = metadata["description"];
  divElement.appendChild(pDescriptionElement);

  const pOwnerElement = document.createElement("p");
  pOwnerElement.innerHTML =
    "owner: <a href='/assets/" + owner + "'>" + owner + "</a>";
  divElement.appendChild(pOwnerElement);

  if (metadata["animation_url"]) {
    const objectElement = document.createElement("model-viewer");
    objectElement.id = "model-view";
    objectElement.classList.add("nft3DImage");
    objectElement.setAttribute("auto-rotate", "true");
    objectElement.setAttribute("autoplay", "true");
    objectElement.setAttribute("camera-controls", "true");
    objectElement.setAttribute("at-status", "not-presenting");
    objectElement.setAttribute("src", metadata["animation_url"]);
    divElement.appendChild(objectElement);

    var script = document.createElement("script");
    script.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.type = "module";
    headJsArea.appendChild(script);
  }

  const imgElement = document.createElement("img");
  imgElement.classList.add("nftImage");
  imgElement.src = metadata["image"];
  divElement.appendChild(imgElement);

  console.log(utils.getLocalTime() + " 遅延実行完了 " + tokenUri);
};
// ======================================

export const sendForm = (divElement: HTMLParagraphElement) => {
  setElement.setChild(
    divElement,
    "h2",
    "送付",
    "ID_midashi2",
    "CLASS_addclasses"
  );

  const makeElement = setElement.makeElement(
    "p",
    "このNFTをEOA宛に送信します",
    null,
    "createdPelemBySetElement"
  );
  divElement.appendChild(makeElement);

  const sendToInput = setElement.makeInput(
    "input",
    "sendTo",
    "BaseInput",
    "送信先(EOA)"
  );
  sendToInput.classList.add("w7p");
  divElement.appendChild(sendToInput);
  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "設定"
  );
  makeSubmit.classList.add("w3p");
  divElement.appendChild(makeSubmit);

  makeSubmit.addEventListener("click", async () => {
    if (confirm("本当にこのNFTを" + sendToInput.value + "に送信しますか")) {
      const params = router.params;
      console.dir(params);
      const result = await setToken.send(
        params[2],
        sendToInput.value,
        params[3]
      );
      alert("送信しました");
    }
  });
};

export const mintForm = (divElement: HTMLParagraphElement) => {
  setElement.setChild(
    divElement,
    "h2",
    "Token Mint Page",
    "ID_midashi2",
    "CLASS_addclasses"
  );

  const makeElement = setElement.makeElement(
    "p",
    "NFTをミントします。",
    null,
    "createdPelemBySetElement"
  );
  divElement.appendChild(makeElement);

  const tokenUriForm = setElement.makeInput(
    "input",
    "TokenURI",
    "BaseInput",
    "TokenURI"
  );
  tokenUriForm.classList.add("wfull");
  divElement.appendChild(tokenUriForm);
  divElement.appendChild(setElement.br());

  const eoaForm = setElement.makeInput(
    "input",
    "input4",
    "BaseInput",
    "送信先EOA"
  );
  eoaForm.classList.add("w7p");
  divElement.appendChild(eoaForm);

  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "MINT"
  );
  makeSubmit.classList.add("w3p");
  divElement.appendChild(makeSubmit);

  const previewElement = document.createElement("div");
  previewElement.classList.add("previewArea");
  divElement.appendChild(previewElement);

  tokenUriForm.addEventListener("change", async (e) => {
    utils
      .fetchData(tokenUriForm.value)
      .then(async (tokenInfos) => {
        previewElement.innerHTML = "";
        detailDisplay.showToken(
          "pc_normal",
          tokenInfos,
          "",
          tokenUriForm.value,
          previewElement,
          previewElement
        );
      })
      .catch(() => {
        alert(tokenUriForm.value + " は無効なtokenURIです。");
      });
  });

  makeSubmit.addEventListener("click", async () => {
    const params = router.params;
    let message = tokenUriForm.value + " のメタデータでNFTを作成し\n";
    message += eoaForm.value + " 宛に送信します。\n";
    const donatePoint = await setToken.donatePoint(params[2]);
    if (donatePoint > 0) {
      message +=
        "このNFTのmintはdonatePointを" +
        utils.waiToEth(donatePoint) +
        "pt消費します。";
    }
    if (confirm(message)) {
      if (params[1] == "tokens") {
        console.log("setTokens mint : " + params[2]);
        const result = await setToken.mint(
          params[2],
          eoaForm.value,
          tokenUriForm.value
        );
        console.log("setTokens" + result);
      }
    }
  });
};

export const makeForm = (divElement: HTMLParagraphElement) => {
  setElement.setChild(
    divElement,
    "h2",
    "Make Form sample",
    "ID_midashi2",
    "CLASS_addclasses"
  );

  const makeElement = setElement.makeElement(
    "p",
    "Make Form sample",
    null,
    "createdPelemBySetElement"
  );
  divElement.appendChild(makeElement);

  const makeInput = setElement.makeInput(
    "input",
    "input1",
    "BaseInput",
    "初期値設定"
  );
  makeInput.classList.add("wfull");
  divElement.appendChild(makeInput);
  divElement.appendChild(setElement.br());

  const makeInput2 = setElement.makeInput(
    "input",
    "input2",
    "BaseInput",
    "初期値設定"
  );
  makeInput2.classList.add("w5p");
  divElement.appendChild(makeInput2);
  const makeInput3 = setElement.makeInput(
    "input",
    "input3",
    "BaseInput",
    "初期値設定"
  );
  makeInput3.classList.add("w5p");
  divElement.appendChild(makeInput3);
  divElement.appendChild(setElement.br());

  const makeInput4 = setElement.makeInput(
    "input",
    "input4",
    "BaseInput",
    "初期値設定"
  );
  makeInput4.classList.add("w7p");
  divElement.appendChild(makeInput4);

  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "設定"
  );
  makeSubmit.classList.add("w3p");
  divElement.appendChild(makeSubmit);

  makeSubmit.addEventListener("click", async () => {
    if (confirm("are you ok?")) {
      console.log("送信しますよ");
    }
  });

  console.log("meta Attrebute");
};

const detailDisplay = {
  showToken,
  sendForm,
  mintForm,
  makeForm,
};

export default detailDisplay;
