import utils from "../common/util";
import { CONST } from "../../module/common/const";
import { router } from "../../module/common/router";

const getMdPath = () => {
  CONST.ARTICLE_REPO_URL;
  const path = router.getParams();
  const mdpath = CONST.ARTICLE_REPO_URL + "md/" + path + ".md";
  console.log("MDPATH:" + mdpath);
};

const article = {
  getMdPath,
};

export default article;
