import { CONST } from "../../module/common/const";
import caroucel from "./caroucel";
const mainContents = document.getElementById("mainContents");

const getHome = async () => {
  const data = [1, 2, 3, 4, 5, 6, 7];
  const slides = [];

  for (const key in data) {
    const slideElement = document.createElement("div");
    slideElement.id = "slide_" + key;
    slideElement.classList.add("carousel-item-bg");

    const slideContentElement = document.createElement("div");
    slideContentElement.classList.add("carousel-item-content");
    slideElement.appendChild(slideContentElement);

    const title = document.createElement("h2");
    title.textContent = "TITLE:" + key;
    slideContentElement.appendChild(title);

    const subject = document.createElement("p");
    subject.textContent = "CoruelContent:" + key;
    slideContentElement.appendChild(subject);

    const subject2 = document.createElement("p");
    subject2.textContent = "detail:" + key;
    slideContentElement.appendChild(subject2);

    slides.push(slideElement);
  }

  caroucel.setCaroucel(slides);
};

const article = {
  getHome,
};

export default article;
