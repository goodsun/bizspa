import { ethers } from "ethers";
import { CONST } from "../common/const";
import setElement from "../snipet/setElement";
import { donate } from "../../module/connect/donate";
import getManagerConnect from "../../module/connect/getManager";
import utils from "../common/util";

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
    const fileInput = document.getElementById("updateFile") as HTMLInputElement;
    const file = fileInput.files[0];
    const price = priceCarc(file.size);
    console.log(price);
    uploadingInfoArea.innerHTML =
      "filename : " +
      file.name +
      "<br />estimate : " +
      price.toFixed(8).substring(0, 10) +
      " " +
      CONST.DEFAULT_SYMBOL +
      " + GasFee";
    uploadingInfoArea.classList.add("upload-confirm");
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
            // 一旦Donateへ入れておく
            const ca = await getManagerConnect.getCA("donate");
            const value: string = String(utils.ethToWai(price));
            const donateResult = await donate("donate", ca, [eoa, value])
              .then((response) => {
                console.dir(response);
                return response;
              })
              .catch((error) => {
                console.dir(error);
              });

            //==============================================
            //課金成功でアップロード
            if (donateResult) {
              console.log("donateResult");
              console.dir(donateResult);
              const response = await fetch(URL, {
                method: "POST",
                body: formData,
              });

              if (response.ok) {
                const result = await response.json();
                console.log("File upload successfully:", result);
                uploadingInfoArea.innerHTML = "UPLOAD SUCCESSFULLY";
                uploadingInfoArea.classList.add("upload-success");
                return result;
              } else {
                console.error("Failed to upload file:", response.statusText);
                uploadingInfoArea.innerHTML = "Failed to Upload file";
                uploadingInfoArea.classList.add("upload-failed");
              }
            } else {
              console.error("Failed to check file:", checkresult.statusText);
              uploadingInfoArea.innerHTML = "cansel to upload";
              uploadingInfoArea.classList.add("upload-success");
            }
          } else {
            console.error("Failed to check file:", checkresult.statusText);
            uploadingInfoArea.innerHTML = "Failed to check file";
            uploadingInfoArea.classList.add("upload-failed");
          }
        } catch (error) {
          console.error("Error:", error);
          uploadingInfoArea.innerHTML = "UPLOAD ERROR";
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

const parmaweb = {
  getUI,
};

export default parmaweb;
