import { router } from "../common/router";
import { ethers } from "ethers";
import { CONST } from "../common/const";
import { LANGSET } from "../common/lang";
import setElement from "../snipet/setElement";
import orderConnect from "../../module/connect/order";
import getManagerConnect from "../../module/connect/getManager";
import getAcord from "../../module/connect/getAkord";
import utils from "../common/utils";

const mainContents = document.getElementById("mainContents");
const agree_ext_list = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "pdf",
  "glb",
  "zip",
  "mp4",
  "mov",
  "avi",
  "webm",
  "flv",
  "mp3",
  "aac",
  "csv",
  "xml",
  "json",
  "docx",
  "pptx",
  "xlsx",
];

const checkPrice = async () => {
  const maticPrice = await utils.getMaticPrice();
  const dollPolygonPrice = Number(maticPrice.matic_usd); //1.35; //$1=1.35matic $12=16.2matic / 1G
  const vaultPriceByByte = (12 * dollPolygonPrice) / 1000 / 1000 / 1000 / 0.42; //$12=16.2matic / 1G
  const polygonYenPrice = Number(maticPrice.jpy_matic); //109.9;
  console.dir(
    "VaultPrice " + vaultPriceByByte * 1000 * 1000 * 1000 + " matic/GB"
  );
  return {
    dollPolygonPrice: dollPolygonPrice,
    vaultPriceByByte: vaultPriceByByte,
    polygonYenPrice: polygonYenPrice,
  };
};

const getUI = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const eoa = await signer.getAddress();
  const permawebElement = document.createElement("div");
  permawebElement.classList.add("permawebElement");
  mainContents.appendChild(permawebElement);

  if (eoa != undefined) {
    const divInnerElement = document.createElement("div");
    if (router.params[2] == "detail" && router.params[3] != "") {
      const divInnerElement = document.createElement("div");
      divInnerElement.classList.add("permawebStackDetail");
      permawebElement.appendChild(divInnerElement);
      setDetail(divInnerElement, router.params[3]);
    } else {
      const divUploaderElement = document.createElement("div");
      divUploaderElement.classList.add("akordUploaderElement");
      permawebElement.appendChild(divUploaderElement);

      divInnerElement.classList.add("permawebStackList");
      permawebElement.appendChild(divInnerElement);

      setUploadUI(divUploaderElement, divInnerElement);
      setUploadList(divInnerElement);
    }
  } else {
    alert("walletを接続してください。");
  }
};

const setDetail = async (parent, stackId) => {
  const titleElm = document.createElement("h2");
  titleElm.classList.add("stackTitle");
  titleElm.innerHTML = "Stack Detail " + stackId;
  parent.appendChild(titleElm);
};

const setUploadList = async (parent) => {
  const titleElm = document.createElement("h2");
  titleElm.classList.add("uploaderTitle");
  titleElm.innerHTML = "Upload List";
  parent.appendChild(titleElm);

  const listElm = document.createElement("h2");
  parent.appendChild(listElm);
  listElm.innerHTML = "<div class='spinner'></div>loading...";
  const assetList = await getAcord.getStack("");
  listElm.innerHTML = "";

  const reload = document.createElement("span");
  reload.classList.add("litelink");
  reload.classList.add("reloadLink");
  reload.id = "vaultReload";
  reload.innerHTML = "reload";
  listElm.appendChild(reload);
  console.dir(assetList);
  const vaultListDiv = document.createElement("div");
  listElm.appendChild(vaultListDiv);

  for (const key in assetList) {
    const datetime = utils.formatUnixTime(Number(assetList[key].createdAt));
    vaultListDiv.innerHTML +=
      "<br />" +
      "<span class='datetime'>" +
      datetime +
      "</span>" +
      ' <a href="/permaweb/detail/' +
      assetList[key].id +
      '" >' +
      assetList[key].name +
      "</a>";
    utils.addCopyButton(
      vaultListDiv,
      "COPYBUTTON_" + key,
      "COPYBTN",
      String(assetList[key].arweaveUrl)
    );
  }

  const COPYBTNS = document.querySelectorAll(".COPYBTN");
  COPYBTNS.forEach((element) => {
    element.addEventListener("click", () => {
      const copytext = element.getAttribute("data-clipboard-text");
      navigator.clipboard
        .writeText(copytext)
        .then(function () {
          alert("URL" + LANGSET("COPYED"));
        })
        .catch(function (error) {
          alert(LANGSET("COPYFAILED") + error);
        });
    });
  });

  reload.addEventListener("click", function (event) {
    parent.innerHTML = "";
    setUploadList(parent);
  });
};

