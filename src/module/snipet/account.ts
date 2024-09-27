import getTbaConnect from "../connect/getTbaConnect";
import getTokenConnect from "../connect/getToken";
import utils from "../common/utils";
import cSnip from "../snipet/common";

/*
  /accountページ オーナー情報エレメント
*/
const showAccount = async (eoa, tbaOwner, parent) => {
  {
    const accountElm = document.createElement("div");
    accountElm.classList.add("accountElm");
    parent.appendChild(accountElm);

    if (tbaOwner) {
      const tbaToken = await getTbaConnect.checkToken(eoa);
      const tokenUri = await getTokenConnect.getToken(
        "tokenURI",
        tbaToken[1],
        tbaToken[2]
      );
      const tokenInfo = await utils.fetchData(tokenUri);
      const image = document.createElement("img");
      image.classList.add("ownerProfPictIcon");
      image.src = tokenInfo.image;
      if (
        image.src ==
        "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png"
      ) {
        image.src = "/img/alt.jpg";
      }
      accountElm.appendChild(image);

      const accountInfo = document.createElement("div");
      accountInfo.classList.add("accountInfo");
      parent.appendChild(accountElm);
      accountInfo.appendChild(cSnip.span("TBA : "));
      accountInfo.appendChild(cSnip.eoa(eoa));
      accountInfo.appendChild(cSnip.br());

      const tbaTokenElm = document.createElement("span");
      tbaTokenElm.appendChild(cSnip.span("NFT : "));
      tbaTokenElm.appendChild(
        cSnip.link(tokenInfo.name, tbaToken[1] + "/" + tbaToken[2])
      );
      accountInfo.appendChild(tbaTokenElm);
      accountInfo.appendChild(cSnip.br());

      accountInfo.appendChild(cSnip.span("NFT owner : "));
      accountInfo.appendChild(
        cSnip.eoa(tbaOwner, {
          link: "/account/" + tbaOwner,
          target: "",
          icon: "copy",
        })
      );
      accountInfo.appendChild(
        await cSnip.discordByEoa(tbaOwner, "span", { class: "doelm" })
      );

      accountElm.appendChild(accountInfo);
    } else {
      utils.getUserByEoa(eoa).then(async (eoaUser) => {
        if (eoaUser.type == "discordConnect") {
          const image = document.createElement("img");
          image.classList.add("ownerProfPictIcon");
          image.src = eoaUser.discordUser.Icon;
          if (
            image.src ==
            "https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png"
          ) {
            image.src = "/img/alt.jpg";
          }
          accountElm.appendChild(image);
          const accountInfo = document.createElement("div");
          accountInfo.classList.add("accountInfo");
          accountInfo.appendChild(cSnip.span("EOA : "));
          accountInfo.appendChild(cSnip.eoa(eoa));
          accountInfo.appendChild(cSnip.br());
          accountInfo.appendChild(cSnip.span("Discord :"));
          accountInfo.appendChild(
            cSnip.getDiscordUserSnipet(
              eoaUser.discordUser,
              "span",
              "discordNameDisp"
            )
          );
          accountInfo.appendChild(cSnip.br());
          accountElm.appendChild(accountInfo);
        } else {
          const accountInfo = document.createElement("div");
          accountInfo.classList.add("accountInfo");
          accountInfo.appendChild(cSnip.span("EOA : "));
          accountInfo.appendChild(cSnip.eoa(eoa));
          accountInfo.appendChild(cSnip.br());
          accountElm.appendChild(accountInfo);
        }
      });
    }
  }
};
const account = { showAccount };

export default account;
