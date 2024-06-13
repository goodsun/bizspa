import utils from "../common/utils";
import { router } from "../../module/common/router";
import getTbaConnect from "../../module/connect/getTbaConnect";
import setElement from "./setElement";
import setToken from "../connect/setToken";
import getToken from "../connect/getToken";
import commonSnipet from "../snipet/common";
const headJsArea = document.getElementById("pageHeader");
const footJsArea = document.getElementById("pageFooter");

export const showToken = async (
  type: string,
  metadata: any,
  owner,
  tokenUri,
  divElement: HTMLParagraphElement,
  tokenBoundAccount
) => {
  console.log("select type: " + type);
  console.dir(metadata);
  console.dir(tokenBoundAccount);

  const h2Element = document.createElement("h1");
  h2Element.textContent = metadata["name"];
  divElement.appendChild(h2Element);

  const pDescriptionElement = document.createElement("p");
  pDescriptionElement.innerHTML = metadata["description"].replace(
    /\n/g,
    "<br />"
  );
  divElement.appendChild(pDescriptionElement);

  const tbaOwner = await getTbaConnect.checkOwner(owner);
  const tbaToken = await getTbaConnect.checkToken(owner);
  const pOwnerElement = document.createElement("p");
  if (tbaOwner) {
    pOwnerElement.appendChild(commonSnipet.span("ca: "));
    pOwnerElement.appendChild(
      commonSnipet.eoa(owner, { link: "/assets/" + owner, target: "" })
    );

    const parentTag = document.createElement("span");
    parentTag.innerHTML +=
      " <a class='parentTag' href='/assets/" + tbaOwner + "'> parent </a>";
    pOwnerElement.appendChild(parentTag);

    const tbaTag = document.createElement("span");
    tbaTag.innerHTML +=
      "<a class='tbaTag' href='/tokens/" +
      tbaToken[1] +
      "/" +
      tbaToken[2] +
      "'> token </a>";
    pOwnerElement.appendChild(tbaTag);
  } else if (owner) {
    console.log("OWNER:" + owner);
    pOwnerElement.appendChild(commonSnipet.span("owner: "));
    pOwnerElement.appendChild(
      commonSnipet.eoa(owner, { link: "/assets/" + owner, target: "" })
    );

    await utils.getUserByEoa(owner).then((eoaUser) => {
      if (eoaUser.type == "tba") {
        alert("DISP EOAUSER SHOWTOKEN");
      } else if (eoaUser.type == "discordConnect") {
        pOwnerElement.appendChild(
          commonSnipet.getDiscordUserByEoa(
            eoaUser.discordUser,
            "span",
            "discordNameDisp"
          )
        );
      }
    });
  }

  if (tokenBoundAccount) {
    const tbaOwner = await getTbaConnect.checkOwner(tokenBoundAccount);
    if (tbaOwner) {
      pOwnerElement.appendChild(commonSnipet.span(" ｜ TBA: "));
      pOwnerElement.appendChild(
        commonSnipet.eoa(tokenBoundAccount, {
          link: "/assets/" + tokenBoundAccount,
          target: "",
        })
      );
    }
  }

  if (owner != "") {
    divElement.appendChild(pOwnerElement);
  }

  if (metadata["animation_url"]) {
    const linkurl =
      "https://fs.bon-soleil.com/modelviewer/?model-view-src=" +
      metadata["animation_url"];
    const movieArea = document.createElement("div");

    divElement.appendChild(movieArea);
    fetch(metadata["animation_url"])
      .then((response) => {
        const contentType = response.headers.get("content-type");
        if (contentType == "model/gltf-binary") {
          if (utils.containsBrowserName("MetaMaskMobile")) {
            alert(
              "このページには3D表示コンテンツが含まれています。\n3Dコンテンツの閲覧は ネイティブブラウザをご利用ください。"
            );
            const attention = document.createElement("p");
            attention.innerHTML =
              "<b>メタマスクでは３D表示ができません</b><br />左のリンクをクリックしネイティブブラウザで御覧ください。 ";
            attention.appendChild(
              commonSnipet.linkCopy(
                linkurl,
                "３D表示リンクがクリップボードにコピーされました。\nネイティブブラウザで御覧ください"
              )
            );
            movieArea.appendChild(attention);
          } else {
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
          }
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
  const attributeDivArea = document.createElement("div");
  divElement.appendChild(attributeDivArea);

  for (const key in attributes) {
    const titleElm = document.createElement("h4");
    titleElm.textContent = attributes[key]["trait_type"];
    if (type == "metabuilder") {
      const edLink = document.createElement("span");
      edLink.id = "attr_ed_" + key;
      edLink.classList.add("litelink");
      edLink.classList.add("attrControlLink");
      edLink.textContent = "EDIT";
      titleElm.appendChild(edLink);
      const upLink = document.createElement("span");
      upLink.id = "attr_up_" + key;
      upLink.classList.add("litelink");
      upLink.classList.add("attrControlLink");
      upLink.textContent = "UP";
      titleElm.appendChild(upLink);
      const downLink = document.createElement("span");
      downLink.id = "attr_dw_" + key;
      downLink.classList.add("litelink");
      downLink.classList.add("attrControlLink");
      downLink.textContent = "DOWN";
      titleElm.appendChild(downLink);
      const delLink = document.createElement("span");
      delLink.id = "attr_rm_" + key;
      delLink.classList.add("litelink");
      delLink.classList.add("attrControlLink");
      delLink.textContent = "DEL";
      titleElm.appendChild(delLink);
    }
    const contentElm = document.createElement("p");
    contentElm.id = "attrebuteContent_" + key;
    console.log("ValueCheck:" + attributes[key]["value"]);
    if (attributes[key]["value"].slice(0, 4) == "http") {
      attributeDivArea.appendChild(titleElm);
      attributeDivArea.appendChild(contentElm);
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
      attributeDivArea.appendChild(titleElm);
      attributeDivArea.appendChild(contentElm);
      contentElm.innerHTML = attributes[key]["value"].replace(/\n/g, "<br />");
    }
  }
  console.log(utils.getLocalTime() + " 遅延実行完了 " + tokenUri);

  if (tbaOwner) {
    const balance = await utils.checkBalance();
    if (utils.isAddressesEqual(tbaOwner, balance.eoa)) {
      detailDisplay.tbaSendForm(tbaOwner, owner, divElement);
    }
  }
};
// ======================================

export const tbaSendForm = (
  parent,
  owner,
  divElement: HTMLParagraphElement
) => {
  const params = router.params;

  const ca = params[2];
  const id = params[3];

  const h2Element = document.createElement("p");
  divElement.appendChild(h2Element);

  h2Element.innerHTML = "TBA CONTROL";
  h2Element.appendChild(commonSnipet.br());
  h2Element.appendChild(commonSnipet.span("Account-Bound NFT: "));
  h2Element.appendChild(
    commonSnipet.eoa(ca, { link: "/tokens/" + ca, target: "" })
  );

  h2Element.appendChild(
    commonSnipet.link(" #" + id, "/tokens/" + ca + "/" + id)
  );

  h2Element.appendChild(commonSnipet.br());
  h2Element.appendChild(commonSnipet.span("parent: "));
  h2Element.appendChild(
    commonSnipet.eoa(parent, { link: "/assets/" + parent, target: "" })
  );

  h2Element.appendChild(commonSnipet.br());
  h2Element.appendChild(commonSnipet.span("owner: "));
  h2Element.appendChild(
    commonSnipet.eoa(owner, { link: "/assets/" + owner, target: "" })
  );

  const makeElement = setElement.makeElement(
    "p",
    "このNFTをTBAからEOAに送信します",
    null,
    "createdPelemBySetElement"
  );
  divElement.appendChild(makeElement);

  const discordUserCheckArea = document.createElement("div");
  divElement.appendChild(discordUserCheckArea);

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
    "SEND TOKEN",
    "SEND TOKEN"
  );
  makeSubmit.classList.add("w3p");
  divElement.appendChild(makeSubmit);

  sendToInput.addEventListener("change", async (event) => {
    discordUserCheckArea.innerHTML = "";
    discordUserCheckArea.classList.remove("sendToUser");
    if (sendToInput.value != "") {
      utils.getUserByEoa(sendToInput.value).then((eoaUser) => {
        if (eoaUser.type == "tba") {
          alert("DISP EOAUSER TBASEND");
        } else if (eoaUser.type == "discordConnect") {
          discordUserCheckArea.classList.add("sendToUser");
          discordUserCheckArea.appendChild(
            commonSnipet.discordByEoa(eoaUser.discordUser)
          );
        }
      });
    }
  });

  makeSubmit.addEventListener("click", async () => {
    if (confirm("本当にこのNFTを" + sendToInput.value + "に送信しますか")) {
      const args = [owner, sendToInput.value, id];
      const value = 0;
      const calldata = await getToken.getCallData(ca, "transferFrom", args);
      console.log("CALLDATA:" + calldata);
      const result = await getTbaConnect.executeCall(
        owner,
        ca,
        value,
        calldata
      );
      console.log(result);
      alert("送信しました");
    }
  });
};

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

  const discordUserCheckArea = document.createElement("div");
  divElement.appendChild(discordUserCheckArea);

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
    "SEND TOKEN",
    "SEND TOKEN"
  );
  makeSubmit.classList.add("w3p");
  divElement.appendChild(makeSubmit);

  sendToInput.addEventListener("change", async (event) => {
    discordUserCheckArea.innerHTML = "";
    discordUserCheckArea.classList.remove("sendToUser");
    if (sendToInput.value != "") {
      utils.getUserByEoa(sendToInput.value).then((eoaUser) => {
        if (eoaUser.type == "tba") {
          alert("DISP EOAUSER SEND");
        } else if (eoaUser.type == "discordConnect") {
          discordUserCheckArea.classList.add("sendToUser");
          discordUserCheckArea.appendChild(
            commonSnipet.discordByEoa(eoaUser.discordUser)
          );
        }
      });
    }
  });

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
  return divElement;
};

export const tbaRegist = (
  divElement: HTMLParagraphElement,
  ca: string,
  id: string,
  eoa: string
) => {
  setElement.setChild(
    divElement,
    "h2",
    "RegistTBA",
    "ID_midashi2",
    "CLASS_addclasses"
  );

  const makeElement = setElement.makeElement(
    "p",
    "このNFTにTBAを発行します",
    null,
    "createdPelemBySetElement"
  );
  divElement.appendChild(makeElement);

  const makeSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "TBA REGIST",
    "TBA REGIST"
  );
  makeSubmit.classList.add("wfull");
  divElement.appendChild(makeSubmit);

  makeSubmit.addEventListener("click", async () => {
    if (confirm("本当にTBAを発行しますか\nToken info\n" + ca + " #" + id)) {
      const tbaOwner = await getTbaConnect.createAccount(ca, id);
      alert("registerd ： " + ca + " #" + id);
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
  tokenUriForm.classList.add("w7p");
  divElement.appendChild(tokenUriForm);

  const vaultSelect = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "OPEN VAULT",
    "OPEN VAULT"
  );
  vaultSelect.classList.add("w3p");
  divElement.appendChild(vaultSelect);
  divElement.appendChild(commonSnipet.br());

  vaultSelect.addEventListener("click", async () => {
    utils.toggleModal();
  });

  const discordUserCheckArea = document.createElement("div");
  divElement.appendChild(discordUserCheckArea);

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
    "MINT",
    "MINT"
  );
  makeSubmit.classList.add("w3p");
  divElement.appendChild(makeSubmit);

  const previewElement = document.createElement("div");
  previewElement.classList.add("previewArea");
  divElement.appendChild(previewElement);

  eoaForm.addEventListener("change", async (event) => {
    discordUserCheckArea.innerHTML = "";
    discordUserCheckArea.classList.remove("sendToUser");
    if (eoaForm.value != "") {
      utils.getUserByEoa(eoaForm.value).then((eoaUser) => {
        if (eoaUser.type == "tba") {
          alert("DISP EOAUSER MINT");
        } else if (eoaUser.type == "discordConnect") {
          discordUserCheckArea.classList.add("sendToUser");
          discordUserCheckArea.appendChild(
            commonSnipet.discordByEoa(eoaUser.discordUser)
          );
        }
      });
    }
  });

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
          ""
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
    console.log("donatePoint:" + donatePoint);
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
  divElement.appendChild(commonSnipet.br());

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
  divElement.appendChild(commonSnipet.br());

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
    "SETTING",
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
  tbaSendForm,
  mintForm,
  tbaRegist,
  makeForm,
};

export default detailDisplay;
