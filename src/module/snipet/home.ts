import { CONST } from "../../module/common/const";
import caroucel from "./caroucel";
import getTokenConnect from "../connect/getToken";
import utils from "../common/utils";
import { router } from "../common/router";
import articleSnipet from "../../module/snipet/article";
import { LANGSET } from "../common/lang";
const mainContents = document.getElementById("mainContents");

const getHome = async () => {
  const divElem = document.createElement("div");
  divElem.classList.add("homeContents");
  return divElem;
};

const getHomeContents = async () => {
  const PATH = router.lang + "/common/home";
  const mdPath = CONST.BOT_API_URL + "contents/get/" + PATH;
  const path = `${PATH}.md`;
  articleSnipet.parseMdPage(mdPath, path);
};

const getItems = async () => {
  const slides = [];
  const Url = CONST.BOT_API_URL + "item";
  try {
    const response = await fetch(Url);
    const results = await response.json();

    for (const key in results) {
      const itemInfo = JSON.parse(results[key].Json)[router.lang];
      console.log(results[key].Contract + " #" + results[key].TokenId);
      const tokenUri = await getTokenConnect.getToken(
        "tokenURI",
        results[key].Contract,
        results[key].TokenId
      );
      console.log(
        "GET TOKEN URI:" + results[key].Contract + " #" + results[key].TokenId
      );

      let nftInfo: any;
      if (tokenUri != undefined) {
        nftInfo = await utils.fetchData(tokenUri).then(async (result) => {
          return result;
        });
      }
      console.log("NFTINFO");
      console.dir(nftInfo);

      const slideElement = document.createElement("div");
      slideElement.id = "slide_" + key;
      slideElement.classList.add("carousel-item-bg");

      const slideContentElement = document.createElement("div");
      slideContentElement.classList.add("carousel-item-content");
      slideElement.appendChild(slideContentElement);

      const title = document.createElement("h2");
      title.textContent = itemInfo.name;
      slideContentElement.appendChild(title);

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("contentDiv");
      slideContentElement.appendChild(contentDiv);

      const contentLeftDiv = document.createElement("div");
      slideContentElement.appendChild(contentLeftDiv);
      contentDiv.appendChild(contentLeftDiv);

      const imgdiv = document.createElement("div");
      imgdiv.classList.add("itemImgDiv");
      const image = document.createElement("img");
      image.classList.add("itemImg");
      if (nftInfo != undefined) {
        image.src = nftInfo.image;
      } else {
        image.src = "/img/dummy.jpg";
      }
      imgdiv.appendChild(image);
      contentLeftDiv.appendChild(imgdiv);

      var shopLink = document.createElement("a");
      shopLink.classList.add("shopSiteLink");
      shopLink.href = results[key].Link;
      shopLink.target = "_blank";
      shopLink.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> BUY NOW';
      contentLeftDiv.appendChild(shopLink);

      if (nftInfo != undefined) {
        var nftLink = document.createElement("a");
        nftLink.classList.add("shopSiteLink");
        nftLink.href =
          "/tokens/" + results[key].Contract + "/" + results[key].TokenId;
        nftLink.target = "_blank";
        nftLink.innerHTML = '<i class="fa-solid fa-gem"></i> NFT VIEW';
        contentLeftDiv.appendChild(nftLink);

        var openseaLink = document.createElement("a");
        openseaLink.classList.add("shopSiteLink");
        openseaLink.href =
          "https://opensea.io/assets/matic/" +
          results[key].Contract +
          "/" +
          results[key].TokenId;
        openseaLink.target = "_blank";
        openseaLink.innerHTML = '<i class="opensea"></i> opensea';
        contentLeftDiv.appendChild(openseaLink);
      }

      const textdiv = document.createElement("div");
      textdiv.classList.add("itemTxtDiv");
      contentDiv.appendChild(textdiv);

      if (nftInfo != undefined) {
        const profileArea = document.createElement("div");
        profileArea.classList.add("carouselProfileArea");
        textdiv.appendChild(profileArea);

        const nftName = document.createElement("p");
        nftName.classList.add("carouselProfileName");
        nftName.textContent = nftInfo.name;
        profileArea.appendChild(nftName);
        const nftDescribe = document.createElement("p");
        nftDescribe.classList.add("carouselProfile");
        nftDescribe.textContent = nftInfo.description;
        profileArea.appendChild(nftDescribe);
      }

      const priceinfo = document.createElement("p");
      priceinfo.innerHTML =
        '<i class="fa-solid fa-money-check-dollar"></i> ' +
        results[key].Price +
        " JPY";
      textdiv.appendChild(priceinfo);
      const ownerDetail = document.createElement("p");
      ownerDetail.innerHTML =
        '<i class="fa-solid fa-user"></i> ' + itemInfo.owner;
      textdiv.appendChild(ownerDetail);
      const typeDetail = document.createElement("p");
      typeDetail.innerHTML =
        '<i class="fa-solid fa-splotch"></i> ' + itemInfo.type;
      textdiv.appendChild(typeDetail);
      const genreDetail = document.createElement("p");
      genreDetail.innerHTML =
        '<i class="fa-solid fa-star-of-life"></i> ' + itemInfo.genre;
      textdiv.appendChild(genreDetail);
      const specDetail = document.createElement("p");
      specDetail.innerHTML =
        '<i class="fa-solid fa-weight-scale"></i> ' +
        itemInfo.size +
        " / " +
        itemInfo.weight;
      textdiv.appendChild(specDetail);
      const workplaceDetail = document.createElement("p");
      workplaceDetail.innerHTML =
        '<i class="fa-solid fa-shop"></i> ' + itemInfo.workplace;
      textdiv.appendChild(workplaceDetail);
      const locationDetail = document.createElement("p");
      locationDetail.innerHTML =
        '<i class="fa-solid fa-location-dot"></i> ' + itemInfo.location;
      textdiv.appendChild(locationDetail);
      const stationDetail = document.createElement("p");
      stationDetail.innerHTML =
        '<i class="fa-solid fa-train-subway"></i> ' + itemInfo.station;
      textdiv.appendChild(stationDetail);

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

      const contentLeftDiv = document.createElement("div");
      slideContentElement.appendChild(contentLeftDiv);
      contentDiv.appendChild(contentLeftDiv);

      const imgdiv = document.createElement("div");
      imgdiv.classList.add("gallaryImgDiv");
      const image = document.createElement("img");
      image.classList.add("gallaryImg");
      image.src = results[key].Imgurl;
      imgdiv.appendChild(image);
      contentLeftDiv.appendChild(imgdiv);

      var gallaryLink = document.createElement("a");
      gallaryLink.classList.add("gallaryLink");
      gallaryLink.href = "/creators/" + results[key].Eoa;
      gallaryLink.innerHTML = '<i class="fa-solid fa-door-open"></i> Gallary';
      contentLeftDiv.appendChild(gallaryLink);

      const textdiv = document.createElement("div");
      textdiv.classList.add("itemTxtDiv");
      contentDiv.appendChild(textdiv);

      const profileArea = document.createElement("div");
      profileArea.classList.add("carouselProfileArea");
      const profile = document.createElement("p");
      profile.classList.add("carouselProfile");
      profile.textContent = gallaryInfo.profile;
      profileArea.appendChild(profile);
      textdiv.appendChild(profileArea);

      const ownerDetail = document.createElement("p");
      ownerDetail.innerHTML =
        '<i class="fa-solid fa-user"></i> ' + gallaryInfo.name;
      textdiv.appendChild(ownerDetail);
      const workplaceDetail = document.createElement("p");
      workplaceDetail.innerHTML =
        '<i class="fa-solid fa-shop"></i> ' + gallaryInfo.workplace;
      textdiv.appendChild(workplaceDetail);
      const locationDetail = document.createElement("p");
      locationDetail.innerHTML =
        '<i class="fa-solid fa-location-dot"></i> ' + gallaryInfo.location;
      textdiv.appendChild(locationDetail);
      const stationDetail = document.createElement("p");
      stationDetail.innerHTML =
        '<i class="fa-solid fa-train-subway"></i> ' + gallaryInfo.station;
      textdiv.appendChild(stationDetail);

      slides.push(slideElement);
    }

    return caroucel.setCaroucel("Gallary", slides);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

const article = {
  getHome,
  getHomeContents,
  getItems,
  getGallarys,
};

export default article;
