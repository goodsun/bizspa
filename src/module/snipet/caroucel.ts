const mainContents = document.getElementById("mainContents");

const setCaroucel = async (title, slides) => {
  const divElem = document.createElement("div");
  divElem.classList.add("caroucelArea");
  const titleElement = document.createElement("h2");
  divElem.appendChild(titleElement);
  titleElement.innerHTML = title;

  const carousel = document.createElement("div");
  carousel.id = "carousel";
  carousel.classList.add("carousel");
  divElem.appendChild(carousel);

  const carouselContainer = document.createElement("div");
  carouselContainer.classList.add("carousel-container");
  carousel.appendChild(carouselContainer);

  slides.forEach((slideContent) => {
    const slide = document.createElement("div");
    slide.classList.add("carousel-item");
    slide.appendChild(slideContent);
    carouselContainer.appendChild(slide);
  });

  const control = document.createElement("div");
  control.classList.add("carousel-control");
  divElem.appendChild(control);
  const prevButton = document.createElement("button");
  prevButton.classList.add("prev");
  prevButton.textContent = "Prev";
  control.appendChild(prevButton);

  const nextButton = document.createElement("button");
  nextButton.classList.add("next");
  nextButton.textContent = "Next";
  control.appendChild(nextButton);

  // カルーセルの機能
  let currentIndex = 0;
  let startX, endX;

  function showSlide(index) {
    if (index < 0) {
      index = slides.length - 1;
    } else if (index >= slides.length) {
      index = 0;
    }
    currentIndex = index;
    carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  // スワイプジェスチャーの処理
  carousel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchmove", (e) => {
    endX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchend", () => {
    if (startX - endX > 50) {
      showSlide(currentIndex + 1); // 左スワイプ
    } else if (endX - startX > 50) {
      showSlide(currentIndex - 1); // 右スワイプ
    }
  });

  // イベントリスナーの追加
  prevButton.addEventListener("click", () => {
    showSlide(currentIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    showSlide(currentIndex + 1);
  });

  // 最初のスライドを表示
  showSlide(currentIndex);
  return divElem;
};

const caroucel = {
  setCaroucel,
};
export default caroucel;
