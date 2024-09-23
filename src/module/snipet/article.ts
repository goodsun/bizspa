import { marked } from "marked";
import { CONST } from "../../module/common/const";
import { LANGSET } from "../common/lang";
import { router } from "../../module/common/router";
import { displayArticleCard } from "../snipet/display";
import { uuidV4 } from "ethers";
const mainContents = document.getElementById("mainContents");
const options = {
  breaks: true,
};
marked.setOptions(options);

const getMdSiteMap = async () => {
  const apiUrl = CONST.BOT_API_URL + "/contents/get/" + router.lang;
  const contentsDirArea = document.createElement("div");
  contentsDirArea.classList.add("contentsDirArea");
  mainContents.appendChild(contentsDirArea);

  var parentTitle = document.createElement("h2");
  parentTitle.classList.add("contentParentTitle");
  parentTitle.textContent = "Contents";
  contentsDirArea.appendChild(parentTitle);

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      let sitemap = {};
      for (let contents of data) {
        const tmp = contents.Path.split("/");
        if (!sitemap[tmp[1]]) {
          sitemap[tmp[1]] = [];
        }
        sitemap[tmp[1]].push(contents);
      }
      console.dir(sitemap);
      for (const key in sitemap) {
        if (key != "common") {
          var dirTitle = document.createElement("h2");
          dirTitle.classList.add("contentDirTitle");
          var dirLink = document.createElement("a");
          dirLink.href = "/contents/" + key;
          dirLink.textContent = LANGSET(key);
          dirTitle.appendChild(dirLink);
          contentsDirArea.appendChild(dirTitle);
          var dirList = document.createElement("div");
          dirList.classList.add("contentChildList");
          contentsDirArea.appendChild(dirList);
          for (const dir in sitemap[key].slice(0, 5)) {
            console.dir(sitemap[key][dir]);
            var childLink = document.createElement("a");
            childLink.href = "/contents/" + sitemap[key][dir].Path.substring(3);
            childLink.innerHTML =
              sitemap[key][dir].Title +
              "<span class='ac'>(" +
              sitemap[key][dir].AccessCount +
              ")<span>";
            dirList.appendChild(childLink);
          }
        }
      }
    })
    .catch((error) => {
      console.error("can't get directry", error);
    });
};

const getMdDir = async (dirname) => {
  const apiUrl =
    CONST.BOT_API_URL + "/contents/get/" + router.lang + "/" + dirname;
  const contentsDirArea = document.createElement("div");
  contentsDirArea.classList.add("contentsDirArea");
  mainContents.appendChild(contentsDirArea);
  var parentTitle = document.createElement("h2");
  parentTitle.classList.add("contentParentTitle");
  var dirLink = document.createElement("a");
  dirLink.href = "/contents/";
  dirLink.textContent = "Contents";
  parentTitle.appendChild(dirLink);
  contentsDirArea.appendChild(parentTitle);

  var dirTitle = document.createElement("h2");
  dirTitle.classList.add("contentDirTitle");
  dirTitle.textContent = LANGSET(dirname);
  contentsDirArea.appendChild(dirTitle);

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      for (let contents of data) {
        displayArticleCard(contents, contentsDirArea);
      }
    })
    .catch((error) => {
      console.error("can't get directry", error);
    });
};

const getMdPath = async () => {
  const baseUrl = CONST.BOT_API_URL;
  const PATH = router.getParams();
  const lang = router.lang;
  const mdpath = `${baseUrl}contents/get/${lang}/${PATH}`;
  const path = `${lang}/${PATH}.md`;
  parseMdPage(mdpath, path);
};

const getMdContents = async (mdpath) => {
  try {
    const url = mdpath + "?test=" + Date.now();
    console.log("GET MD CONTENTS:" + url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const mdBody = await response.json();
    let htmlContent = await marked(mdBody.Contents);
    const baseMdUrl = new URL(mdpath, window.location.origin);

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

const parseMdPage = async (mdpath, path) => {
  const editor = `${CONST.ARTICLE_REPO}edit.php?file=${path}`;
  const viewer = `${CONST.ARTICLE_REPO}bizen-article/md/${path}`;
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

  const originalElement = document.createElement("div");
  originalElement.classList.add("articleArea");

  var editorLink = document.createElement("a");
  editorLink.classList.add("editorLink");
  editorLink.href = editor;
  editorLink.target = "_blank";
  editorLink.innerHTML =
    "<i class='fa-solid fa-pen-to-square'></i> <span>EDIT MD FILE</span>&nbsp;&nbsp;";
  originalElement.appendChild(editorLink);
  var mdLink = document.createElement("a");
  mdLink.classList.add("editorLink");
  mdLink.href = viewer;
  mdLink.target = "_blank";
  mdLink.innerHTML =
    "<i class='fa-solid fa-pen-to-square'></i> <span>VIEW MD FILE</span>";
  originalElement.appendChild(mdLink);
  sectionElement.appendChild(originalElement);
};

const article = {
  getMdSiteMap,
  getMdPath,
  getMdDir,
  getMdContents,
  parseMdPage,
};

export default article;