const setUploadUI = (parent, stackList) => {
  const titleElm = document.createElement("h2");
  titleElm.classList.add("akordUploader");
  titleElm.innerHTML = "permaWeb Uploader";
  parent.appendChild(titleElm);
  const uploadingInfoArea = document.createElement("div");
  uploadingInfoArea.classList.add("uploadInfoArea");
  uploadingInfoArea.innerHTML = " ";
  parent.appendChild(uploadingInfoArea);

  const fileSelect = setElement.makeFileSelect(
    "updateFile",
    "BaseSubmit",
    "FILE SELECT",
    "w3p"
  );
  parent.appendChild(fileSelect);
  fileSelect.classList.add("w3p");

  const fileUpload = setElement.makeInput(
    "submit",
    "uploadSend",
    "BaseSubmit",
    "FILE UPLOAD",
    "FILE UPLOAD"
  );
  fileUpload.classList.add("w7p");
  parent.appendChild(fileUpload);

  fileSelect.addEventListener("change", async (event) => {
    const Price = await checkPrice();
    const fileInput = document.getElementById("updateFile") as HTMLInputElement;
    const file = fileInput.files[0];

    const ext = file.name.split(".").pop().toLocaleLowerCase();
    console.log("file extention:" + ext);
    if (!agree_ext_list.includes(ext)) {
      alert(file.name + "\n" + LANGSET("CANT_UPLOAD_FILE"));
    }
    const price = Price.vaultPriceByByte * file.size;
    console.log(price);
    uploadingInfoArea.innerHTML =
      "filename : " +
      file.name +
      "<br />filesize : " +
      (file.size / 1000 / 1000).toFixed(2) +
      " Mb<br />estimate : " +
      price.toFixed(8).substring(0, 10) +
      " " +
      CONST.DEFAULT_SYMBOL +
      " + GasFee" +
      "<br/>about JPY:" +
      (price * Price.polygonYenPrice).toFixed(2) +
      "<br />※ " +
      (Price.vaultPriceByByte * Price.polygonYenPrice * 1000 * 1000).toFixed(
        2
      ) +
      "JPY/1MB";

    uploadingInfoArea.classList.add("upload-confirm");
  });

  fileUpload.addEventListener("click", async (event) => {
    const Price = await checkPrice();
    event.preventDefault();
    const fileInput = document.getElementById("updateFile") as HTMLInputElement;
    const file = await fileInput.files[0];
    const price = Price.vaultPriceByByte * file.size;
    if (
      confirm(
        LANGSET("UPLOAD_CONFIRM") +
          "\n" +
          "FileName: " +
          file.name +
          "\n" +
          "MimeType: " +
          file.type +
          "\n" +
          "fileSize: " +
          file.size +
          " Bites\n" +
          "UPLOAD PRICE : " +
          price.toFixed(8).substring(0, 10) +
          " " +
          CONST.DEFAULT_SYMBOL +
          "\n" +
          "VAULT PRICE : " +
          (Price.vaultPriceByByte * 1000).toFixed(8).substring(0, 10) +
          " " +
          CONST.DEFAULT_SYMBOL +
          " / KB \n"
      )
    ) {
      uploadingInfoArea.innerHTML = "<div class='spinner'></div>uploading...";
      uploadingInfoArea.classList.remove("upload-confirm");
      uploadingInfoArea.classList.remove("upload-success");
      uploadingInfoArea.classList.remove("upload-failed");

      if (file) {
        //直近で取り直す
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const eoa = await signer.getAddress();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("eoa", eoa);
        formData.append("price", String(price));
        formData.append("filesize", String(file.size));

        const CHECKURL = CONST.AKORD_API_URL + "filecheck";
        const URL = CONST.AKORD_API_URL + "upload";
        try {
          const checkresult = await fetch(CHECKURL, {
            method: "POST",
            body: formData,
          });
          if (checkresult.ok) {
            const result = await checkresult.json();
            console.log("File check successfully:", result);
            formData.append("checkfile", result.file);

            //==============================================
            // 課金する
            const orderCa = await getManagerConnect.getCA("order");
            const value: string = String(utils.ethToWai(price));
            const orderResult = await orderConnect
              .order(orderCa, value)
              .then((response) => {
                console.dir(response);
                return response as string;
              })
              .catch((error) => {
                console.dir(error);
              });

            //==============================================
            //課金成功でアップロード
            if (orderResult) {
              console.log("orderResult");
              console.dir(orderResult);
              const response = await fetch(URL, {
                method: "POST",
                body: formData,
              });

              if (response.ok) {
                const result = await response.json();
                console.log("File upload successfully:", result);
                console.log("order ca", orderCa);
                console.log("order result", orderResult);
                console.log("filename", file.name);
                console.log("permawebUrl", result.permawebUrl);
                uploadingInfoArea.innerHTML =
                  file.name + " " + LANGSET("UPLOAD_SUCCESS");
                uploadingInfoArea.classList.add("upload-success");
                stackList.innerHTML = "";
                setUploadList(stackList);
              } else {
                console.error("Failed to upload file:", response.statusText);
                uploadingInfoArea.innerHTML = LANGSET("FAILED_TO_UPLOAD");
                uploadingInfoArea.classList.add("upload-failed");
              }
            } else {
              console.error("Failed to check file:", checkresult.statusText);
              uploadingInfoArea.innerHTML = LANGSET("CANCEL_TO_UPLOAD");
              uploadingInfoArea.classList.add("upload-success");
            }
          } else {
            console.error("Failed to check file:", checkresult.statusText);
            uploadingInfoArea.innerHTML =
              LANGSET("FAILED_TO_CHECK_FILE") + checkresult.statusText;
            uploadingInfoArea.classList.add("upload-failed");
          }
        } catch (error) {
          console.error("Error:", error);
          uploadingInfoArea.innerHTML = LANGSET("UPLOAD_ERROR");
          uploadingInfoArea.classList.add("upload-failed");
        }
      } else {
        console.log("No file selected");
        uploadingInfoArea.innerHTML = "";
        uploadingInfoArea.classList.remove("upload-success");
        uploadingInfoArea.classList.remove("upload-failed");
      }
    }
  });
};

const permaweb = {
  checkPrice,
  getUI,
};

export default permaweb;
