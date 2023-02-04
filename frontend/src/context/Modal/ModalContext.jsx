import { createContext } from "react";

export const modalActionType = {
  content: "content",
  show: "show",
};

export const modalActionPayload = {
  style: {
    normal: "normal",
    error: "error",
    move: "move",
  },
};

export const defaultModalContext = {
  content: null,
  style: "normal",
  show: false,
};

export const modalReducer = (state, action) => {
  switch (action.type) {
    case "content":
      return {
        ...state,
        content: action.payload.content,
        style: action.payload.style,
        show: true,
      };
    case "hide":
      return { ...state, show: false };
    case "show":
      return { ...state, show: true };
    default:
      return { ...state };
  }
};

export const ModalContext = createContext({
  modalState: defaultModalContext,
  modalDispatch: () => null,
});
