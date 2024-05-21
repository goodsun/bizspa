import { ethers } from "ethers";
import { CONST } from "../common/const";
import { ABIS } from "./abi";
import setElement from "../snipet/setElement";
import getAkord from "./getAkord";
import { nftMetaData, iVault } from "../../types/metadata";
import detailDisplay from "../snipet/detailDisplay";
let vaultList: iVault[] = [];

let metadata: nftMetaData = {
  name: "",
  description: "",
  image: "",
  attributes: [],
};

const mainContents = document.getElementById("mainContents");
const modalbase = document.getElementById("modalbase");
const closeModal = document.getElementById("closemodal");
const modalcontent = document.getElementById("modalcontent");
let dispmodal = false;

closeModal.addEventListener("click", function (event) {
  toggleModal();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    toggleModal();
  }
});

const getStackList = async () => {
  console.log(vaultList);
  if (vaultList.length == 0) {
    modalcontent.innerHTML = "<div class='spinner'></div>loading..";
    const akord = await getAkord.getStack();
    vaultList = akord.stackList;
    modalcontent.innerHTML = "VAULT LIST";
    const reload = document.createElement("span");
    reload.classList.add("litelink");
    reload.classList.add("reloadLink");
    reload.id = "vaultReload";
    reload.innerHTML = "reload";
    modalcontent.appendChild(reload);

    for (const key in vaultList) {
      console.dir(vaultList[key]);
      modalcontent.innerHTML +=
        "<br />" +
        '<a href="' +
        vaultList[key].arweaveUrl +
        '" target="_blank">' +
        vaultList[key].name.substr(43) +
        "</a>";
      addCopyButton(
        modalcontent,
        "COPYBUTTON_" + key,
        "COPYBTN",
        vaultList[key].arweaveUrl
      );
    }
    const COPYBTNS = document.querySelectorAll(".COPYBTN");
    COPYBTNS.forEach((element) => {
      element.addEventListener("click", () => {
        console.dir(element.getAttribute("data-clipboard-text"));
        const copytext = element.getAttribute("data-clipboard-text");
        navigator.clipboard
          .writeText(copytext)
          .then(function () {
            alert("テキストがクリップボードにコピーされました");
          })
          .catch(function (error) {
            alert("コピーに失敗しました: " + error);
          });
      });
    });

    document
      .getElementById("vaultReload")
      .addEventListener("click", function (event) {
        console.log("VAULT RELOAD");
        vaultList = [];
        getStackList();
      });
  }
};

const addCopyButton = (
  elm: HTMLElement,
  id: string,
  classname: string,
  url: string
) => {
  const copybtn = document.createElement("span");
  copybtn.id = id;
  copybtn.classList.add(classname);
  copybtn.innerHTML = "copy";
  copybtn.classList.add("liteLink");
  copybtn.classList.add("copyLink");

  const copyicon = document.createElement("i");
  copyicon.classList.add("far");
  copyicon.classList.add("fa-copy");
  copyicon.classList.add("fa-fw");
  copyicon.setAttribute("data-clipboard-text", url);
  copybtn.appendChild(copyicon);

  elm.appendChild(copybtn);
  document.getElementById(id).addEventListener("click", function (event) {
    console.log(id + ":" + url);
  });
};

const toggleModal = () => {
  if (dispmodal) {
    modalbase.classList.remove("active");
    dispmodal = false;
  } else {
    modalbase.classList.add("active");
    dispmodal = true;
  }
};

