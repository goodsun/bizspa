import { router } from "../common/router";
import { CONST } from "../common/const";
import { LANGSET } from "../common/lang";
import utils from "../common/utils";
import getManagerConnect from "../connect/getManager";
import setManagerConnect from "../connect/setManager";
import cSnip from "../snipet/common";
import setElement from "../snipet/setElement";
import { creator_types } from "../common/genrelist";

export const getUI = async (parentDiv) => {
  const balance = await utils.checkBalance();
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
  Title.innerHTML = "Creator List";
  mainDiv.appendChild(Title);
  if (balance.eoa != undefined) {
    const creatorList = await getManagerConnect.getManager("creators");
    for (const key in creatorList) {
      if (creatorList[key][3]) {
        const list = document.createElement("p");
        list.appendChild(cSnip.span("Creator: "));
        list.appendChild(cSnip.eoa(creatorList[key][0]));
        list.appendChild(
          cSnip.span(
            " " +
              JSON.parse(creatorList[key][1])[router.lang] +
              " [ " +
              creatorList[key][2] +
              " ] "
          )
        );

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("itemTag");
        deleteButton.innerHTML = "delete";
        deleteButton.addEventListener("click", async () => {
          if (
            confirm(
              JSON.parse(creatorList[key][1])[router.lang] +
                LANGSET("DEL_CONFIRM")
            )
          ) {
            await setManagerConnect.setManager("delCreator", [
              creatorList[key][0],
            ]);
            alert(
              JSON.parse(creatorList[key][1])[router.lang] + "を削除しました"
            );
            window.location.href = "/setting/creator";
          }
        });
        list.appendChild(deleteButton);
        subDiv.appendChild(list);
      }
    }

    const AddressLabel = document.createElement("div");
    AddressLabel.classList.add("w2p");
    AddressLabel.classList.add("wInline");
    AddressLabel.innerHTML = "Creator EOA";
    subDiv.appendChild(AddressLabel);
    const contractAddress = setElement.makeInput(
      "input",
      "sendTo",
      "BaseInput",
      "CREATOR EOA"
    );
    contractAddress.classList.add("w8p");
    subDiv.appendChild(contractAddress);

    const nameLabel = document.createElement("div");
    nameLabel.classList.add("w2p");
    nameLabel.classList.add("wInline");
    nameLabel.innerHTML = "Creator Name";
    subDiv.appendChild(nameLabel);

    const enName = setElement.makeInput(
      "input",
      "sendTo",
      "BaseInput",
      "name(en)"
    );
    enName.classList.add("w4p");
    subDiv.appendChild(enName);

    const jpName = setElement.makeInput(
      "input",
      "sendTo",
      "BaseInput",
      "name(jp)"
    );
    jpName.classList.add("w4p");
    subDiv.appendChild(jpName);

    const selectForm = setElement.makeSelect("ContractType", "BaseInput");
    for (const key in creator_types) {
      const option = document.createElement("option");
      option.value = creator_types[key];
      option.innerHTML = creator_types[key];
      selectForm.appendChild(option);
    }
    selectForm.classList.add("w7p");
    subDiv.appendChild(selectForm);

    const makeSubmit = setElement.makeInput(
      "submit",
      "submitID",
      "BaseSubmit",
      "SET",
      "SET"
    );
    makeSubmit.classList.add("w3p");
    subDiv.appendChild(makeSubmit);

    makeSubmit.addEventListener("click", async () => {
      if (confirm(jpName.value + LANGSET("ADD_CONFIRM"))) {
        await setManagerConnect.setManager("setCreator", [
          contractAddress.value,
          JSON.stringify({ en: enName.value, ja: jpName.value }),
          selectForm.value,
        ]);
        alert(jpName.value + LANGSET("ADD_COMPLETE"));
        window.location.href = "/setting/creator";
      }
    });
  } else {
    const main = document.createElement("p");
    main.innerHTML = "Please connect Wallet";
    subDiv.appendChild(main);
  }
};

const modCreatorList = {
  getUI,
};

export default modCreatorList;
