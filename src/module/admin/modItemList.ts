import { router } from "../common/router";
import { LANGSET } from "../common/lang";
import utils from "../common/utils";
import dynamoConnect from "../connect/dynamoConnect";
import cSnip from "../snipet/common";
import setElement from "../snipet/setElement";
import { FORMATS } from "../common/formats";
import getTokenConnect from "../connect/getToken";
import { genre_names, type_names, sales_types } from "../common/genrelist";
import setManagerConnect from "../connect/setManager";

const usertype = await setManagerConnect.setManager("checkUser");

export const getUI = async (parentDiv) => {
  const balance = await utils.checkBalance();
  const params = router.params;
  const sectionDiv = document.createElement("div");
  sectionDiv.classList.add("adminSettings");
  parentDiv.appendChild(sectionDiv);
  const mainDiv = document.createElement("div");
  const subDiv = document.createElement("div");
  sectionDiv.id = "meta-section";
  mainDiv.id = "meta-disp";
  subDiv.id = "meta-control";
  sectionDiv.appendChild(mainDiv);
  sectionDiv.appendChild(subDiv);

  //-- MAIN -------------------------------------
  const Title = document.createElement("H2");
  Title.classList.add("controlLavel");
  Title.innerHTML = "Item List";
  mainDiv.appendChild(Title);
  if (balance.eoa != undefined) {
    const items = await dynamoConnect.getDynamoApi("item");
    for (const key in items) {
      const info = JSON.parse(items[key].Json)[router.lang];
      const list = document.createElement("p");
      const itemInfomations = document.createElement("span");
      itemInfomations.appendChild(
        cSnip.link(items[key].Name, "/setting/item/" + items[key].Id)
      );
      itemInfomations.appendChild(
        cSnip.linkCopy(items[key].Contract + "/" + items[key].TokenId)
      );
      itemInfomations.appendChild(
        cSnip.span(" [" + sales_types[items[key].Status] + "]")
      );
      list.appendChild(itemInfomations);

      if (balance.eoa == items[key].Creator || usertype == "admin") {
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("itemTag");
        deleteButton.innerHTML = "delete";
        deleteButton.addEventListener("click", async () => {
          if (confirm(items[key].Name + LANGSET("DEL_CONFIRM"))) {
            await dynamoConnect.postDynamoApi("item/delete", {
              id: items[key].Id,
            });
            window.location.href = "/setting/item";
          }
        });
        list.appendChild(deleteButton);
      }
      subDiv.appendChild(list);
    }
    if (router.params[3] != undefined) {
      const item = await dynamoConnect.getDynamoApi(
        "item/id/" + router.params[3]
      );
      setInterFace(subDiv, item, balance.eoa, "Edit Item");
    } else {
      setInterFace(
        subDiv,
        FORMATS.ITEM_DEFAULT_FORMAT,
        balance.eoa,
        "Create Item"
      );
    }
  } else {
    const main = document.createElement("p");
    main.innerHTML = "Please connect Wallet";
    subDiv.appendChild(main);
  }
};

