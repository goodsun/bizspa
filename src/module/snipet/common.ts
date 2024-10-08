import dynamoConnect from "../connect/dynamoConnect";
import { LANGSET } from "../common/lang";
import utils from "../common/utils";

const link = (text, link, option?) => {
  const aTag = document.createElement("a");
  aTag.href = link;
  aTag.textContent = text;
  if (option != undefined) {
    if (option.class != undefined) {
      aTag.classList.add(option.class);
    }
    if (option.target != undefined) {
      aTag.target = option.target;
    }
  }
  return aTag;
};

const linkCopy = (link, message?) => {
  const linkCopyElm = document.createElement("div");
  linkCopyElm.classList.add("linkCopyElm");

  const copybtn = document.createElement("span");
  copybtn.id = link;
  copybtn.classList.add("linkCopy");

  const copyicon = document.createElement("i");
  copyicon.classList.add("far", "fa-copy", "fa-fw");
  copybtn.appendChild(copyicon);

  linkCopyElm.appendChild(copybtn);

  copybtn.onclick = () => {
    const textToCopy = link;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        if (message) {
          alert(message);
        } else {
          alert(`${textToCopy} ${LANGSET("COPYED")}`);
        }
      })
      .catch((err) => {
        console.error(LANGSET("COPYFAILED"), err);
      });
  };
  linkCopyElm.appendChild(copybtn);
  return linkCopyElm;
};

const scan = (eoa, label, labelClass) => {
  const eoaElm = document.createElement("span");

  let replace = eoa;
  if (eoa.length > 13) {
    const front = eoa.substring(0, 6);
    const end = eoa.substring(eoa.length - 4);
    replace = front + "..." + end;
  }

  eoaElm.innerHTML =
    "<span class='" + labelClass + "'>" + label + "</span> " + replace + " ";
  const copybtn = document.createElement("a");
  copybtn.href = "https://polygonscan.com/address/" + eoa;
  copybtn.target = "_blank";
  const copyicon = document.createElement("i");
  copyicon.classList.add("far", "fa-solid", "fa-magnifying-glass");
  copybtn.appendChild(copyicon);
  eoaElm.appendChild(copybtn);
  return eoaElm;
};

const eoa = (
  eoa,
  option = { link: "", target: "_self", icon: "fa-copy" },
  labelType = "none"
) => {
  const { link, target, icon } = option;
  const eoaElm = document.createElement("span");
  const front = eoa.substring(0, 6);
  const end = eoa.substring(eoa.length - 4);
  const replace = front + "..." + end;

  if (labelType == "wallet") {
    const label = document.createElement("i");
    label.classList.add("fa-solid", "fa-wallet");
    eoaElm.appendChild(label);
  }

  if (link) {
    const aTag = document.createElement("a");
    aTag.href = link;
    aTag.target = target;
    aTag.textContent = replace;
    eoaElm.appendChild(aTag);
  } else {
    eoaElm.textContent = replace;
  }

  // コピー用のボタン要素を作成
  const copybtn = document.createElement("span");
  copybtn.id = eoa;
  copybtn.classList.add("eoaCopy");
  copybtn.setAttribute("data-clipboard-text", eoa);

  // アイコン要素を作成してボタンに追加
  const copyicon = document.createElement("i");
  switch (icon) {
    case "bag":
      copyicon.classList.add("fa-solid", "fa-shopping-bag");
      break;
    default:
      copyicon.classList.add("fa", "fa-copy", "fa-fw");
      break;
  }
  copybtn.appendChild(copyicon);

  // ボタン要素をスパン要素に追加
  eoaElm.appendChild(copybtn);

  // クリックイベントを属性として追加
  copybtn.onclick = () => {
    const textToCopy = eoa;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert(`${textToCopy} ${LANGSET("COPYED")}`);
      })
      .catch((err) => {
        console.error(LANGSET("COPYFAILED"), err);
      });
  };
  eoaElm.appendChild(copybtn);
  return eoaElm;
};

const dispTbaOwner = (tbaInfo) => {
  return getTbaOwnerSnipet(tbaInfo, "div", "walletOwnerElement");
};

const dispDiscordUser = (discordUser) => {
  return getDiscordUserSnipet(discordUser, "div", "walletOwnerElement");
};
const discordByEoa = async (eoa, elm, option?) => {
  const discordUser = await dynamoConnect.getUserByEoa(eoa);
  if (discordUser.Name == undefined) {
    const notUserElm = document.createElement(elm);
    notUserElm.innerHTML = "not discord user";
    if (option != undefined) {
      if (option.class != undefined) {
        notUserElm.classList.add(option.class);
      }
    }
    return notUserElm;
  }
  const element = getDiscordUserSnipet(discordUser, elm);
  if (option != undefined) {
    if (option.class != undefined) {
      element.classList.add(option.class);
    }
  }
  return element;
};

const getTbaOwnerSnipet = (tbaInfo, elm, className?) => {
  const discordElem = document.createElement(elm);

  if (className != undefined) {
    discordElem.classList.add(className);
  }
  var newImage = document.createElement("img");
  newImage.src = tbaInfo.tokenInfo.image;
  if (
    newImage.src ==
    "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png"
  ) {
    newImage.src = "/img/alt.jpg";
  }
  newImage.classList.add("walletOwnerIcon");
  discordElem.appendChild(newImage);
  const name = document.createElement("span");
  name.innerHTML =
    '<a href="tokens/' +
    tbaInfo.ca +
    "/" +
    tbaInfo.tokenId +
    '" target="_blank">' +
    tbaInfo.caName +
    " #" +
    tbaInfo.tokenId +
    "</a>";
  discordElem.appendChild(name);
  return discordElem;
};

