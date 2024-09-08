import { LANGSET } from "../common/lang";
export const makeElement = (
  type: string,
  text: string,
  id?: string,
  setClass?: string
) => {
  const child = document.createElement(type);
  if (id) child.id = id;
  if (setClass) child.classList.add(setClass);
  child.innerText = text;
  return child;
};

export const setChild = (
  targetElement: HTMLParagraphElement,
  type: string,
  text: string,
  id?: string,
  setClass?: string
) => {
  const child = document.createElement(type);
  if (id) child.id = id;
  if (setClass) child.classList.add(setClass);
  child.innerText = text;
  targetElement.appendChild(child);

  return child;
};

export const makeInput = (
  type: string,
  id: string,
  setClass: string,
  placeholder: string,
  value?: string
) => {
  const child = document.createElement("input");
  child.id = id;
  child.classList.add(setClass);
  child.setAttribute("type", type);
  child.setAttribute("placeholder", placeholder);
  if (value) {
    child.setAttribute("value", value);
  }
  return child;
};

export const makeSelect = (inputId: string, setClass: string) => {
  const child = document.createElement("select");
  child.id = inputId;
  child.classList.add(setClass);
  const option = document.createElement("option");
  option.value = null;
  option.innerHTML = LANGSET("SELECTMES");
  child.appendChild(option);
  return child;
};

export const makeFileSelect = (
  inputId: string,
  setClass: string,
  placeholder: string,
  divClass: string
) => {
  const child = document.createElement("div");
  const labelElm = document.createElement("label");
  const inputElm = document.createElement("input");
  child.classList.add("custom-file-div");
  child.classList.add(divClass);
  labelElm.setAttribute("for", inputId);
  labelElm.classList.add(setClass);
  labelElm.classList.add(divClass);
  labelElm.textContent = placeholder;
  inputElm.type = "file";
  inputElm.id = inputId;
  inputElm.className = "custom-file-input";
  child.appendChild(labelElm);
  child.appendChild(inputElm);
  return child;
};

export const makeTextarea = (
  id: string,
  setClass: string,
  placeholder: string,
  value?: string
) => {
  const child = document.createElement("textarea");
  child.id = id;
  child.classList.add(setClass);
  child.innerText = value;
  child.placeholder = placeholder;
  return child;
};

export const br = () => {
  const child = document.createElement("br");
  return child;
};

const setElement = {
  makeElement,
  makeInput,
  makeTextarea,
  makeSelect,
  makeFileSelect,
  setChild,
  br,
};

export default setElement;