const setInterFace = async (parentDiv, item, eoa, title) => {
  const uiTitle = document.createElement("H2");
  uiTitle.innerHTML = title;
  parentDiv.appendChild(uiTitle);

  //-- hasList -------------------------------------

  const hasSel = document.createElement("div");
  hasSel.classList.add("w2p");
  hasSel.classList.add("wInline");
  hasSel.innerHTML = "所有NFTから選択";
  parentDiv.appendChild(hasSel);

  const hasNftList = await getTokenConnect.hasTokenList(eoa);
  const nftListForm = setElement.makeSelect("nftSelect", "BaseInput");
  nftListForm.classList.add("w8p");

  let metaDataInfo = [];
  for (const key in hasNftList) {
    const option = document.createElement("option");
    option.value = key;
    const nftInfo = hasNftList[key];
    const metadata = await utils.fetchData(nftInfo.tokenUri);
    option.innerHTML =
      nftInfo.name + " #" + nftInfo.tokenId + " | " + metadata.name;
    nftListForm.appendChild(option);
    metaDataInfo.push(metadata);
  }
  parentDiv.appendChild(nftListForm);
  parentDiv.appendChild(cSnip.hr());

  nftListForm.addEventListener("change", async () => {
    const ca = hasNftList[nftListForm.value].ca;
    const tokenId = String(hasNftList[nftListForm.value].tokenId);
    contractForm.value = ca;
    tokenIdForm.value = tokenId;
    const tokenUri = await getTokenConnect.getToken("tokenURI", ca, tokenId);
    utils.fetchData(tokenUri).then(async (result) => {
      console.log("fetch NFT data");
      console.dir(result);
      if (result.name != undefined) {
        const name = document.getElementById("itemName") as HTMLTextAreaElement;
        name.value = result.name;

        const json = document.getElementById(
          "attrvalue"
        ) as HTMLTextAreaElement;
        const jsonData = JSON.parse(json.value);
        jsonData.en.name = result.name;
        jsonData.ja.name = result.name;

        if (result.attributes != undefined) {
          for (const key in result.attributes) {
            const att = result.attributes[key];
            if (
              att.trait_type != undefined &&
              att.trait_type.toLowerCase() == "size"
            ) {
              jsonData.en.size = att.value;
              jsonData.ja.size = att.value;
            }
            if (
              att.trait_type != undefined &&
              att.trait_type.toLowerCase() == "weight"
            ) {
              jsonData.en.weight = att.value;
              jsonData.ja.weight = att.value;
            }
          }
        }
        json.value = JSON.stringify(jsonData);
        setJsonParams(jsonData);
      }
    });
  });

  //-- hasList -------------------------------------

  const itemInfo = JSON.parse(item.Json);

  const nameLabel = document.createElement("div");
  nameLabel.classList.add("w2p");
  nameLabel.classList.add("wInline");
  nameLabel.innerHTML = "管理名";
  parentDiv.appendChild(nameLabel);
  const nameForm = setElement.makeInput(
    "input",
    "itemName",
    "BaseInput",
    "管理名"
  );
  nameForm.classList.add("w8p");
  nameForm.value = item.Name;
  parentDiv.appendChild(nameForm);

  const contractLabel = document.createElement("div");
  contractLabel.classList.add("w2p");
  contractLabel.classList.add("wInline");
  contractLabel.innerHTML = "TokenInfo";
  parentDiv.appendChild(contractLabel);
  const contractForm = setElement.makeInput(
    "input",
    "itemContract",
    "BaseInput",
    "ContractAddress"
  );
  contractForm.classList.add("w7p");
  contractForm.value = item.Contract;
  parentDiv.appendChild(contractForm);

  const tokenIdForm = setElement.makeInput(
    "input",
    "itemTokenId",
    "BaseInput",
    "TokenID"
  );
  tokenIdForm.classList.add("w1p");
  tokenIdForm.value = item.TokenId;
  parentDiv.appendChild(tokenIdForm);

  const priceLabel = document.createElement("div");
  priceLabel.classList.add("w2p");
  priceLabel.classList.add("wInline");
  priceLabel.innerHTML = "販売価格";
  parentDiv.appendChild(priceLabel);
  const priceForm = setElement.makeInput(
    "input",
    "itemPrice",
    "BaseInput",
    "販売価格"
  );
  priceForm.classList.add("w8p");
  priceForm.value = item.Price;
  parentDiv.appendChild(priceForm);

  const urlLabel = document.createElement("div");
  urlLabel.classList.add("w2p");
  urlLabel.classList.add("wInline");
  urlLabel.innerHTML = "販売URL";
  parentDiv.appendChild(urlLabel);
  const urlForm = setElement.makeInput(
    "input",
    "itemBuyUrl",
    "BaseInput",
    "販売URL"
  );
  urlForm.classList.add("w8p");
  urlForm.value = item.Link;
  parentDiv.appendChild(urlForm);

  setJsonIf(parentDiv, itemInfo);

  const jsonForm = setElement.makeTextarea(
    "attrvalue",
    "BaseTextarea",
    "VALUE",
    ""
  );
  jsonForm.classList.add("wfull");
  jsonForm.value = item.Json;
  parentDiv.appendChild(jsonForm);

  const statusForm = setElement.makeSelect("ContractType", "BaseInput");
  for (const key in sales_types) {
    const option = document.createElement("option");
    option.value = key;
    option.innerHTML = sales_types[key];
    statusForm.appendChild(option);
  }
  statusForm.classList.add("w7p");
  statusForm.value = item.Status;
  parentDiv.appendChild(statusForm);

  if (
    eoa == item.Creator ||
    router.params[3] == undefined ||
    usertype == "admin"
  ) {
    const makeSubmit = setElement.makeInput(
      "submit",
      "submitID",
      "BaseSubmit",
      "SET",
      "SET"
    );
    makeSubmit.classList.add("w3p");
    parentDiv.appendChild(makeSubmit);

    makeSubmit.addEventListener("click", async () => {
      const body = {
        name: nameForm.value,
        contract: contractForm.value,
        tokenid: tokenIdForm.value,
        price: priceForm.value,
        status: statusForm.value,
        json: jsonForm.value,
        creator: eoa,
        link: urlForm.value,
      };

      try {
        if (router.params[3] == undefined) {
          if (confirm(nameForm.value + LANGSET("ADD_CONFIRM"))) {
            await dynamoConnect.postDynamoApi("item/add/", body);
            alert(nameForm.value + LANGSET("ADD_COMPLETE"));
            window.location.href = "/setting/item";
          }
        } else {
          if (confirm(nameForm.value + LANGSET("UPDATE_CONFIRM"))) {
            await dynamoConnect.postDynamoApi("item/update/" + item.Id, body);
            alert(nameForm.value + LANGSET("UPDATE_COMPLETE"));
            window.location.href = "/setting/item";
          }
        }
        window.location.href = "/setting/item";
      } catch (e) {
        console.error(e);
      }
    });
  }

  jsonForm.addEventListener("input", async () => {
    const jsonData = JSON.parse(jsonForm.value);
    setJsonParams(jsonData);
  });
};

