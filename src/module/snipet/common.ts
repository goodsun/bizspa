const link = (text, link) => {
  const aTag = document.createElement("a");
  aTag.href = link;
  aTag.textContent = text;
  return aTag;
};

const eoa = (eoa, option = { link: "", target: "_self" }) => {
  const { link, target } = option;
  const eoaElm = document.createElement("span");
  const front = eoa.substring(0, 8);
  const end = eoa.substring(eoa.length - 6);
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
  copybtn.classList.add("eoa_copy");
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

const commonSnipet = {
  link,
  eoa,
  span,
  br,
  copyAction,
};
export default commonSnipet;