export const getUI = async () => {
  console.log("GETUI RUNNNING");
  const makeMetaDiv = document.createElement("div");
  makeMetaDiv.classList.add("metadatabuilder");
  mainContents.appendChild(makeMetaDiv);
  const makeMetaDisp = document.createElement("div");
  const makeMetaCont = document.createElement("div");
  const makeMetaPrev = document.createElement("div");
  makeMetaDiv.id = "meta-section";
  makeMetaDisp.id = "meta-disp";
  makeMetaCont.id = "meta-control";
  makeMetaPrev.id = "meta-preview";
  makeMetaDiv.appendChild(makeMetaDisp);
  makeMetaDiv.appendChild(makeMetaCont);
  makeMetaDiv.appendChild(makeMetaPrev);

  //-- MAIN -------------------------------------
  const conTitle = document.createElement("H2");
  conTitle.classList.add("controlLavel");
  conTitle.innerHTML = "Metadata builder";
  makeMetaCont.appendChild(conTitle);

  const setNameForm = setElement.makeInput(
    "input",
    "nameForm",
    "BaseInput",
    "NAME"
  );
  setNameForm.classList.add("w7p");
  makeMetaCont.appendChild(setNameForm);

  const metaLoad = setElement.makeFileSelect(
    "fileimput",
    "BaseSubmit",
    "JSON LOAD",
    "w3p"
  );
  makeMetaCont.appendChild(metaLoad);

  const setDescriptionForm = setElement.makeTextarea(
    "description",
    "BaseTextarea",
    "DESCRIPTION",
    ""
  );
  setDescriptionForm.classList.add("wfull");
  makeMetaCont.appendChild(setDescriptionForm);

  const jsonDownload = setElement.makeInput(
    "submit",
    "jsonDownload",
    "BaseSubmit",
    "JSON DOWNLOAD",
    "JSON DOWNLOAD"
  );
  jsonDownload.classList.add("wfull");
  makeMetaCont.appendChild(jsonDownload);

  const imgsTitle = document.createElement("H3");
  imgsTitle.classList.add("controlLavel");
  imgsTitle.innerHTML = "Images";
  makeMetaCont.appendChild(imgsTitle);

  const setImageForm = setElement.makeInput(
    "input",
    "imageUrl",
    "BaseInput",
    "MAIN IMAGE"
  );
  setImageForm.classList.add("w7p");
  makeMetaCont.appendChild(setImageForm);
  const vaultSelect = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "OPEN VAULT",
    "OPEN VAULT"
  );
  vaultSelect.classList.add("w3p");
  makeMetaCont.appendChild(vaultSelect);

  const animationMovieForm = setElement.makeInput(
    "input",
    "animationUrl",
    "BaseInput",
    "ANIMATION URL"
  );
  animationMovieForm.classList.add("wfull");
  makeMetaCont.appendChild(animationMovieForm);

  const extraFileForm = setElement.makeInput(
    "input",
    "externalUrl",
    "BaseInput",
    "EXTERNAL URL"
  );
  extraFileForm.classList.add("wfull");
  makeMetaCont.appendChild(extraFileForm);

  vaultSelect.addEventListener("click", async () => {
    toggleModal();
    getStackList();
  });

  metaLoad.addEventListener("change", (event) => {
    loadMetadata(event);
  });

  jsonDownload.addEventListener("click", () => {
    download();
  });

  setNameForm.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("NAME:", target.value);
    console.dir(metadata);
    metadata.name = target.value;
    setTokenData();
  });

  setDescriptionForm.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("DESC:", target.value);
    console.dir(metadata);
    metadata.description = target.value;
    setTokenData();
  });

  setImageForm.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("IMG :", target.value);
    metadata.image = target.value;
    setTokenData();
  });

  animationMovieForm.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("IMG :", target.value);
    metadata.animation_url = target.value;
    setTokenData();
  });

  extraFileForm.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("IMG :", target.value);
    metadata.external_url = target.value;
    setTokenData();
  });

  //-- ATTR -------------------------------------
  const attrTitle = document.createElement("H3");
  attrTitle.classList.add("controlLavel");
  attrTitle.innerHTML = "Attributes";
  makeMetaCont.appendChild(attrTitle);

  const setAttrForm = setElement.makeInput(
    "traittype",
    "traittype",
    "BaseInput",
    "TRAIT TYPE"
  );
  setAttrForm.classList.add("w7p");
  makeMetaCont.appendChild(setAttrForm);
  const attrSet = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    "SET",
    "SET"
  );
  attrSet.classList.add("w3p");
  makeMetaCont.appendChild(attrSet);
  const setValForm = setElement.makeTextarea(
    "attrvalue",
    "BaseTextarea",
    "VALUE",
    ""
  );
  setValForm.classList.add("wfull");
  makeMetaCont.appendChild(setValForm);

  attrSet.addEventListener("click", () => {
    setAttr("test");
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signerAddr = await signer.getAddress();
  return signerAddr;
};

export const setTokenData = async () => {
  const metaPreview = document.getElementById(
    "meta-preview"
  ) as HTMLInputElement;
  metaPreview.innerHTML = "";
  await detailDisplay.showToken("metabuilder", metadata, "", "", metaPreview);
  console.log("SetToken表示完了");

  const clickableElements = document.querySelectorAll(".attrControlLink");
  clickableElements.forEach((element) => {
    element.addEventListener("click", () => {
      const mode = element.id.substring(5, 7);
      const num = parseInt(element.id.substring(8));
      delAttr(num, mode);
    });
  });
};

export const setAttr = async (attrname: string) => {
  const traitType = document.getElementById("traittype") as HTMLInputElement;
  const attrValue = document.getElementById("attrvalue") as HTMLInputElement;
  if (traitType.value != "" && attrValue.value != "") {
    metadata.attributes.push({
      trait_type: traitType.value,
      value: attrValue.value,
    });
    setTokenData();
  }
};

export const loadMetadata = (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  if (file.type != "application/json") {
    alert("メタデータはjson形式のファイルを指定してください。:" + file.type);
    return;
  }
  reader.onload = async () => {
    const loadmetadata = reader.result as string;
    if (loadmetadata) {
      metadata = JSON.parse(loadmetadata) as nftMetaData;

      try {
        (document.getElementById("nameForm") as HTMLInputElement).value =
          metadata.name;
        (document.getElementById("description") as HTMLInputElement).value =
          metadata.description;
        (document.getElementById("imageUrl") as HTMLInputElement).value =
          metadata.image;
        (document.getElementById("animationUrl") as HTMLInputElement).value =
          metadata.animation_url;
        (document.getElementById("externalUrl") as HTMLInputElement).value =
          metadata.external_url;
      } catch (error) {
        console.dir(error);
      }

      setTokenData();
    } else {
      alert("ファイルの読み込みに失敗しました。");
    }
    event.target.value = null;
  };

  reader.readAsText(file);
};

const download = () => {
  const json = JSON.stringify(metadata);
  const blob = new Blob([json], { type: "application/json" });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", metadata.name + ".json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const delAttr = async (key: number, mode: string) => {
  if (mode == "up" && key != 0) {
    let me = metadata.attributes[key];
    let you = metadata.attributes[key - 1];
    metadata.attributes[key] = you;
    metadata.attributes[key - 1] = me;
  }
  if (mode == "dw" && key != metadata.attributes.length - 1) {
    let me = metadata.attributes[key];
    let you = metadata.attributes[key + 1];
    metadata.attributes[key] = you;
    metadata.attributes[key + 1] = me;
  }
  if (mode == "rm") {
    metadata.attributes.splice(key, 1);
  }
  setTokenData();
};

const setMeta = {
  getUI,
  setTokenData,
  setAttr,
  delAttr,
};

export default setMeta;