const setJsonParams = async (item) => {
  for (const lang in item) {
    for (const key in item[lang]) {
      if (key != "genre" && key != "type") {
        const elm = document.getElementById(
          lang + "_" + key
        ) as HTMLTextAreaElement;
        elm.value = item[lang][key];
      }
    }
  }
};

const setJsonIf = async (parentDiv, item) => {
  const setJsonDiv = document.createElement("div");
  parentDiv.appendChild(setJsonDiv);
  const uiTitle = document.createElement("H2");
  uiTitle.innerHTML = "Attrebutes";
  setJsonDiv.appendChild(uiTitle);

  //----
  const enNameLabel = document.createElement("div");
  enNameLabel.classList.add("w1p");
  enNameLabel.classList.add("wInline");
  enNameLabel.innerHTML = "name";
  setJsonDiv.appendChild(enNameLabel);
  const enNameForm = setElement.makeInput(
    "input",
    "en_name",
    "BaseInput",
    "name(en)"
  );
  enNameForm.classList.add("w45p");
  enNameForm.value = item.en.name;
  setJsonDiv.appendChild(enNameForm);

  const jaNameForm = setElement.makeInput(
    "input",
    "ja_name",
    "BaseInput",
    "name(ja)"
  );
  jaNameForm.classList.add("w45p");
  jaNameForm.value = item.ja.name;
  setJsonDiv.appendChild(jaNameForm);
  //----
  const enOwnerLabel = document.createElement("div");
  enOwnerLabel.classList.add("w1p");
  enOwnerLabel.classList.add("wInline");
  enOwnerLabel.innerHTML = "owner";
  setJsonDiv.appendChild(enOwnerLabel);
  const enOwnerForm = setElement.makeInput(
    "input",
    "en_owner",
    "BaseInput",
    "owner(en)"
  );
  enOwnerForm.classList.add("w45p");
  enOwnerForm.value = item.en.owner;
  setJsonDiv.appendChild(enOwnerForm);

  const jaOwnerForm = setElement.makeInput(
    "input",
    "ja_owner",
    "BaseInput",
    "owner(ja)"
  );
  jaOwnerForm.classList.add("w45p");
  jaOwnerForm.value = item.ja.owner;
  setJsonDiv.appendChild(jaOwnerForm);
  //----
  const enSizeLabel = document.createElement("div");
  enSizeLabel.classList.add("w1p");
  enSizeLabel.classList.add("wInline");
  enSizeLabel.innerHTML = "size";
  setJsonDiv.appendChild(enSizeLabel);
  const enSizeForm = setElement.makeInput(
    "input",
    "en_size",
    "BaseInput",
    "size(en)"
  );
  enSizeForm.classList.add("w45p");
  enSizeForm.value = item.en.size;
  setJsonDiv.appendChild(enSizeForm);

  const jaSizeForm = setElement.makeInput(
    "input",
    "ja_size",
    "BaseInput",
    "size(ja)"
  );
  jaSizeForm.classList.add("w45p");
  jaSizeForm.value = item.ja.size;
  setJsonDiv.appendChild(jaSizeForm);
  //----
  const enWeightLabel = document.createElement("div");
  enWeightLabel.classList.add("w1p");
  enWeightLabel.classList.add("wInline");
  enWeightLabel.innerHTML = "weight";
  setJsonDiv.appendChild(enWeightLabel);
  const enWeightForm = setElement.makeInput(
    "input",
    "en_weight",
    "BaseInput",
    "weight(en)"
  );
  enWeightForm.classList.add("w45p");
  enWeightForm.value = item.en.weight;
  setJsonDiv.appendChild(enWeightForm);

  const jaWeightForm = setElement.makeInput(
    "input",
    "ja_weight",
    "BaseInput",
    "weight(ja)"
  );
  jaWeightForm.classList.add("w45p");
  jaWeightForm.value = item.ja.weight;
  setJsonDiv.appendChild(jaWeightForm);
  //----
  const enWorkplaceLabel = document.createElement("div");
  enWorkplaceLabel.classList.add("w1p");
  enWorkplaceLabel.classList.add("wInline");
  enWorkplaceLabel.innerHTML = "place";
  setJsonDiv.appendChild(enWorkplaceLabel);
  const enWorkplaceForm = setElement.makeInput(
    "input",
    "en_workplace",
    "BaseInput",
    "workplace(en)"
  );
  enWorkplaceForm.classList.add("w45p");
  enWorkplaceForm.value = item.en.workplace;
  setJsonDiv.appendChild(enWorkplaceForm);

  const jaWorkplaceForm = setElement.makeInput(
    "input",
    "ja_workplace",
    "BaseInput",
    "workplace(ja)"
  );
  jaWorkplaceForm.classList.add("w45p");
  jaWorkplaceForm.value = item.ja.workplace;
  setJsonDiv.appendChild(jaWorkplaceForm);
  //----
  const enLocationLabel = document.createElement("div");
  enLocationLabel.classList.add("w1p");
  enLocationLabel.classList.add("wInline");
  enLocationLabel.innerHTML = "location";
  setJsonDiv.appendChild(enLocationLabel);
  const enLocationForm = setElement.makeInput(
    "input",
    "en_location",
    "BaseInput",
    "location(en)"
  );
  enLocationForm.classList.add("w45p");
  enLocationForm.value = item.en.location;
  setJsonDiv.appendChild(enLocationForm);

  const jaLocationForm = setElement.makeInput(
    "input",
    "ja_location",
    "BaseInput",
    "location(ja)"
  );
  jaLocationForm.classList.add("w45p");
  jaLocationForm.value = item.ja.location;
  setJsonDiv.appendChild(jaLocationForm);
  //----
  const enStationLabel = document.createElement("div");
  enStationLabel.classList.add("w1p");
  enStationLabel.classList.add("wInline");
  enStationLabel.innerHTML = "station";
  setJsonDiv.appendChild(enStationLabel);
  const enStationForm = setElement.makeInput(
    "input",
    "en_station",
    "BaseInput",
    "station(en)"
  );
  enStationForm.classList.add("w45p");
  enStationForm.value = item.en.station;
  setJsonDiv.appendChild(enStationForm);

  const jaStationForm = setElement.makeInput(
    "input",
    "ja_station",
    "BaseInput",
    "station(ja)"
  );
  jaStationForm.classList.add("w45p");
  jaStationForm.value = item.ja.station;
  setJsonDiv.appendChild(jaStationForm);

  const balance = await utils.checkBalance();
  const gallary = await dynamoConnect.getDynamoApi("shop/eoa/" + balance.eoa);
  const setShopInfo = document.createElement("p");
  setJsonDiv.appendChild(setShopInfo);
  if (gallary.Eoa != undefined) {
    const setShopButton = document.createElement("button");
    setShopButton.classList.add("button_selected");
    setShopButton.innerHTML = "gallary情報をセット";
    setShopButton.addEventListener("click", async () => {
      setGallaryInfo(gallary);
    });
    setShopInfo.appendChild(setShopButton);
  } else {
    setShopInfo.appendChild(cSnip.span("gallary情報がセットされていません"));
    setShopInfo.appendChild(cSnip.link("gallary情報", "/setting/gallary"));
  }

  setJsonDiv.appendChild(cSnip.hr());
  enNameForm.addEventListener("input", async () => {
    item.en.name = enNameForm.value;
    updateJsonInfo();
  });

  const genreDiv = document.createElement("div");
  setJsonDiv.appendChild(genreDiv);
  genreUi(genreDiv, item);

  //----

  const updateJsonInfo = () => {
    const textarea = document.getElementById(
      "attrvalue"
    ) as HTMLTextAreaElement;

    const before = JSON.parse(textarea.value);
    item.en.genre = before.en.genre;
    item.ja.genre = before.ja.genre;
    item.en.type = before.en.type;
    item.ja.type = before.ja.type;

    textarea.value = JSON.stringify(item);
  };

  enNameForm.addEventListener("input", async () => {
    item.en.name = enNameForm.value;
    updateJsonInfo();
  });
  jaNameForm.addEventListener("input", async () => {
    item.ja.name = jaNameForm.value;
    updateJsonInfo();
  });
  enOwnerForm.addEventListener("input", async () => {
    item.en.owner = enOwnerForm.value;
    updateJsonInfo();
  });
  jaOwnerForm.addEventListener("input", async () => {
    item.ja.owner = jaOwnerForm.value;
    updateJsonInfo();
  });
  enSizeForm.addEventListener("input", async () => {
    item.en.size = enSizeForm.value;
    updateJsonInfo();
  });
  jaSizeForm.addEventListener("input", async () => {
    item.ja.size = jaSizeForm.value;
    updateJsonInfo();
  });
  enWeightForm.addEventListener("input", async () => {
    item.en.weight = enWeightForm.value;
    updateJsonInfo();
  });
  jaWeightForm.addEventListener("input", async () => {
    item.ja.weight = jaWeightForm.value;
    updateJsonInfo();
  });
  enWorkplaceForm.addEventListener("input", async () => {
    item.en.workplace = enWorkplaceForm.value;
    updateJsonInfo();
  });
  jaWorkplaceForm.addEventListener("input", async () => {
    item.ja.workplace = jaWorkplaceForm.value;
    updateJsonInfo();
  });
  enLocationForm.addEventListener("input", async () => {
    item.en.location = enLocationForm.value;
    updateJsonInfo();
  });
  jaLocationForm.addEventListener("input", async () => {
    item.ja.location = jaLocationForm.value;
    updateJsonInfo();
  });
  enStationForm.addEventListener("input", async () => {
    item.en.station = enStationForm.value;
    updateJsonInfo();
  });
  jaStationForm.addEventListener("input", async () => {
    item.ja.station = jaStationForm.value;
    updateJsonInfo();
  });
};

