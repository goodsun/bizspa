import { router } from "../../module/common/router";
export const LANG = {
  en: {
    SITE_TITLE: "BIZEN DAO | Japan traditional crafts",
    SITE_DESCRIPTION:
      "BizenDAO is a non-profit regional revitalization community whose purpose is to promote Bizen ware as a traditional craft.",
    HOME: "home",
    CREATORS: "creators",
    TOKENS: "tokens",
    COTENTS: "contents",
    ACCOUNT: "account",
    DONATE: "donate",
    META: "meta",
    METANAME: "item name",
    DESCRIPTION: "description",
    MAINIMAGE: "image file url（.jpeg or .png）",
    MOVURL: "3D data url（.glb)",
    EXTURL: "external url",
    ATTRIBUTES: "attributes",
    LABEL: "trait type",
    VALUE: "value",
    JSONLOAD: "JSON LOAD",
    JSONDOWNLOAD: "JSON DOWNLOAD",
    OPENVAULT: "open value",
    PICTTOOL: "img resize",
    PERMAWEB: "permaweb",
    JSONSAMPLE: "sample JSON",
    SUBDONATE: "SUBSTITUTE DONATION",
    DONATEPRICE: "DONATE PRICE",
    CASHBACK: "CASHBACK",
    DONOR: "DONOR",
    SUBDONAHIST: "substitute donation history",
    SELECTMES: "SELECT NFT",
    COPYED: " has been copied to the clipboard",
    COPYFAILED: "Copy failed",
    DONATEMESSAGE:
      "BizenDAO registered artists can donate on behalf of buyers here.<br /> You can also get cash back on gas costs.",
    SENDTOEOA: "Send this NFT to EOA",
    SENDNFTBEF: "Do you really want to send this NFT to ",
    SENDNFTAFT: "？",
    SENDED: "Sent NFT",
    CANTSEND: "Cannot send to this EOA",
    ARE_YOU_BUYER: ", Are you the one who purchased this product?　",
    REQUIRE_META_URL: "*Please specify the URL where the metadata is stored.",
    TRYING_TO_MINT: "Trying to mint ",
    REQUIRE_DBIZ: "require D-BIZ",
    INVALID_TOKENURI: " is an invalid tokenURI",
    CREATOR_ONLY: "This NFT MINT is limited to the artist",
    NOT_ENOUGH_DBIZ: "You don't have enough D-BIZ to mint.",
    NOT_ENOUGH: " is not enough",
    MES1: "Please enter your donation amount",
    MES2: "Failed to get current price. Please wait for a while.",
    MES3: "Cashback amount is too large",
    MES4: " : Are you sure you want to send it?",
    MES5: " sent",
    ARE_YOU_TBA: "Do you really want to issue a TBA?",
    MINT_THE_TOKENURI: "mint the NFT using the specified tokenURI.",
  },
  ja: {
    SITE_TITLE: "BIZEN DAO | 備前焼振興 WEB３ コミュニティ",
    SITE_DESCRIPTION:
      "BizenDAOは伝統工芸としての備前焼振興を目的とした非営利の地方創生コミュニティです。",
    HOME: "ホーム",
    CREATORS: "作家",
    TOKENS: "NFT",
    COTENTS: "記事",
    ACCOUNT: "ユーザ",
    DONATE: "寄付",
    META: "メタデータ",
    METANAME: "作品タイトル",
    DESCRIPTION: "概要",
    MAINIMAGE: "写真データのURL（.jpeg or .png）",
    MOVURL: "３DのURL（.glb)",
    EXTURL: "PDFのURL",
    ATTRIBUTES: "追加情報",
    LABEL: "小見出し",
    VALUE: "本文",
    JSONLOAD: "JSONを読み込む",
    JSONDOWNLOAD: "JSON DOWNLOAD",
    OPENVAULT: "ファイル倉庫を開く",
    PICTTOOL: "画像リサイズ",
    PERMAWEB: "パーマウェブ",
    JSONSAMPLE: "JSONサンプル",
    SUBDONATE: "代理寄付",
    DONATEPRICE: "寄付額",
    CASHBACK: "キャッシュバック",
    DONOR: "寄付者",
    SUBDONAHIST: "代理寄付履歴",
    SELECTMES: "選択してください",
    COPYED: "がクリップボードにコピーされました",
    COPYFAILED: "コピーに失敗しました",
    DONATEMESSAGE:
      "BizenDAO登録作家はこちらで購入者に代わって代理寄付が可能です。<br />またガス代としてキャッシュバックすることができます。",
    SENDTOEOA: "このNFTをEOA宛に送信します",
    SENDNFTBEF: "本当にこのNFTを",
    SENDNFTAFT: "に送信しますか？",
    SENDED: "送信しました",
    CANTSEND: "このアドレスには送信できません",
    ARE_YOU_BUYER: " あなたはこちらの商品の購入者ですか？　",
    REQUIRE_META_URL: "※ メタデータが格納されているURLを指定してください。",
    TRYING_TO_MINT: "NFTをミントしようとしています",
    REQUIRE_DBIZ: "必要なD-BIZ",
    INVALID_TOKENURI: " は無効なtokenURIです。",
    CREATOR_ONLY: "このNFTのMINTは作家限定です。",
    NOT_ENOUGH_DBIZ: "Mintするのに必要なD-BIZが足りません。",
    NOT_ENOUGH: " が足りません。",
    MES1: "寄付額を入力してください",
    MES2: "現在価格の取得に失敗しました。しばらくお待ち下さい。",
    MES3: "キャッシュバック額が大きすぎます",
    MES4: "を送信してもよろしいですか？",
    MES5: "を送信しました。",
    ARE_YOU_TBA: "本当にTBAを発行しますか？",
    MINT_THE_TOKENURI: "指定したtokenURIを利用しNFTをMINTします。",
  },
};

export const LANGSET = (word: string) => {
  if (router.lang != "en" && router.lang != "ja") {
    return word;
  }
  const set = LANG[router.lang];
  return set[word];
};