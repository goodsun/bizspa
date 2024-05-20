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
    const movieArea = document.createElement("div");
    divElement.appendChild(movieArea);
    fetch(metadata["animation_url"])
      .then((response) => {
        const contentType = response.headers.get("content-type");
        if (contentType == "model/gltf-binary") {
          const objectElement = document.createElement("model-viewer");
          objectElement.id = "model-view";
          objectElement.classList.add("nft3DImage");
          objectElement.setAttribute("auto-rotate", "true");
          objectElement.setAttribute("autoplay", "true");
          objectElement.setAttribute("camera-controls", "true");
          objectElement.setAttribute("at-status", "not-presenting");
          objectElement.setAttribute("src", metadata["animation_url"]);
          movieArea.appendChild(objectElement);
          var script = document.createElement("script");
          script.src =
            "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
          script.type = "module";
          headJsArea.appendChild(script);
        } else if (contentType.startsWith("video/")) {
          const video = document.createElement("video");
          video.classList.add("nftMedia");
          video.controls = true;
          video.autoplay = true;
          video.src = metadata["animation_url"];
          video.setAttribute("type", contentType);
          movieArea.appendChild(video);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  if (metadata["external_url"]) {
    const externalArea = document.createElement("div");
    divElement.appendChild(externalArea);
    fetch(metadata["external_url"])
      .then((response) => {
        const contentType = response.headers.get("content-type");
        if (contentType.startsWith("application/")) {
          const objectElement = document.createElement("object");
          objectElement.classList.add("nftObject");
          objectElement.setAttribute("type", contentType);
          objectElement.setAttribute("data", metadata["external_url"]);
          externalArea.appendChild(objectElement);
          var script = document.createElement("script");
          script.src =
            "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
          script.type = "module";
          headJsArea.appendChild(script);
        } else if (contentType.startsWith("image/")) {
          const image = document.createElement("img");
          image.classList.add("nftMedia");
          image.src = metadata["external_url"];
          image.setAttribute("type", contentType);
          externalArea.appendChild(image);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const imgElement = document.createElement("img");
  imgElement.classList.add("nftImage");
  imgElement.src = metadata["image"];
  divElement.appendChild(imgElement);

  const attributes = metadata["attributes"];
  const attributeMediaArea = document.createElement("div");
  divElement.appendChild(attributeMediaArea);
  const attributeTextArea = document.createElement("div");
  divElement.appendChild(attributeTextArea);

  for (const key in attributes) {
    const titleElm = document.createElement("h4");
    titleElm.textContent = attributes[key]["trait_type"];
    const contentElm = document.createElement("p");
    contentElm.id = "attrebuteContent_" + key;
    if (attributes[key]["value"].slice(0, 4) == "http") {
      attributeMediaArea.appendChild(titleElm);
      attributeMediaArea.appendChild(contentElm);
      fetch(attributes[key]["value"])
        .then((response) => {
          const contentType = response.headers.get("content-type");
          if (contentType.startsWith("application/")) {
            const objectElement = document.createElement("object");
            objectElement.classList.add("nftObject");
            objectElement.setAttribute("type", contentType);
            objectElement.setAttribute("data", attributes[key]["value"]);
            contentElm.appendChild(objectElement);
            var script = document.createElement("script");
            script.src =
              "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
            script.type = "module";
            headJsArea.appendChild(script);
          } else if (contentType.startsWith("image/")) {
            const image = document.createElement("img");
            image.classList.add("nftMedia");
            image.src = attributes[key]["value"];
            image.setAttribute("type", contentType);
            contentElm.appendChild(image);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      attributeTextArea.appendChild(titleElm);
      attributeTextArea.appendChild(contentElm);
      contentElm.textContent = attributes[key]["value"];
    }
  }
  console.log(utils.getLocalTime() + " 遅延実行完了 " + tokenUri);
};
// ======================================

export const sendForm = (divElement: HTMLParagraphElement) => {
  setElement.setChild(
    divElement,
    "h2",
    "Send NFT",
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
    "h4",
    "Mint Token",
    "ID_midashi2",
    "mintToolTitle"
  );

  const makeElement = setElement.makeElement(
    "p",
    "TokenURIに有効なメタデータの格納先URLを入力してください",
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
