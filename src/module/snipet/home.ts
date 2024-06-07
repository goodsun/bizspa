import { CONST } from "../../module/common/const";
import caroucel from "./caroucel";
import getTokenConnect from "../connect/getToken";
import utils from "../common/util";
import { router } from "../common/router";
const mainContents = document.getElementById("mainContents");

const getHome = async () => {
  const divElem = document.createElement("div");
  divElem.classList.add("homeContents");
  const titleElement = document.createElement("h2");
  divElem.appendChild(titleElement);
  titleElement.innerHTML = "BizenDAO";
  return divElem;
};

const getItems = async () => {
  const slides = [];
  const Url = CONST.BOT_API_URL + "item";
  try {
    const response = await fetch(Url);
    const results = await response.json();

    for (const key in results) {
      const itemInfo = JSON.parse(results[key].Json);
      console.log(results[key].Contract + " #" + results[key].TokenId);
      const tokenUri = await getTokenConnect.getToken(
        "tokenURI",
        results[key].Contract,
        results[key].TokenId
      );
      const nftInfo = await utils.fetchData(tokenUri).then(async (result) => {
        return result;
      });
      console.dir(nftInfo);
      console.dir(itemInfo[router.lang]);

      const slideElement = document.createElement("div");
      slideElement.id = "slide_" + key;
      slideElement.classList.add("carousel-item-bg");

      const slideContentElement = document.createElement("div");
      slideContentElement.classList.add("carousel-item-content");
      slideElement.appendChild(slideContentElement);

      const title = document.createElement("h2");
      title.textContent = nftInfo.name;
      slideContentElement.appendChild(title);

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("contentDiv");
      slideContentElement.appendChild(contentDiv);

      const imgdiv = document.createElement("div");
      imgdiv.classList.add("itemImgDiv");
      const image = document.createElement("img");
      image.classList.add("itemImg");
      image.src = nftInfo.image;
      contentDiv.appendChild(imgdiv);
      imgdiv.appendChild(image);

      const textdiv = document.createElement("div");
      textdiv.classList.add("itemTxtDiv");
      contentDiv.appendChild(textdiv);

      console.log("nftInfo");
      console.dir(results[key]);
      console.dir(nftInfo);

      const priceinfo = document.createElement("p");
      priceinfo.textContent = "PRICE:" + results[key].Price;
      textdiv.appendChild(priceinfo);

      const subject2 = document.createElement("p");
      subject2.textContent = "Price:" + results[key].Status;
      textdiv.appendChild(subject2);

      slides.push(slideElement);
    }

    return caroucel.setCaroucel("New Arrival", slides);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

const getGallarys = async () => {
  const slides = [];
  const Url = CONST.BOT_API_URL + "shop";
  try {
    const response = await fetch(Url);
    const results = await response.json();

    for (const key in results) {
      const gallaryInfo = JSON.parse(results[key].Json)[router.lang];
      console.dir(gallaryInfo);

      const slideElement = document.createElement("div");
      slideElement.id = "slide_" + key;
      slideElement.classList.add("carousel-item-bg");

      const slideContentElement = document.createElement("div");
      slideContentElement.classList.add("carousel-item-content");
      slideElement.appendChild(slideContentElement);

      const title = document.createElement("h2");
      title.textContent = gallaryInfo.name;
      slideContentElement.appendChild(title);

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("contentDiv");
      slideContentElement.appendChild(contentDiv);

      const imgdiv = document.createElement("div");
      imgdiv.classList.add("gallaryImgDiv");
      const image = document.createElement("img");
      image.classList.add("gallaryImg");
      image.src = results[key].Imgurl;
      contentDiv.appendChild(imgdiv);
      imgdiv.appendChild(image);

      const textdiv = document.createElement("div");
      textdiv.classList.add("itemTxtDiv");
      contentDiv.appendChild(textdiv);

      console.log("gallaryInfo");
      console.dir(results[key]);
      console.dir(gallaryInfo);

      const subject = document.createElement("p");
      subject.textContent = "CoruelContent:" + key;
      textdiv.appendChild(subject);

      const subject2 = document.createElement("p");
      subject2.textContent = "Price:" + results[key].Status;
      textdiv.appendChild(subject2);

      slides.push(slideElement);
    }

    return caroucel.setCaroucel("Gallary", slides);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

const article = {
  getHome,
  getItems,
  getGallarys,
};

export default article;
