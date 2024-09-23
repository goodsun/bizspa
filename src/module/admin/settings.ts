import { router } from "../common/router";
import { CONST } from "../common/const";
import { LANGSET } from "../common/lang";
import utils from "../common/utils";
import modAdminList from "./modAdminList";
import modCreatorList from "./modCreatorList";
import modContractList from "./modContractList";
import modGallaryList from "./modGallaryList";
import modItemList from "./modItemList";
import modOtherList from "./modOtherList";
import setManagerConnect from "../connect/setManager";
import cSnip from "../snipet/common";

const mainContents = document.getElementById("mainContents");

export const getUI = async () => {
  const balance = await utils.checkBalance();
  const params = router.params;
  const makeDiscordDiv = document.createElement("div");
  makeDiscordDiv.classList.add("adminSettings");
  mainContents.appendChild(makeDiscordDiv);
  const mainDiv = document.createElement("div");
  const subDiv = document.createElement("div");
  makeDiscordDiv.id = "meta-section";
  mainDiv.id = "meta-disp";
  subDiv.id = "meta-control";
  makeDiscordDiv.appendChild(mainDiv);
  makeDiscordDiv.appendChild(subDiv);

  //-- MAIN -------------------------------------
  const Title = document.createElement("H2");
  Title.classList.add("controlLavel");
  Title.innerHTML = "Admin Settings";
  mainDiv.appendChild(Title);

  const manageCA = document.createElement("p");
  manageCA.innerHTML = "manager CA : ";
  manageCA.appendChild(cSnip.eoa(CONST.MANAGER_CA));
  subDiv.appendChild(manageCA);
  const usertype = await setManagerConnect.setManager("checkUser");

  // -- MENU --
  var menuLink = document.createElement("div");
  menuLink.classList.add("settingMenuDir");
  var link = document.createElement("a");
  link.href = "/setting/item";
  link.textContent = "item";
  menuLink.appendChild(link);

  if (usertype == "admin") {
    var link = document.createElement("a");
    link.href = "/setting/admin";
    link.textContent = "admin";
    menuLink.appendChild(link);
    var link = document.createElement("a");
    link.href = "/setting/creator";
    link.textContent = "creator";
    menuLink.appendChild(link);
    var link = document.createElement("a");
    link.href = "/setting/contract";
    link.textContent = "contract";
    menuLink.appendChild(link);
  }

  var link = document.createElement("a");
  link.href = "/setting/gallary";
  link.textContent = "gallary";
  menuLink.appendChild(link);
  /*
  var link = document.createElement("a");
  link.href = "/setting/other";
  link.textContent = "other";
  menuLink.appendChild(link);
  */

  if (balance.eoa != undefined && usertype == "admin") {
    mainDiv.appendChild(menuLink);
    const main = document.createElement("p");
    main.innerHTML = usertype + " : ";
    main.appendChild(cSnip.eoa(balance.eoa));
    subDiv.appendChild(main);
    switch (params[2]) {
      case "admin":
        modAdminList.getUI(subDiv);
        break;
      case "creator":
        modCreatorList.getUI(subDiv);
        break;
      case "contract":
        modContractList.getUI(subDiv);
        break;
      case "gallary":
        modGallaryList.getUI(subDiv);
        break;
      case "other":
        modOtherList.getUI(subDiv);
        break;
      default:
        console.log("set default");
        modItemList.getUI(subDiv);
        break;
    }
  } else if (balance.eoa != undefined && usertype == "creator") {
    mainDiv.appendChild(menuLink);
    const main = document.createElement("p");
    main.innerHTML = usertype + " : ";
    main.appendChild(cSnip.eoa(balance.eoa));
    subDiv.appendChild(main);
    switch (params[2]) {
      case "gallary":
        modGallaryList.getUI(subDiv);
        break;
      default:
        console.log("set default");
        modItemList.getUI(subDiv);
        break;
    }
  } else if (balance.eoa != undefined && usertype == "user") {
    const main = document.createElement("p");
    main.innerHTML = "you are normal user";
    subDiv.appendChild(main);
  } else {
    const main = document.createElement("p");
    main.innerHTML = "Please connect Wallet";
    subDiv.appendChild(main);
  }
};

const adminSettings = {
  getUI,
};

export default adminSettings;
