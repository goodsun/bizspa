import { router } from "../common/router";
import { CONST } from "../common/const";
import { LANGSET } from "../common/lang";
import utils from "../common/utils";
import getManagerConnect from "../connect/getManager";
import setManagerConnect from "../connect/setManager";
import setElement from "../snipet/setElement";
import cSnip from "../snipet/common";
import dynamoConnect from "../connect/dynamoConnect";

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
  Title.innerHTML = "Admin List";
  mainDiv.appendChild(Title);

  if (balance.eoa != undefined) {
    const adminList = await getManagerConnect.getManager("admins");

    for (const key in adminList) {
      const list = document.createElement("p");
      const eoa = String(adminList[key]);

      list.appendChild(cSnip.span("EOA : "));
      list.appendChild(cSnip.eoa(String(adminList[key])));
      list.appendChild(
        await cSnip.discordByEoa(String(adminList[key]), "span", {
          class: "discordOwnerElement",
        })
      );

      if (Number(adminList[key]) != Number(balance.eoa)) {
        list.appendChild(cSnip.span(" "));
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("itemTag");
        deleteButton.innerHTML = "delete";
        deleteButton.addEventListener("click", async () => {
          if (confirm(adminList[key] + "を削除しますか？")) {
            await setManagerConnect.setManager("delAdmin", adminList[key]);
          }
        });
        list.appendChild(deleteButton);
      }
      subDiv.appendChild(list);
    }
    const addTitle = document.createElement("H3");
    addTitle.innerHTML = "Add Admin EOA";
    subDiv.appendChild(addTitle);

    const discordUserCheckArea = document.createElement("div");
    subDiv.appendChild(discordUserCheckArea);

    const sendToInput = setElement.makeInput(
      "input",
      "sendTo",
      "BaseInput",
      "EOA"
    );
    sendToInput.classList.add("w7p");
    subDiv.appendChild(sendToInput);
    const makeSubmit = setElement.makeInput(
      "submit",
      "submitID",
      "BaseSubmit",
      "Add Admin",
      "Add Admin"
    );
    makeSubmit.classList.add("w3p");
    subDiv.appendChild(makeSubmit);

    sendToInput.addEventListener("input", async (event) => {
      discordUserCheckArea.innerHTML = "";
      discordUserCheckArea.classList.remove("sendToUser");

      if (sendToInput.value != "") {
        const result = await cSnip.userTypeByEoa(
          sendToInput.value,
          discordUserCheckArea
        );
        alert("このアドレスは " + result + " です");
      }
    });

    makeSubmit.addEventListener("click", async () => {
      if (confirm(sendToInput.value + "を登録しますか？")) {
        await setManagerConnect.setManager("setAdmin", [sendToInput.value]);
        window.location.href = "/setting/admin";
      }
    });
  } else {
    const main = document.createElement("p");
    main.innerHTML = "Please connect Wallet";
    subDiv.appendChild(main);
  }
};

const modAdminList = {
  getUI,
};

export default modAdminList;
