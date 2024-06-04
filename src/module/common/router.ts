interface RouterParams {
  [index: number]: string;
}

var fullUrl = window.location.href;
var path = window.location.pathname;
var host = window.location.hostname;
var queryString = window.location.search;

const query = new URLSearchParams(queryString);
const params: RouterParams = path.split("/");

const langSet = ["en", "ja", "idn"];
let getLang = query.get("lang");
let lang = localStorage.getItem("lang");
if (getLang != null) {
  lang = getLang;
}
if (!langSet.includes(lang)) {
  lang = "en";
}
console.log("yourLang:" + lang);
localStorage.setItem("lang", lang);

export const getParams = () => {
  const rawpath = window.location.pathname.split("/");
  rawpath.shift();
  rawpath.shift();
  return rawpath.join("/");
};

export const router = {
  lang,
  langSet,
  fullUrl,
  path,
  host,
  queryString,
  getParams,
  params,
};
