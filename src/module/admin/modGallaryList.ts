import { router } from "../common/router";
import utils from "../common/utils";
import { LANGSET } from "../common/lang";
import dynamoConnect from "../connect/dynamoConnect";
import cSnip from "../snipet/common";
import setElement from "../snipet/setElement";
import CryptoJS from "crypto-js";
import { FORMATS } from "../common/formats";
import { CONST } from "../common/const";
import setManagerConnect from "../connect/setManager";
import { status_type, gallary_type } from "../common/genrelist";

const secretKey = CONST.CRYPTO_SECRET;
const usertype = await setManagerConnect.setManager("checkUser");
const balance = await utils.checkBalance();
const params = router.params;
let gallaryCount = 0;

export const getUI = async (parentDiv) => {
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
  console.dir(params);

  //-- MAIN -------------------------------------
  const Title = document.createElement("H2");
  Title.classList.add("controlLavel");
  Title.innerHTML = "Gallary List";
  mainDiv.appendChild(Title);
  if (balance.eoa != undefined) {
    const items = await dynamoConnect.getDynamoApi("shop");
    for (const key in items) {
      if (balance.eoa == items[key].Eoa || usertype == "admin") {
        if (
          (params[3] == undefined || params[3] == "") &&
          usertype != "admin"
        ) {
          window.location.href = "/setting/gallary/" + items[key].Id;
        }
        gallaryCount++;
        //===================
        const info = JSON.parse(items[key].Json)[router.lang];
        const list = document.createElement("p");

        const itemInfomations = document.createElement("span");
        itemInfomations.appendChild(
          cSnip.link(items[key].Name, "/setting/gallary/" + items[key].Id)
        );
        itemInfomations.appendChild(cSnip.span(" " + info.workplace + " "));
        itemInfomations.appendChild(
          cSnip.span(" [" + status_type[items[key].Status] + "]")
        );
        list.appendChild(itemInfomations);

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("itemTag");
        deleteButton.innerHTML = "delete";
        deleteButton.addEventListener("click", async () => {
          if (confirm(items[key].Name + LANGSET("DEL_CONFIRM"))) {
            await dynamoConnect.postDynamoApi("shop/delete", {
              id: items[key].Id,
            });
            window.location.href = "/setting/gallary";
          }
        });
        list.appendChild(deleteButton);
        subDiv.appendChild(list);
      }
      //===================
    }
    if (router.params[3] != undefined) {
      const gallary = await dynamoConnect.getDynamoApi(
        "shop/id/" + router.params[3]
      );
      console.dir(gallary);
      setInterFace(subDiv, gallary, "Edit Gallary");
    } else {
      setInterFace(subDiv, FORMATS.GALLARY_DEFAULT_FORMAT, "Add Gallary");
    }
  } else {
    const main = document.createElement("p");
    main.innerHTML = "Please connect Wallet";
    subDiv.appendChild(main);
  }
};

