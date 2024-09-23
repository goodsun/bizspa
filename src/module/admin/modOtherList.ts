import { router } from "../common/router";
import utils from "../common/utils";
import dynamoConnect from "../connect/dynamoConnect";

export const getUI = async (parentDiv) => {
  const balance = await utils.checkBalance();
  const params = router.params;
  const sectionDiv = document.createElement("div");
  sectionDiv.classList.add("adminSettings");
  parentDiv.appendChild(sectionDiv);
  const mainDiv = document.createElement("div");
  const genreDiv = document.createElement("div");
  const typeDiv = document.createElement("div");
  sectionDiv.id = "meta-section";
  mainDiv.id = "meta-disp";
  genreDiv.id = "meta-control";
  typeDiv.id = "meta-control";
  sectionDiv.appendChild(mainDiv);
  const Title = document.createElement("H2");
  Title.classList.add("controlLavel");
  Title.innerHTML = "Genre List";
  sectionDiv.appendChild(Title);
  sectionDiv.appendChild(genreDiv);
  const TypeTitle = document.createElement("H2");
  TypeTitle.classList.add("controlLavel");
  TypeTitle.innerHTML = "Type List";
  sectionDiv.appendChild(TypeTitle);
  sectionDiv.appendChild(typeDiv);

  //-- MAIN -------------------------------------
  if (balance.eoa != undefined) {
    const genre = await dynamoConnect.getDynamoApi("genre");
    for (const key in genre) {
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("itemTag");
      deleteButton.innerHTML = genre[key].name;
      deleteButton.addEventListener("click", async () => {
        alert(
          genre[key].name +
            "はapiのconstに記述されているため削除できません|TODO"
        );
      });
      genreDiv.appendChild(deleteButton);
    }

    const type = await dynamoConnect.getDynamoApi("type");
    for (const key in type) {
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("itemTag");
      deleteButton.innerHTML = type[key].name;
      deleteButton.addEventListener("click", async () => {
        alert(
          type[key].name + "はapiのconstに記述されているため削除できません|todo"
        );
      });
      typeDiv.appendChild(deleteButton);
    }
  } else {
    const main = document.createElement("p");
    main.innerHTML = "Please connect Wallet";
    genreDiv.appendChild(main);
  }
};

const modOtherList = {
  getUI,
};

export default modOtherList;