const getDiscordUserSnipet = (discordUser, elm, className?) => {
  const discordElem = document.createElement(elm);
  if (className != undefined) {
    discordElem.classList.add(className);
  }
  var newImage = document.createElement("img");
  newImage.src = discordUser.Icon;
  if (
    newImage.src ==
    "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png"
  ) {
    newImage.src = "/img/alt.jpg";
  }
  newImage.classList.add("walletOwnerIcon");
  discordElem.appendChild(newImage);

  const name = document.createElement("span");
  name.innerHTML = discordUser.Name;
  discordElem.appendChild(name);

  // コピー用のボタン要素を作成
  const copybtn = document.createElement("span");
  copybtn.id = discordUser.DiscordId;
  copybtn.classList.add("eoaCopy");
  copybtn.setAttribute("data-clipboard-text", discordUser.DiscordId);

  // アイコン要素を作成してボタンに追加
  const copyicon = document.createElement("i");
  copyicon.classList.add("fa-brands", "fa-discord");
  copybtn.appendChild(copyicon);

  // ボタン要素をスパン要素に追加
  discordElem.appendChild(copybtn);

  // クリックイベントを属性として追加
  copybtn.onclick = () => {
    const textToCopy = discordUser.DiscordId;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert(`DiscordId: ${textToCopy} ${LANGSET("COPYED")}`);
      })
      .catch((err) => {
        console.error(LANGSET("COPYFAILED"), err);
      });
  };
  discordElem.appendChild(copybtn);
  return discordElem;
};

export const labeledElm = (type: string, text: string, icon = []) => {
  const child = document.createElement(type);
  if (icon.length > 0) {
    const iconElm = document.createElement("i");
    iconElm.classList.add("labelIcon");
    for (let key in icon) {
      iconElm.classList.add(icon[key]);
    }
    child.appendChild(iconElm);
  }
  const span = document.createElement("span");
  span.classList.add("labeledText");
  span.innerHTML = text;
  child.appendChild(span);
  return child;
};

export const span = (text: string) => {
  const child = document.createElement("span");
  child.innerText = text;
  return child;
};

export const bold = (text: string) => {
  const child = document.createElement("b");
  child.innerText = text;
  return child;
};

export const thin = (text: string) => {
  const child = document.createElement("span");
  child.classList.add("thinText");
  child.innerText = text;
  return child;
};

export const br = () => {
  const child = document.createElement("br");
  return child;
};

export const hr = () => {
  const child = document.createElement("hr");
  return child;
};

export const copyAction = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert(`DiscordId: ${text} ${LANGSET("COPYED")}`);
    })
    .catch((err) => {
      console.error(LANGSET("COPYFAILED"), err);
    });
};

export const donateDetail = (text: string) => {
  const child = document.createElement("span");
  const split = text.split(":");
  if (split.length == 1) {
    child.innerHTML = "[ " + split[0] + " ]";
  } else if (split[0] == "SEND TOKEN") {
    const link = document.createElement("a");
    const nftInfo = split[1].split("/");
    link.href = "/tokens/" + split[1];
    link.target = "_brank";
    link.innerHTML = "NFT:" + short(nftInfo[0]) + "#" + nftInfo[1];
    child.appendChild(link);
  }
  return child;
};

const short = (text: string) => {
  const front = text.substring(0, 6);
  const end = text.substring(text.length - 4);
  const replace = front + "..." + end;
  return replace;
};

const userTypeByEoa = async (eoa, elm) => {
  elm.innerHTML = "";
  return await utils.getUserByEoa(eoa).then(async (eoaUser) => {
    let result = "unknown";
    console.log("check UserTypeByEoa");
    console.dir(eoaUser);
    if (eoaUser.type == "tba") {
      elm.appendChild(cSnip.dispTbaOwner(eoaUser.tbaInfo));
      result = await utils.getUserByEoa(eoa).then((eoaUser2) => {
        let tbaRes = "TBA";
        if (eoaUser2.type == "discordConnect") {
          elm.appendChild(cSnip.dispDiscordUser(eoaUser2.discordUser));
          tbaRes = "tba (discord user)";
        } else if (eoaUser2.type == "eoa") {
          elm.appendChild(cSnip.scan(eoaUser2.eoa, "Final owner", "unknownCa"));
          tbaRes = "tba (unknown user)";
        }
        return result;
      });
    } else if (eoaUser.type == "discordConnect") {
      elm.appendChild(cSnip.dispDiscordUser(eoaUser.discordUser));
      result = "discord user";
    } else if (eoaUser.type == "eoa") {
      elm.appendChild(cSnip.scan(eoaUser.eoa, "UNKNOWN EOA", "unknownEoa"));
      result = "end of address";
    } else if (eoaUser.type == "ca") {
      elm.appendChild(cSnip.scan(eoaUser.eoa, "UNKNOWN CA", "unknownCa"));
      result = "contract address";
    }
    return result;
  });
};

const cSnip = {
  short,
  link,
  linkCopy,
  eoa,
  scan,
  dispTbaOwner,
  dispDiscordUser,
  getTbaOwnerSnipet,
  getDiscordUserSnipet,
  labeledElm,
  span,
  br,
  hr,
  bold,
  thin,
  copyAction,
  donateDetail,
  discordByEoa,
  userTypeByEoa,
};
export default cSnip;
