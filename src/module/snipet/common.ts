const link = (text, link) => {
  const aTag = document.createElement("a");
  aTag.href = link;
  aTag.textContent = text;
  return aTag;
};

const linkCopy = (link, message?) => {
  const linkCopyElm = document.createElement("div");
  linkCopyElm.classList.add("linkCopyElm");

  // コピー用のボタン要素を作成
  const copybtn = document.createElement("span");
  copybtn.id = link;
  copybtn.classList.add("linkCopy");

  // アイコン要素を作成してボタンに追加
  const copyicon = document.createElement("i");
  copyicon.classList.add("far", "fa-copy", "fa-fw");
  copybtn.appendChild(copyicon);

  // ボタン要素をスパン要素に追加
  linkCopyElm.appendChild(copybtn);

  // クリックイベントを属性として追加
  copybtn.onclick = () => {
    const textToCopy = link;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        if (message) {
          alert(message);
        } else {
          alert(`URLがクリップボードにコピーされました`);
        }
      })
      .catch((err) => {
        console.error("コピーに失敗しました: ", err);
      });
  };
  linkCopyElm.appendChild(copybtn);
  return linkCopyElm;
};

const eoa = (eoa, option = { link: "", target: "_self" }) => {
  const { link, target } = option;
  const eoaElm = document.createElement("span");
  const front = eoa.substring(0, 6);
  const end = eoa.substring(eoa.length - 4);
  const replace = front + "..." + end;

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
  copyicon.classList.add("far", "fa-copy", "fa-fw");
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

const discordByEoa = (discordUser) => {
  return getDiscordUserByEoa(discordUser, "div", "walletDiscordElement");
};

const getDiscordUserByEoa = (discordUser, elm, className) => {
  const discordElem = document.createElement(elm);
  discordElem.classList.add(className);
  var newImage = document.createElement("img");
  newImage.src = discordUser.Icon;
  newImage.classList.add("walletDiscordIcon");
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
  discordByEoa,
  getDiscordUserByEoa,
  span,
  br,
  copyAction,
  donateDetail,
};
export default commonSnipet;
