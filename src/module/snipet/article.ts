import { marked } from "marked";
import { CONST } from "../../module/common/const";
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
        var dirTitle = document.createElement("h2");
        dirTitle.classList.add("contentDirTitle");
        var dirLink = document.createElement("a");
        dirLink.href = "/contents/" + key;
        dirLink.textContent = key;
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
  dirTitle.textContent = dirname;
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
  const path = router.getParams();
  const lang = router.lang;
  const mdpath = `${baseUrl}contents/get/${lang}/${path}`;
  const original = `${CONST.ARTICLE_REPO_URL}${lang}/${path}.md`;
  parseMdPage(mdpath, original);
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

const parseMdPage = async (mdpath, orgurl) => {
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

  var githubLink = document.createElement("a");
  githubLink.classList.add("githubMdLink");
  githubLink.href = orgurl;
  githubLink.innerHTML =
    "<i class='fab fa-github'></i> <span>ORIGINAL MD FILE</span>";
  originalElement.appendChild(githubLink);
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
