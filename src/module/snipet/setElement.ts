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
export const br = () => {
  const child = document.createElement("br");
  return child;
};

const setElement = {
  makeElement,
  makeInput,
  setChild,
  br,
};

export default setElement;