const setInterFace = async (parentDiv, item, title) => {
  const uiTitle = document.createElement("H2");
  uiTitle.innerHTML = title;
  parentDiv.appendChild(uiTitle);

  const nameLabel = document.createElement("div");
  nameLabel.classList.add("w2p");
  nameLabel.classList.add("wInline");
  nameLabel.innerHTML = "name";
  parentDiv.appendChild(nameLabel);
  const nameForm = setElement.makeInput(
    "input",
    "creatorName",
    "BaseInput",
    "name"
  );
  nameForm.classList.add("w8p");
  nameForm.value = item.Name;
  parentDiv.appendChild(nameForm);

  const eoaLabel = document.createElement("div");
  eoaLabel.classList.add("w2p");
  eoaLabel.classList.add("wInline");
  eoaLabel.innerHTML = "EOA";

  parentDiv.appendChild(eoaLabel);
  const eoaForm = setElement.makeInput(
    "input",
    "creatorEoa",
    "BaseInput",
    "EOA"
  );
  eoaForm.classList.add("w8p");
  eoaForm.value = item.Eoa;
  if (usertype != "admin") {
    eoaForm.disabled = true;
  }
  parentDiv.appendChild(eoaForm);

  const imageurlLabel = document.createElement("div");
  imageurlLabel.classList.add("w2p");
  imageurlLabel.classList.add("wInline");
  imageurlLabel.innerHTML = "image URL";
  parentDiv.appendChild(imageurlLabel);
  const imageurlForm = setElement.makeInput(
    "input",
    "imageurl",
    "BaseInput",
    "Image URL"
  );
  imageurlForm.classList.add("w8p");
  imageurlForm.value = item.Imgurl;
  parentDiv.appendChild(imageurlForm);

  const seedLabel = document.createElement("div");
  seedLabel.classList.add("w2p");
  seedLabel.classList.add("wInline");
  seedLabel.innerHTML = "SEED";
  parentDiv.appendChild(seedLabel);
  const seedForm = setElement.makeInput(
    "input",
    "seed",
    "BaseInput",
    "secret key"
  );

  const bytes = CryptoJS.AES.decrypt(item.Seed, secretKey);
  const decryptedSeed = bytes.toString(CryptoJS.enc.Utf8);
  seedForm.classList.add("w8p");
  seedForm.value = decryptedSeed;
  parentDiv.appendChild(seedForm);

  const channelIdLabel = document.createElement("div");
  channelIdLabel.classList.add("w2p");
  channelIdLabel.classList.add("wInline");
  channelIdLabel.innerHTML = "channelId";
  parentDiv.appendChild(channelIdLabel);
  const channelIdForm = setElement.makeInput(
    "input",
    "channelId",
    "BaseInput",
    "channel ID"
  );
  channelIdForm.classList.add("w8p");
  channelIdForm.value = item.ChannelId;
  parentDiv.appendChild(channelIdForm);

  const itemInfo = JSON.parse(item.Json);
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

  const typeForm = setElement.makeSelect("ContractType", "BaseInput");
  for (const key in gallary_type) {
    const option = document.createElement("option");
    option.value = gallary_type[key];
    option.innerHTML = gallary_type[key];
    typeForm.appendChild(option);
  }
  typeForm.classList.add("w35p");
  typeForm.value = item.Type;
  parentDiv.appendChild(typeForm);

  const statusForm = setElement.makeSelect("ContractType", "BaseInput");
  for (const key in status_type) {
    const option = document.createElement("option");
    option.value = key;
    option.innerHTML = status_type[key];
    statusForm.appendChild(option);
  }
  statusForm.classList.add("w35p");
  statusForm.value = item.Status;
  parentDiv.appendChild(statusForm);

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
    const cryptedseed = CryptoJS.AES.encrypt(
      seedForm.value,
      secretKey
    ).toString();
    if (usertype != "admin") {
      eoaForm.value = balance.eoa;
    }
    const body = {
      eoa: eoaForm.value,
      name: nameForm.value,
      seed: cryptedseed,
      channelId: channelIdForm.value,
      imgurl: imageurlForm.value,
      type: typeForm.value,
      status: statusForm.value,
      json: jsonForm.value,
    };
    console.log(JSON.stringify(body));
    try {
      if (balance.eoa != eoaForm.value && usertype != "admin") {
        alert(LANGSET("CAN_NOT_CREATE"));
      } else if (
        gallaryCount > 0 &&
        usertype != "admin" &&
        router.params[3] == undefined
      ) {
        alert(LANGSET("CAN_NOT_W_CREATE"));
      } else if (router.params[3] == undefined) {
        if (confirm(nameForm.value + LANGSET("ADD_CONFIRM"))) {
          await dynamoConnect.postDynamoApi("shop/add/", body);
          alert(nameForm.value + LANGSET("ADD_COMPLETE"));
          window.location.href = "/setting/gallary";
        }
      } else {
        if (confirm(nameForm.value + LANGSET("UPDATE_CONFIRM"))) {
          await dynamoConnect.postDynamoApi("shop/update/" + item.Id, body);
          window.location.href = "/setting/gallary";
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  jsonForm.addEventListener("input", async () => {
    const jsonData = JSON.parse(jsonForm.value);
    setJsonParams(jsonData);
  });
};
const setJsonIf = async (parentDiv, item) => {
  const uiTitle = document.createElement("H2");
  uiTitle.innerHTML = "Attrebutes";
  parentDiv.appendChild(uiTitle);

  //----
  const enNameLabel = document.createElement("div");
  enNameLabel.classList.add("w1p");
  enNameLabel.classList.add("wInline");
  enNameLabel.innerHTML = "name";
  parentDiv.appendChild(enNameLabel);
  const enNameForm = setElement.makeInput(
    "input",
    "en_name",
    "BaseInput",
    "name(en)"
  );
  enNameForm.classList.add("w45p");
  enNameForm.value = item.en.name;
  parentDiv.appendChild(enNameForm);

  const jaNameForm = setElement.makeInput(
    "input",
    "ja_name",
    "BaseInput",
    "name(ja)"
  );
  jaNameForm.classList.add("w45p");
  jaNameForm.value = item.ja.name;
  parentDiv.appendChild(jaNameForm);
  //----
  const enProfileLabel = document.createElement("div");
  enProfileLabel.classList.add("w1p");
  enProfileLabel.classList.add("wInline");
  enProfileLabel.innerHTML = "profile";
  parentDiv.appendChild(enProfileLabel);
  const enProfileForm = setElement.makeInput(
    "input",
    "en_profile",
    "BaseInput",
    "profile(en)"
  );
  enProfileForm.classList.add("w45p");
  enProfileForm.value = item.en.profile;
  parentDiv.appendChild(enProfileForm);

  const jaProfileForm = setElement.makeInput(
    "input",
    "ja_profile",
    "BaseInput",
    "profile(ja)"
  );
  jaProfileForm.classList.add("w45p");
  jaProfileForm.value = item.ja.profile;
  parentDiv.appendChild(jaProfileForm);
  //----
  const enWorkplaceLabel = document.createElement("div");
  enWorkplaceLabel.classList.add("w1p");
  enWorkplaceLabel.classList.add("wInline");
  enWorkplaceLabel.innerHTML = "place";
  parentDiv.appendChild(enWorkplaceLabel);
  const enWorkplaceForm = setElement.makeInput(
    "input",
    "en_workplace",
    "BaseInput",
    "workplace(en)"
  );
  enWorkplaceForm.classList.add("w45p");
  enWorkplaceForm.value = item.en.workplace;
  parentDiv.appendChild(enWorkplaceForm);

  const jaWorkplaceForm = setElement.makeInput(
    "input",
    "ja_workplace",
    "BaseInput",
    "workplace(ja)"
  );
  jaWorkplaceForm.classList.add("w45p");
  jaWorkplaceForm.value = item.ja.workplace;
  parentDiv.appendChild(jaWorkplaceForm);
  //----
  const enLocationLabel = document.createElement("div");
  enLocationLabel.classList.add("w1p");
  enLocationLabel.classList.add("wInline");
  enLocationLabel.innerHTML = "location";
  parentDiv.appendChild(enLocationLabel);
  const enLocationForm = setElement.makeInput(
    "input",
    "en_location",
    "BaseInput",
    "location(en)"
  );
  enLocationForm.classList.add("w45p");
  enLocationForm.value = item.en.location;
  parentDiv.appendChild(enLocationForm);

  const jaLocationForm = setElement.makeInput(
    "input",
    "ja_location",
    "BaseInput",
    "location(ja)"
  );
  jaLocationForm.classList.add("w45p");
  jaLocationForm.value = item.ja.location;
  parentDiv.appendChild(jaLocationForm);
  //----
  const enStationLabel = document.createElement("div");
  enStationLabel.classList.add("w1p");
  enStationLabel.classList.add("wInline");
  enStationLabel.innerHTML = "station";
  parentDiv.appendChild(enStationLabel);
  const enStationForm = setElement.makeInput(
    "input",
    "en_station",
    "BaseInput",
    "station(en)"
  );
  enStationForm.classList.add("w45p");
  enStationForm.value = item.en.station;
  parentDiv.appendChild(enStationForm);

  const jaStationForm = setElement.makeInput(
    "input",
    "ja_station",
    "BaseInput",
    "station(ja)"
  );
  jaStationForm.classList.add("w45p");
  jaStationForm.value = item.ja.station;
  parentDiv.appendChild(jaStationForm);

  const updateJsonInfo = () => {
    const textarea = document.getElementById(
      "attrvalue"
    ) as HTMLTextAreaElement;
    textarea.value = JSON.stringify(item);
    console.log(textarea.value);
  };

  enNameForm.addEventListener("input", async () => {
    item.en.name = enNameForm.value;
    updateJsonInfo();
  });
  jaNameForm.addEventListener("input", async () => {
    item.ja.name = jaNameForm.value;
    updateJsonInfo();
  });
  enProfileForm.addEventListener("input", async () => {
    item.en.profile = enProfileForm.value;
    updateJsonInfo();
  });
  jaProfileForm.addEventListener("input", async () => {
    item.ja.profile = jaProfileForm.value;
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

const setJsonParams = async (item) => {
  console.log(item);
  for (const lang in item) {
    for (const key in item[lang]) {
      console.log(lang + "_" + key + " : " + item[lang][key]);
      const elm = document.getElementById(
        lang + "_" + key
      ) as HTMLTextAreaElement;
      elm.value = item[lang][key];
    }
  }
};

const modGallaryList = {
  getUI,
};

export default modGallaryList;