const genreUi = async (parentDiv, item) => {
  //const genre = await dynamoConnect.getDynamoApi("genre");
  for (const key in genre_names) {
    const genreButton = document.createElement("button");
    genreButton.id = "genre_" + key + "_button";
    if (item.en.genre.includes(genre_names[key][router.lang])) {
      genreButton.classList.add("button_selected");
    } else {
      genreButton.classList.add("button_unselected");
    }
    genreButton.innerHTML = genre_names[key][router.lang];
    parentDiv.appendChild(genreButton);
    genreButton.addEventListener("click", async () => {
      toggreGenre(key);
    });
  }
  parentDiv.appendChild(cSnip.br());
  //const type = await dynamoConnect.getDynamoApi("type");
  for (const key in type_names) {
    const typeButton = document.createElement("button");
    typeButton.id = "type_" + key + "_button";
    if (item.en.type.includes(type_names[key][router.lang])) {
      typeButton.classList.add("button_selected");
    } else {
      typeButton.classList.add("button_unselected");
    }
    typeButton.innerHTML = type_names[key][router.lang];
    parentDiv.appendChild(typeButton);
    typeButton.addEventListener("click", async () => {
      toggreType(key);
    });
  }
};

const toggreGenre = async (key) => {
  const textarea = document.getElementById("attrvalue") as HTMLTextAreaElement;
  const item = JSON.parse(textarea.value);
  const elm = document.getElementById(
    "genre_" + key + "_button"
  ) as HTMLTextAreaElement;
  if (item.en.genre.includes(genre_names[key]["en"])) {
    const index = item.en.genre.indexOf(genre_names[key]["en"]);
    if (index !== -1) {
      item.en.genre.splice(index, 1);
      item.ja.genre.splice(index, 1);
    }
    elm.classList.remove("button_selected");
    elm.classList.add("button_unselected");
  } else {
    item.ja.genre.push(genre_names[key]["ja"]);
    item.en.genre.push(genre_names[key]["en"]);
    elm.classList.add("button_selected");
    elm.classList.remove("button_unselected");
  }
  item.en.genre = [...new Set(item.en.genre)];
  item.ja.genre = [...new Set(item.ja.genre)];
  textarea.value = JSON.stringify(item);
};

