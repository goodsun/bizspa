var fullUrl = window.location.href;
var path = window.location.pathname;
var host = window.location.hostname;
var queryString = window.location.search;
const query = new URLSearchParams(queryString);
const params = path.split("/");
console.log("host: " + host);
console.log("path: " + path);

const mode = query.get('mode');
const lang = query.get('lang');
console.log(mode, lang);
