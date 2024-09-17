import utils from "../common/utils";
import { ethers } from "ethers";
import { CONST } from "../common/const";
import { ABIS } from "./abi";
import { LANGSET } from "../common/lang";
import setElement from "../snipet/setElement";
import { nftMetaData, iVault } from "../../types/metadata";
import detailDisplay from "../snipet/detailDisplay";

let metadata: nftMetaData = {
  name: "",
  description: "",
  image: "",
  attributes: [],
};

const mainContents = document.getElementById("mainContents");

export const getUI = async () => {
  const makeMetaDiv = document.createElement("div");
  makeMetaDiv.classList.add("metadatabuilder");
  mainContents.appendChild(makeMetaDiv);
  const makeMetaDisp = document.createElement("div");
  const makeMetaCont = document.createElement("div");
  const makeMetaPrevTitle = document.createElement("h2");
  const makeMetaPrev = document.createElement("div");
  makeMetaDiv.id = "meta-section";
  makeMetaDisp.id = "meta-disp";
  makeMetaCont.id = "meta-control";
  makeMetaPrevTitle.innerHTML = "NFT PREVIEW";
  makeMetaPrev.id = "meta-preview";
  makeMetaDiv.appendChild(makeMetaDisp);
  makeMetaDiv.appendChild(makeMetaCont);
  makeMetaPrev.appendChild(makeMetaPrevTitle);
  makeMetaDiv.appendChild(makeMetaPrev);
  makeMetaPrev.style.display = "none";

  //-- MAIN -------------------------------------
  const conTitle = document.createElement("H2");
  conTitle.classList.add("controlLavel");
  conTitle.innerHTML = "Metadata builder";
  makeMetaCont.appendChild(conTitle);

  const setNameForm = setElement.makeInput(
    "input",
    "nameForm",
    "BaseInput",
    LANGSET("METANAME")
  );
  setNameForm.classList.add("w7p");
  makeMetaCont.appendChild(setNameForm);

  const metaLoad = setElement.makeFileSelect(
    "fileimput",
    "BaseSubmit",
    LANGSET("JSONLOAD"),
    "w3p"
  );
  makeMetaCont.appendChild(metaLoad);

  const setDescriptionForm = setElement.makeTextarea(
    "description",
    "BaseTextarea",
    LANGSET("DESCRIPTION"),
    ""
  );
  setDescriptionForm.classList.add("wfull");
  makeMetaCont.appendChild(setDescriptionForm);

  const jsonDownload = setElement.makeInput(
    "submit",
    "jsonDownload",
    "BaseSubmit",
    LANGSET("JSONDOWNLOAD"),
    LANGSET("JSONDOWNLOAD")
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
    LANGSET("MAINIMAGE")
  );
  setImageForm.classList.add("w7p");
  makeMetaCont.appendChild(setImageForm);
  const vaultSelect = setElement.makeInput(
    "submit",
    "submitID",
    "BaseSubmit",
    LANGSET("OPENVAULT"),
    LANGSET("OPENVAULT")
  );
  vaultSelect.classList.add("w3p");
  makeMetaCont.appendChild(vaultSelect);

  const animationMovieForm = setElement.makeInput(
    "input",
    "animationUrl",
    "BaseInput",
    LANGSET("MOVURL")
  );
  animationMovieForm.classList.add("wfull");
  makeMetaCont.appendChild(animationMovieForm);

  const extraFileForm = setElement.makeInput(
    "input",
    "externalUrl",
    "BaseInput",
    LANGSET("EXTURL")
  );
  extraFileForm.classList.add("wfull");
  makeMetaCont.appendChild(extraFileForm);

  const mintLink = document.createElement("a");
  mintLink.classList.add("litelink");
  mintLink.classList.add("mintlink");
  mintLink.href = "/pict/";
  mintLink.innerHTML = LANGSET("PICTTOOL");
  makeMetaCont.appendChild(mintLink);

  const permaweb = document.createElement("a");
  permaweb.classList.add("litelink");
  permaweb.classList.add("mintlink");
  permaweb.href = "/permaweb";
  permaweb.innerHTML = LANGSET("PERMAWEB");
  makeMetaCont.appendChild(permaweb);

  const jsonsample = document.createElement("a");
  jsonsample.classList.add("litelink");
  jsonsample.classList.add("mintlink");
  jsonsample.href = "/json/sample.json";
  jsonsample.download = "sample.json";
  jsonsample.innerHTML = LANGSET("JSONSAMPLE");
  makeMetaCont.appendChild(jsonsample);

  vaultSelect.addEventListener("click", async () => {
    utils.toggleModal("permawebList", ["notJson"]);
  });

  metaLoad.addEventListener("input", (event) => {
    loadMetadata(event);
  });

  jsonDownload.addEventListener("click", () => {
    download();
  });

  setNameForm.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("NAME:", target.value);
    console.dir(metadata);
    metadata.name = target.value;
    setTokenData();
  });

  setDescriptionForm.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("DESC:", target.value);
    console.dir(metadata);
    metadata.description = target.value;
    setTokenData();
  });

  setImageForm.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("IMG :", target.value);
    metadata.image = target.value;
    setTokenData();
  });

  animationMovieForm.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("IMG :", target.value);
    metadata.animation_url = target.value;
    setTokenData();
  });

  extraFileForm.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    console.log("IMG :", target.value);
    metadata.external_url = target.value;
    setTokenData();
  });

  //-- ATTR -------------------------------------
  const attrTitle = document.createElement("H3");
  attrTitle.classList.add("controlLavel");
  attrTitle.innerHTML = LANGSET("ATTRIBUTES");
  makeMetaCont.appendChild(attrTitle);

  const setAttrForm = setElement.makeInput(
    "traittype",
    "traittype",
    "BaseInput",
    LANGSET("LABEL")
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
    LANGSET("VALUE"),
    ""
  );
  setValForm.classList.add("wfull");
  makeMetaCont.appendChild(setValForm);

  attrSet.addEventListener("click", () => {
    setAttr();
    setAttrForm.value = "";
    setValForm.value = "";
  });
};

