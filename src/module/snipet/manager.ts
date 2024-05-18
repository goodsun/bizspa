import { setManager } from "../../module/connect/setManager";

export const control1Set = async (set1) => {
  const result = await setManager("checkUser");
};

export const control2Set = async (set1, set2) => {
  if (
    set1 == "setadmin" ||
    set1 == "deladmin" ||
    set1 == "hiddencreator" ||
    set1 == "publiccreator"
  ) {
    if (confirm(set1 + "はセットできるのか？：" + set2)) {
      const result = await setManager(set1, [set2]);
    }
  }
};

export const control3Set = async (set1, set2, set3) => {
  if (
    set1 == "setcreator" ||
    set1 == "setcreatorinfo" ||
    set1 == "setcontract" ||
    set1 == "setcontractInfo"
  ) {
    if (confirm(set1 + "はセットできるのか？：" + set2 + set3)) {
      const result = await setManager(set1, [set2, set3]);
    }
  }
};

export const control4Set = async (set1, set2, set3, set4) => {
  if (
    set1 == "setcreator" ||
    set1 == "setcreatorinfo" ||
    set1 == "setcontract" ||
    set1 == "setcontractInfo"
  ) {
    if (confirm(set1 + "はセットできるのか？：" + set2 + set3 + set4)) {
      const result = await setManager(set1, [set2, set3, set4]);
    }
  }
};

const manager = {
  control1Set,
  control2Set,
  control3Set,
  control4Set,
};

export default manager;
