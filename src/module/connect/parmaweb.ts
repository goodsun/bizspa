import { ethers } from "ethers";
import { CONST } from "../common/const";
import setElement from "../snipet/setElement";
import getAkord from "./getAkord";

const mainContents = document.getElementById("mainContents");

const polygonPrice = 1.35; //$1=1.35matic $12=16.2matic / 1G
const vaultPriceByKb = (12 * polygonPrice) / 1000 / 1000 / 1000 / 0.42; //$12=16.2matic / 1G

const priceCarc = (filesize: number) => {
  return filesize * vaultPriceByKb;
};

const getUI = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const eoa = await signer.getAddress();
  const divUploaderElement = document.createElement("div");
  divUploaderElement.classList.add("akordUploader");
  mainContents.appendChild(divUploaderElement);
  setUI(divUploaderElement, eoa);
};

const setUI = (parent, eoa) => {
  const titleElm = document.createElement("h2");
  titleElm.classList.add("akordUploader");
  titleElm.innerHTML = "ParmaWeb Uploader";
  parent.appendChild(titleElm);
  const uploadingInfoArea = document.createElement("div");
  uploadingInfoArea.classList.add("uplpadInfoArea");
  uploadingInfoArea.innerHTML = " ";
  parent.appendChild(uploadingInfoArea);

  const fileSelect = setElement.makeInput(
    "file",
    "updateFile",
    "BaseSubmit",
    "ファイル選択",
    "ファイル選択"
  );
  parent.appendChild(fileSelect);

  const br = document.createElement("h2");
  parent.appendChild(br);

  const fileUpload = setElement.makeInput(
    "submit",
    "uploadSend",
    "BaseSubmit",
    "FILE UPLOAD",
    "FILE UPLOAD"
  );
  fileUpload.classList.add("wfull");
  parent.appendChild(fileUpload);

  fileSelect.addEventListener("change", async (event) => {
    const fileInput = document.getElementById("updateFile") as HTMLInputElement;
    const file = fileInput.files[0];
    const price = priceCarc(file.size);
    console.log(price);
    uploadingInfoArea.innerHTML =
      "estimate : " +
      price.toFixed(8).substring(0, 10) +
      " " +
      CONST.DEFAULT_SYMBOL +
      "( + GasFee)";
  });

  fileUpload.addEventListener("click", async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById("updateFile") as HTMLInputElement;
    const file = await fileInput.files[0];
    const price = priceCarc(file.size);
    if (
      confirm(
        "以下のファイルをアップロードします。よろしいですか？\n" +
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
          (vaultPriceByKb * 1000).toFixed(8).substring(0, 10) +
          " " +
          CONST.DEFAULT_SYMBOL +
          " / KB \n"
      )
    ) {
      uploadingInfoArea.innerHTML = "<div class='spinner'></div>loading...";
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
            const response = await fetch(URL, {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const result = await response.json();
              console.log("File upload successfully:", result);
              uploadingInfoArea.innerHTML = "UPLOAD SUCCESSFULLY";
              return result;
            } else {
              console.error("Failed to upload file:", response.statusText);
              uploadingInfoArea.innerHTML = "Failed to Upload file";
            }
          } else {
            console.error("Failed to check file:", checkresult.statusText);
            uploadingInfoArea.innerHTML = "Failed to check file";
          }
        } catch (error) {
          console.error("Error:", error);
          uploadingInfoArea.innerHTML = "UPLOAD ERROR";
        }
      } else {
        console.log("No file selected");
        uploadingInfoArea.innerHTML = "";
      }
    }
  });
};

const parmaweb = {
  getUI,
};

export default parmaweb;
