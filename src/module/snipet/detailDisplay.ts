import utils from "../common/utils";
import { LANGSET } from "../common/lang";
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
  tokenBoundAccount,
  caSymbol
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
  pOwnerElement.classList.add("tokenOwnerInfo");
  if (tbaOwner) {
    pOwnerElement.appendChild(commonSnipet.span("ca: "));
    pOwnerElement.appendChild(
      commonSnipet.eoa(owner, {
        link: "/account/" + owner,
        target: "",
        icon: "copy",
      })
    );

    const parentTag = document.createElement("span");
    parentTag.innerHTML +=
      " <a class='parentTag' href='/account/" + tbaOwner + "'> parent </a>";
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
    pOwnerElement.appendChild(commonSnipet.span("owner: "));
    pOwnerElement.appendChild(
      commonSnipet.eoa(owner, {
        link: "/account/" + owner,
        target: "",
        icon: "copy",
      })
    );

    await utils.getUserByEoa(owner).then((eoaUser) => {
      if (eoaUser.type == "tba") {
        pOwnerElement.appendChild(
          commonSnipet.getTbaOwnerSnipet(
            eoaUser.tbaInfo,
            "span",
            "discordNameDisp"
          )
        );
      } else if (eoaUser.type == "discordConnect") {
        pOwnerElement.appendChild(
          commonSnipet.getDiscordUserSnipet(
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
      pOwnerElement.appendChild(commonSnipet.span(" ｜ TBA "));
      pOwnerElement.appendChild(
        commonSnipet.eoa(tokenBoundAccount, {
          link: "/account/" + tokenBoundAccount,
          target: "",
          icon: "bag",
        })
      );
    }
  }

  if (owner != "") {
    divElement.appendChild(pOwnerElement);
  }

  const nftImgDiv = document.createElement("div");
  nftImgDiv.classList.add("nftImageArea");
  divElement.appendChild(nftImgDiv);
  const imgElement = document.createElement("img");
  imgElement.classList.add("nftImage");
  imgElement.src = metadata["image"];
  nftImgDiv.appendChild(imgElement);

  if (metadata["animation_url"]) {
    fetch(metadata["animation_url"]).then((response) => {
      const contentType = response.headers.get("content-type");
      if (contentType == "model/gltf-binary") {
        const link = document.createElement("a");
        link.target = "blank";
        link.href = "/modelviewer/?model-view-src=" + metadata["animation_url"];
        nftImgDiv.appendChild(link);
        var icon3d = document.createElement("i");
        icon3d.classList.add("far", "fa-solid", "fa-cubes", "cubeMark");
        link.appendChild(icon3d);
      } else {
        const link = document.createElement("a");
        link.target = "blank";
        link.href =
          "/viewer/?src=" + metadata["animation_url"] + "&type=" + contentType;
        nftImgDiv.appendChild(link);
        var iconVideo = document.createElement("i");
        iconVideo.classList.add("far", "fa-solid", "fa-film", "cubeMark");
        link.appendChild(iconVideo);
      }
    });
  }

  const externalArea = document.createElement("div");
  externalArea.classList.add("nftExternal");
  externalArea.style.display = "none";
  divElement.appendChild(externalArea);
  if (metadata["external_url"]) {
    fetch(metadata["external_url"])
      .then((response) => {
        externalArea.style.display = "block";
        const contentType = response.headers.get("content-type");
        if (contentType.startsWith("application/")) {
          /*
          const objectElement = document.createElement("object");
          objectElement.classList.add("nftObject");
          objectElement.setAttribute("type", contentType);
          objectElement.setAttribute("data", metadata["external_url"]);
          externalArea.appendChild(objectElement);
          */
          const link = document.createElement("a");
          link.href = metadata["external_url"];
          var iconExtra = document.createElement("i");
          iconExtra.classList.add(
            "far",
            "fa-regular",
            "fa-file-pdf",
            "cubeMark"
          );
          if (metadata["animation_url"]) {
            iconExtra.classList.add("cubeMark2");
          }

          link.appendChild(iconExtra);
          nftImgDiv.appendChild(link);
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
      if (caSymbol != "SBT") {
        if (caSymbol.includes("SBT")) {
          alert(
            "このNFTはSBTの可能性があります。送信できない可能性があります。"
          );
        }
        detailDisplay.tbaSendForm(tbaOwner, owner, divElement);
      }
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
    commonSnipet.eoa(ca, { link: "/tokens/" + ca, target: "", icon: "fa-copy" })
  );

  h2Element.appendChild(
    commonSnipet.link(" #" + id, "/tokens/" + ca + "/" + id)
  );

  h2Element.appendChild(commonSnipet.br());
  h2Element.appendChild(commonSnipet.span("parent: "));
  h2Element.appendChild(
    commonSnipet.eoa(parent, {
      link: "/account/" + parent,
      target: "",
      icon: "copy",
    })
  );

  h2Element.appendChild(commonSnipet.br());
  h2Element.appendChild(commonSnipet.span("owner: "));
  h2Element.appendChild(
    commonSnipet.eoa(owner, {
      link: "/account/" + owner,
      target: "",
      icon: "copy",
    })
  );

  const makeElement = setElement.makeElement(
    "p",
    LANGSET("SENDTOEOA"),
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

  sendToInput.addEventListener("input", async (event) => {
    discordUserCheckArea.innerHTML = "";
    discordUserCheckArea.classList.remove("sendToUser");

    if (sendToInput.value != "") {
      discordUserCheckArea.classList.add("sendToUser");
      const checkSend = await getTbaConnect.sendToEoaCheck(
        sendToInput.value,
        { ca: ca, tokenId: id },
        0
      );
      if (!checkSend.result) {
        alert(LANGSET("CANTSEND") + " : " + checkSend.reason);
        return false;
      }

      utils.getUserByEoa(sendToInput.value).then((eoaUser) => {
        if (eoaUser.type == "tba") {
          discordUserCheckArea.appendChild(
            commonSnipet.dispTbaOwner(eoaUser.tbaInfo)
          );
          utils.getUserByEoa(checkSend.eoa).then((eoaUser) => {
            if (eoaUser.type == "discordConnect") {
              discordUserCheckArea.appendChild(
                commonSnipet.dispDiscordUser(eoaUser.discordUser)
              );
            } else if (eoaUser.type == "eoa") {
              discordUserCheckArea.appendChild(
                commonSnipet.scan(checkSend.eoa, "Final owner", "unknownCa")
              );
            }
          });
        } else if (eoaUser.type == "discordConnect") {
          discordUserCheckArea.appendChild(
            commonSnipet.dispDiscordUser(eoaUser.discordUser)
          );
        } else if (eoaUser.type == "eoa") {
          discordUserCheckArea.appendChild(
            commonSnipet.scan(eoaUser.eoa, "UNKNOWN EOA", "unknownEoa")
          );
        } else if (eoaUser.type == "ca") {
          discordUserCheckArea.appendChild(
            commonSnipet.scan(eoaUser.eoa, "UNKNOWN CA", "unknownCa")
          );
        }
      });
    }
  });

  makeSubmit.addEventListener("click", async () => {
    const checkSend = await getTbaConnect.sendToEoaCheck(
      sendToInput.value,
      { ca: ca, tokenId: id },
      0
    );
    if (!checkSend.result) {
      alert(LANGSET("CANTSEND") + " : " + checkSend.reason);
      return false;
    }
    if (
      confirm(LANGSET("SENDNFTBEF") + sendToInput.value + LANGSET("SENDNFTAFT"))
    ) {
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
      alert(LANGSET("SENDED"));
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
    LANGSET("SENDTOEOA"),
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

  sendToInput.addEventListener("input", async (event) => {
    discordUserCheckArea.innerHTML = "";
    discordUserCheckArea.classList.remove("sendToUser");

    const params = router.params;

    const checkSend = await getTbaConnect.sendToEoaCheck(
      sendToInput.value,
      { ca: params[2], tokenId: params[3] },
      0
    );

    if (!checkSend.result) {
      alert(LANGSET("CANTSEND") + " : " + checkSend.reason);
      return false;
    }

    if (sendToInput.value != "") {
      utils.getUserByEoa(sendToInput.value).then((eoaUser) => {
        discordUserCheckArea.classList.add("sendToUser");
        if (eoaUser.type == "tba") {
          discordUserCheckArea.appendChild(
            commonSnipet.dispTbaOwner(eoaUser.tbaInfo)
          );
        } else if (eoaUser.type == "discordConnect") {
          discordUserCheckArea.appendChild(
            commonSnipet.dispDiscordUser(eoaUser.discordUser)
          );
        } else if (eoaUser.type == "eoa") {
          discordUserCheckArea.appendChild(
            commonSnipet.scan(eoaUser.eoa, "UNKNOWN EOA", "unknownEoa")
          );
        } else if (eoaUser.type == "ca") {
          discordUserCheckArea.appendChild(
            commonSnipet.scan(eoaUser.eoa, "UNKNOWN CA", "unknownCa")
          );
        }
      });
    }
  });

  makeSubmit.addEventListener("click", async () => {
    const params = router.params;
    const checkSend = await getTbaConnect.sendToEoaCheck(
      sendToInput.value,
      { ca: params[2], tokenId: params[3] },
      0
    );
    if (!checkSend.result) {
      alert(LANGSET("CANTSEND") + " : " + checkSend.reason);
      return false;
    }

    if (
      confirm(LANGSET("SENDNFTBEF") + sendToInput.value + LANGSET("SENDNFTAFT"))
    ) {
      const result = await setToken.send(
        params[2],
        sendToInput.value,
        params[3]
      );
      alert(LANGSET("SENDED"));
      console.dir(result);
    }
  });

  return divElement;
};

export const burnForm = (divElement: HTMLParagraphElement) => {
  const burnSubmit = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "BURN",
    "BURN"
  );
  burnSubmit.classList.add("wfull");
  divElement.appendChild(burnSubmit);

  burnSubmit.addEventListener("click", async () => {
    const params = router.params;
    if (confirm(LANGSET("BURNNFT"))) {
      const result = await setToken
        .burn(params[2], params[3])
        .then(() => {
          alert(LANGSET("BURNED"));
        })
        .catch(() => {
          alert(LANGSET("BURN_STOP"));
        });
      console.dir(result);
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
    LANGSET("TBA_MAKE"),
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
    if (confirm(LANGSET("ARE_YOU_TBA") + "\nToken info\n" + ca + " #" + id)) {
      const result = await getTbaConnect
        .createAccount(ca, id)
        .then(() => {
          alert(LANGSET("TBA_ISSUE_SUCCESS"));
          return "success";
        })
        .catch((e) => {
          console.dir(e);
          alert(LANGSET("TBA_ISSUE_ABORT"));
          throw new Error("txCancelMes");
        });
      window.location.href = "/tokens/" + ca + "/" + id;
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
    LANGSET("MINT_THE_TOKENURI"),
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
  const label = document.createElement("span");
  label.innerHTML = LANGSET("REQUIRE_META_URL");
  label.classList.add("labelspan");
  divElement.appendChild(label);

  divElement.appendChild(commonSnipet.br());

  vaultSelect.addEventListener("click", async () => {
    utils.toggleModal("permawebList", ["jsonOnly"]);
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

  eoaForm.addEventListener("input", async (event) => {
    discordUserCheckArea.innerHTML = "";
    discordUserCheckArea.classList.remove("sendToUser");
    if (eoaForm.value != "") {
      utils.getUserByEoa(eoaForm.value).then((eoaUser) => {
        discordUserCheckArea.classList.add("sendToUser");
        if (eoaUser.type == "tba") {
          discordUserCheckArea.appendChild(
            commonSnipet.dispTbaOwner(eoaUser.tbaInfo)
          );
        } else if (eoaUser.type == "discordConnect") {
          discordUserCheckArea.appendChild(
            commonSnipet.dispDiscordUser(eoaUser.discordUser)
          );
        } else if (eoaUser.type == "eoa") {
          discordUserCheckArea.appendChild(
            commonSnipet.scan(eoaUser.eoa, "UNKNOWN EOA", "unknownEoa")
          );
        } else if (eoaUser.type == "ca") {
          discordUserCheckArea.appendChild(
            commonSnipet.scan(eoaUser.eoa, "UNKNOWN CA", "unknownCa")
          );
        }
      });
    }
  });

  tokenUriForm.addEventListener("input", async (e) => {
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
          "",
          ""
        );
      })
      .catch(() => {
        alert(tokenUriForm.value + LANGSET("INVALID_TOKENURI"));
      });
  });

  makeSubmit.addEventListener("click", async () => {
    const params = router.params;
    let message = "metaURI : " + tokenUriForm.value + "\n";
    message += "SEND TO : " + eoaForm.value + "\n";
    const donatePoint = await setToken.donatePoint(params[2]);
    console.log("D-BIZ:" + donatePoint);
    if (donatePoint > 0) {
      message +=
        LANGSET("REQUIRE_DBIZ") + " : " + utils.waiToEth(donatePoint) + " pt";
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
        if (result == "success") {
          alert(LANGSET("MINT_TX_SEND"));
          window.location.href = "/tokens/" + params[2];
        }
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
  burnForm,
  tbaSendForm,
  mintForm,
  tbaRegist,
  makeForm,
};

export default detailDisplay;
