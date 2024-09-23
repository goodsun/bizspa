import { router } from "../common/router";
import { CONST } from "../common/const";
import { LANGSET } from "../common/lang";
import utils from "../common/utils";
import getManagerConnect from "../connect/getManager";
import setManagerConnect from "../connect/setManager";
import cSnip from "../snipet/common";
import setElement from "../snipet/setElement";

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
  Title.innerHTML = "Contract List";
  mainDiv.appendChild(Title);
  if (balance.eoa != undefined) {
    const contracts = await getManagerConnect.getManager("contracts");
    for (const key in contracts) {
      console.dir(contracts[key]);
      if (contracts[key][3]) {
        const list = document.createElement("p");

        if (contracts[key][2] === "tba") {
          list.appendChild(
            cSnip.link("tokenBoundAccount", "/setting/contract/" + key)
          );
          list.appendChild(cSnip.span(" "));
          list.appendChild(cSnip.eoa(contracts[key][0]));
          list.appendChild(cSnip.span(" : "));
          list.appendChild(cSnip.bold(" [ tba ] "));
        } else {
          list.appendChild(
            cSnip.link(contracts[key][1], "/setting/contract/" + key)
          );
          list.appendChild(cSnip.span(" "));
          list.appendChild(cSnip.eoa(contracts[key][0]));
          list.appendChild(cSnip.span(" : "));
          list.appendChild(cSnip.bold(" [ " + contracts[key][2] + " ] "));
        }
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("itemTag");
        deleteButton.innerHTML = "delete";
        deleteButton.addEventListener("click", async () => {
          if (
            confirm(
              contracts[key][1] + "[" + contracts[key][2] + "]を削除しますか？"
            )
          ) {
            await setManagerConnect.setManager("deleteContract", [
              contracts[key][0],
            ]);
            alert(contractName.value + "を削除しました");
            window.location.href = "/setting/contract";
          }
        });
        list.appendChild(deleteButton);
        subDiv.appendChild(list);
      }
    }

    const AddressLabel = document.createElement("div");
    AddressLabel.classList.add("w2p");
    AddressLabel.classList.add("wInline");
    AddressLabel.classList.add("controlLavel");
    AddressLabel.innerHTML = "Contract Address";
    subDiv.appendChild(AddressLabel);

    const contractAddress = setElement.makeInput(
      "input",
      "sendTo",
      "BaseInput",
      "CONTRACT ADDRESS"
    );
    contractAddress.classList.add("w8p");
    subDiv.appendChild(contractAddress);

    const nameLabel = document.createElement("div");
    nameLabel.classList.add("w2p");
    nameLabel.classList.add("wInline");
    nameLabel.classList.add("controlLavel");
    nameLabel.innerHTML = "Contract Name";
    subDiv.appendChild(nameLabel);

    const contractName = setElement.makeInput(
      "input",
      "sendTo",
      "BaseInput",
      "CONTRACT NAME"
    );
    contractName.classList.add("w8p");
    subDiv.appendChild(contractName);

    const selectForm = setElement.makeSelect("ContractType", "BaseInput");
    let selectList = ["nft", "sbt", "tba", "donate", "order"];
    for (const key in selectList) {
      const option = document.createElement("option");
      option.value = selectList[key];
      option.innerHTML = selectList[key];
      selectForm.appendChild(option);
    }
    selectForm.classList.add("w7p");
    subDiv.appendChild(selectForm);

    selectForm.addEventListener("change", async () => {
      if (selectForm.value == "tba") {
        AddressLabel.innerHTML = "Account CA";
        nameLabel.innerHTML = "Register CA";
      } else {
        AddressLabel.innerHTML = "Contract Address";
        nameLabel.innerHTML = "Contract Name";
      }
    });

    const makeSubmit = setElement.makeInput(
      "submit",
      "submitID",
      "BaseSubmit",
      "SET",
      "SET"
    );
    makeSubmit.classList.add("w3p");
    subDiv.appendChild(makeSubmit);

    if (router.params[3] != undefined) {
      const contractInfo = contracts[router.params[3]];
      console.dir(contractInfo);
      contractAddress.value = contractInfo[0];
      contractName.value = contractInfo[1];
      selectForm.value = contractInfo[2];
    }

    makeSubmit.addEventListener("click", async () => {
      if (router.params[3] == undefined) {
        alert(contractName.value + "を登録します");
        await setManagerConnect.setManager("setContract", [
          contractAddress.value,
          contractName.value,
          selectForm.value,
        ]);
        window.location.href = "/setting/contract";
      } else {
        alert(contractName.value + "を更新します");
        await setManagerConnect.setManager("setContractInfo", [
          contractAddress.value,
          contractName.value,
          selectForm.value,
        ]);
        window.location.href = "/setting/contract/" + router.params[3];
      }
    });
  } else {
    const main = document.createElement("p");
    main.innerHTML = "Please connect Wallet";
    subDiv.appendChild(main);
  }
};

const modContractList = {
  getUI,
};

export default modContractList;