const toggreType = async (key) => {
  const textarea = document.getElementById("attrvalue") as HTMLTextAreaElement;
  const item = JSON.parse(textarea.value);
  const elm = document.getElementById(
    "type_" + key + "_button"
  ) as HTMLTextAreaElement;
  if (item.en.type.includes(type_names[key]["en"])) {
    const index = item.en.type.indexOf(type_names[key]["en"]);
    if (index !== -1) {
      item.en.type.splice(index, 1);
      item.ja.type.splice(index, 1);
    }
    elm.classList.remove("button_selected");
    elm.classList.add("button_unselected");
  } else {
    item.en.type.push(type_names[key]["en"]);
    item.ja.type.push(type_names[key]["ja"]);
    elm.classList.add("button_selected");
    elm.classList.remove("button_unselected");
  }
  item.en.type = [...new Set(item.en.type)];
  item.ja.type = [...new Set(item.ja.type)];
  textarea.value = JSON.stringify(item);
};

const setGallaryInfo = async (gallary) => {
  if (gallary.Name != undefined) {
    const gallaryJson = JSON.parse(gallary.Json);
    const json = document.getElementById("attrvalue") as HTMLTextAreaElement;
    const jsonData = JSON.parse(json.value);

    if (gallaryJson.en.name != undefined) {
      jsonData.en.owner = gallaryJson.en.name;
    }
    if (gallaryJson.ja.name != undefined) {
      jsonData.ja.owner = gallaryJson.ja.name;
    }
    if (gallaryJson.en.workplace != undefined) {
      jsonData.en.workplace = gallaryJson.en.workplace;
    }
    if (gallaryJson.ja.workplace != undefined) {
      jsonData.ja.workplace = gallaryJson.ja.workplace;
    }
    if (gallaryJson.en.station != undefined) {
      jsonData.en.station = gallaryJson.en.station;
    }
    if (gallaryJson.ja.station != undefined) {
      jsonData.ja.station = gallaryJson.ja.station;
    }
    if (gallaryJson.en.location != undefined) {
      jsonData.en.location = gallaryJson.en.location;
    }
    if (gallaryJson.ja.location != undefined) {
      jsonData.ja.location = gallaryJson.ja.location;
    }
    json.value = JSON.stringify(jsonData);
    setJsonParams(jsonData);
  }
};

const modItemList = {
  getUI,
};

export default modItemList;
