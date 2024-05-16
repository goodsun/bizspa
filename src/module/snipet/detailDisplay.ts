import utils from "../common/util";
import setElement from "./setElement";
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

  const makeInput = setElement.makeInput(
    "input",
    "sendTo",
    "BaseInput",
    "送信先(EOA)"
  );
  makeInput.classList.add("w7p");
  divElement.appendChild(makeInput);
  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "設定"
  );
  makeSubmit.classList.add("w3p");
  divElement.appendChild(makeSubmit);

  makeSubmit.addEventListener("click", async () => {
    if (confirm("TODO: NFT送信機能")) {
      console.log("送信しますよ");
    }
  });
};

export const makeForm = (divElement: HTMLParagraphElement) => {
  setElement.setChild(
    divElement,
    "h2",
    "タイトルを作る命令はこちら",
    "ID_midashi2",
    "CLASS_addclasses"
  );

  const makeElement = setElement.makeElement(
    "p",
    "MakeElementで作る",
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
  makeForm,
};

export default detailDisplay;
