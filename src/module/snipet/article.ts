import { marked } from "marked";
import { CONST } from "../../module/common/const";
import { router } from "../../module/common/router";
const mainContents = document.getElementById("mainContents");
const options = {
  breaks: true,
};
marked.setOptions(options);

const getMdDir = async () => {
  const repoUrl = CONST.BOT_API_URL + "/contents/get/" + router.lang;
  fetch(repoUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("getMdData");
      console.dir(data);
      // レスポンスからファイルやディレクトリのリストを取得
      const contents = data.map((item) => item.name);
      console.log("Contents:", contents);
    })
    .catch((error) => {
      console.error("can't get directry", error);
    });
};

const getMdPath = async () => {
  const baseUrl = CONST.BOT_API_URL;
  const path = router.getParams();
  const lang = router.lang;
  const mdpath = `${baseUrl}contents/get/${lang}/${path}`;
  parseMdPage(mdpath);
};

const getMdContents = async (mdpath) => {
  try {
    const response = await fetch(mdpath);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const mdBody = await response.json();
    let htmlContent = await marked(mdBody.Contents);
    const baseMdUrl = new URL(mdpath, window.location.origin);

    getEssenssial(mdBody, baseMdUrl);

    htmlContent = htmlContent.replace(
      /(src|href)="([^"]*)"/g,
      (match, p1, p2) => {
        if (!p2.startsWith("http")) {
          const absoluteUrl = new URL(p2, baseMdUrl).href;
          return `${p1}="${absoluteUrl}"`;
        }
        return match;
      }
    );

    return htmlContent;
  } catch (error) {
    // エラーハンドリング
    console.error("Fetch operation failed:", error);
    return "md file notfound md | " + mdpath;
  }
};

const parseMdPage = async (mdpath) => {
  const sectionElement = document.createElement("section");
  sectionElement.classList.add("articleSection");
  mainContents.appendChild(sectionElement);
  /*
  const titleElement = document.createElement("h2");
  sectionElement.appendChild(titleElement);
  */
  const articleElement = document.createElement("div");
  articleElement.classList.add("articleArea");
  sectionElement.appendChild(articleElement);
  articleElement.innerHTML = await getMdContents(mdpath);
};

const resolveRelativePath = (relativePath, basePath) => {
  const absoluteUrl = new URL(relativePath, basePath).href;
  return absoluteUrl;
};

const getEssenssial = async (mdBody, basePath) => {
  // タイトル行とイメージのリンクを正規表現で抽出
  const titleRegex = /^#{1,6}\s+(.*)$/gm;
  const imageRegex = /!\[.*?\]\((.*?)\)/gm;

  let match;
  const titles = [];
  while ((match = titleRegex.exec(mdBody)) !== null) {
    titles.push(match[1]);
  }

  const images = [];
  while ((match = imageRegex.exec(mdBody)) !== null) {
    images.push(match[1]);
  }

  const absolutePaths = images.map((relativePath) =>
    resolveRelativePath(relativePath, basePath)
  );

  console.log("Titles:", titles);
  console.log("Images:", images);
  console.log("Images:", absolutePaths);
};

const article = {
  getMdPath,
  getMdDir,
  getMdContents,
  parseMdPage,
};

export default article;
