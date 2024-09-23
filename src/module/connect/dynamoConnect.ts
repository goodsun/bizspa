import { CONST } from "../common/const";

const getDynamoApi = async (path) => {
  const Url = CONST.BOT_API_URL + path;
  try {
    const response = await fetch(Url);
    console.log(Url);
    console.dir(response);
    return await response.json();
  } catch (error) {
    console.warn("There was a problem with the fetch operation:", error);
  }
};

const postDynamoApi = async (path, body) => {
  const Url = CONST.BOT_API_URL + path;
  try {
    const response = await fetch(Url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    console.log(Url);
    console.dir(response);
    return await response.json();
  } catch (error) {
    console.warn("There was a problem with the fetch operation:", error);
  }
};

const getUserByEoa = async (eoa) => {
  const Url = CONST.BOT_API_URL + "member/" + eoa;
  try {
    const response = await fetch(Url);
    return await response.json();
  } catch (error) {
    console.warn("There was a problem with the fetch operation:", error);
  }
};

const discordConnect = {
  getDynamoApi,
  postDynamoApi,
  getUserByEoa,
};

export default discordConnect;
