interface RouterParams {
  [index: number]: string;
}

var fullUrl = window.location.href;
var path = window.location.pathname;
var host = window.location.hostname;
var queryString = window.location.search;

const query = new URLSearchParams(queryString);
const params: RouterParams = path.split("/");

const mode = query.get("mode");
const lang = query.get("lang");

export const getParams = () => {
  const rawpath = window.location.pathname.split("/");
  rawpath.shift();
  rawpath.shift();
  return rawpath.join("/");
};

export const router = {
  fullUrl,
  path,
  host,
  queryString,
  getParams,
  params,
};
