import { marked } from "marked";
import { CONST } from "../../module/common/const";
import { LANGSET } from "../common/lang";
import { router } from "../../module/common/router";
import { displayArticleCard } from "../snipet/display";
import { exclude_dir } from "../common/genrelist";
import { page_dir } from "../common/genrelist";

const mainContents = document.getElementById("mainContents");
const options = {
  breaks: true,
};

marked.setOptions(options);

const getMdSiteMap = async () => {
  const apiUrl = CONST.ARTICLE_REPO + `smjson.php?n=${Date.now()}`;

  const contentsDirArea = document.createElement("div");
  contentsDirArea.classList.add("contentsDirArea");
  mainContents.appendChild(contentsDirArea);

  var parentTitle = document.createElement("h2");
  parentTitle.classList.add("contentParentTitle");
  parentTitle.textContent = "Contents";
  contentsDirArea.appendChild(parentTitle);

  const staticArea = document.createElement("div");
  staticArea.classList.add("staticDirArea");
  contentsDirArea.appendChild(staticArea);

  const PATH = router.lang + "/common/staticmenu";
  const mdPath = CONST.BOT_API_URL + "contents/get/" + PATH;
  const path = `${PATH}.md`;
  parseMdPage(mdPath, path, staticArea);

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((json) => {
      console.dir(
        "DIR順は" + JSON.stringify(Object.keys(page_dir[router.lang]), null, 2)
      );

      const originaldata = json[router.lang];
      const sortOrder = Object.keys(page_dir[router.lang]);
      const data: { [key: string]: any } = {};

      sortOrder.forEach((key) => {
        if (originaldata[key]) {
          data[key] = originaldata[key];
        }
      });

      Object.keys(originaldata).forEach((key) => {
        if (!data[key]) {
          data[key] = originaldata[key];
        }
      });

      Object.keys(data).forEach((dir) => {
        if (!exclude_dir.includes(dir)) {
          var dirTitle = document.createElement("h2");
          dirTitle.classList.add("contentDirTitle");
          var dirLink = document.createElement("a");
          dirLink.href = "/contents/" + dir;
          dirLink.textContent = page_dir[router.lang][dir];
          dirTitle.appendChild(dirLink);
          contentsDirArea.appendChild(dirTitle);
          var dirList = document.createElement("div");
          dirList.classList.add("contentChildList");
          contentsDirArea.appendChild(dirList);

          // コンテンツをLankで並べ替え
          const sortedData = data[dir]
            .filter(
              (item) => item.setting && typeof item.setting.lank !== "undefined"
            )
            .sort((a, b) => a.setting.lank - b.setting.lank)
            .concat(
              data[dir].filter(
                (item) =>
                  !item.setting || typeof item.setting.lank === "undefined"
              )
            );

          for (let contents of sortedData) {
            console.log(`setting: ${JSON.stringify(contents.setting)}`);
            if (contents.setting && contents.setting.index == "hidden") {
              continue;
            }
            var childLink = document.createElement("a");
            childLink.href = `/contents/${dir}/${contents.link}`;
            childLink.innerHTML = contents.title;
            dirList.appendChild(childLink);
          }
        }
      });
    })
    .catch((error) => {
      console.error("can't get directry", error);
    });
};

const getMdDir = async (dirname) => {
  //const apiUrl = CONST.BOT_API_URL + "/contents/get/" + router.lang + "/" + dirname;
  const apiUrl = CONST.ARTICLE_REPO + `smjson.php?n=${Date.now()}`;
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
  dirTitle.textContent = page_dir[dirname];
  contentsDirArea.appendChild(dirTitle);

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((json) => {
      const data = json[router.lang][dirname];

      const sortedData = data
        .filter(
          (item) => item.setting && typeof item.setting.lank !== "undefined"
        )
        .sort((a, b) => a.setting.lank - b.setting.lank)
        .concat(
          data.filter(
            (item) => !item.setting || typeof item.setting.lank === "undefined"
          )
        );

      for (let contents of sortedData) {
        console.log(`setting: ${JSON.stringify(contents.setting)}`);
        if (contents.setting && contents.setting.index == "hidden") {
          continue;
        }
        displayArticleCard(contents, dirname, contentsDirArea);
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

const getMdContents = async (path) => {
  try {
    const htmlContent = await fetch(
      `${CONST.ARTICLE_REPO_URL}/${path}?n=${Date.now()}`
    )
      .then((response) => response.text())
      .then((markdown) => {
        return marked(markdown);
      })
      .catch((error) => console.error("Error fetching markdown:", error));

    return htmlContent;
  } catch (error) {
    // エラーハンドリング
    console.error("Fetch operation failed:", error);
    return "md file notfound md | " + path;
  }
};

const parseMdPage = async (mdpath, path, parentElm?) => {
  const editor = `${CONST.ARTICLE_REPO}edit.php?file=${path}`;
  const viewer = `${CONST.ARTICLE_REPO}viewer.php?file=${path}`;
  const sectionElement = document.createElement("section");
  sectionElement.classList.add("articleSection");

  if (parentElm == undefined) {
    mainContents.appendChild(sectionElement);
  } else {
    parentElm.appendChild(sectionElement);
  }
  const articleElement = document.createElement("div");
  articleElement.classList.add("articleArea");
  sectionElement.appendChild(articleElement);
  articleElement.innerHTML = String(await getMdContents(path));

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
