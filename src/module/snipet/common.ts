const link = (text, link) => {
  const aTag = document.createElement("a");
  aTag.href = link;
  aTag.textContent = text;
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
          alert(`クリップボードにコピーされました`);
        }
      })
      .catch((err) => {
        console.error("コピーに失敗しました: ", err);
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
        alert(`${textToCopy} がクリップボードにコピーされました`);
      })
      .catch((err) => {
        console.error("コピーに失敗しました: ", err);
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

const getTbaOwnerSnipet = (tbaInfo, elm, className) => {
  const discordElem = document.createElement(elm);
  discordElem.classList.add(className);
  var newImage = document.createElement("img");
  newImage.src = tbaInfo.tokenInfo.image;
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

const getDiscordUserSnipet = (discordUser, elm, className) => {
  const discordElem = document.createElement(elm);
  discordElem.classList.add(className);
  var newImage = document.createElement("img");
  newImage.src = discordUser.Icon;
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
        alert(`DiscordId: ${textToCopy} がクリップボードにコピーされました`);
      })
      .catch((err) => {
        console.error("コピーに失敗しました: ", err);
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

export const br = () => {
  const child = document.createElement("br");
  return child;
};

export const copyAction = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log(`${text} がクリップボードにコピーされました`);
    })
    .catch((err) => {
      console.error("コピーに失敗しました: ", err);
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

const commonSnipet = {
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
  copyAction,
  donateDetail,
};
export default commonSnipet;