export const setTokenData = async () => {
  const metaPreview = document.getElementById(
    "meta-preview"
  ) as HTMLInputElement;
  metaPreview.innerHTML = "";
  await detailDisplay.showToken(
    "metabuilder",
    metadata,
    "",
    "",
    metaPreview,
    "",
    ""
  );
  console.log("SetToken表示完了");
  if (metadata.name != "") {
    metaPreview.style.display = "block";
  }

  const clickableElements = document.querySelectorAll(".attrControlLink");
  clickableElements.forEach((element) => {
    element.addEventListener("click", () => {
      const mode = element.id.substring(5, 7);
      const num = parseInt(element.id.substring(8));
      delAttr(num, mode);
    });
  });
};

export const setAttr = async () => {
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
          metadata.image ? metadata.image : "";
        (document.getElementById("animationUrl") as HTMLInputElement).value =
          metadata.animation_url ? metadata.animation_url : "";
        (document.getElementById("externalUrl") as HTMLInputElement).value =
          metadata.external_url ? metadata.external_url : "";
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
  if (mode == "ed") {
    const elms = await utils.toggleModal("replaceValue", [
      key,
      metadata.attributes[key].trait_type,
      metadata.attributes[key].value,
    ]);
    elms.setValForm.value = metadata.attributes[key].value;
    elms.setAttrForm.value = metadata.attributes[key].trait_type;
    elms.attrSet.addEventListener("click", async () => {
      metadata.attributes[key].trait_type = elms.setAttrForm.value;
      metadata.attributes[key].value = elms.setValForm.value;
      utils.toggleModal();
      setTokenData();
    });
  }
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
    if (confirm("本当に削除してよろしいですか？")) {
      metadata.attributes.splice(key, 1);
    }
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
