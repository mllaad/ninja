import { useReducer } from "react";
import {
  ModalContext,
  modalReducer,
  defaultModalContext,
} from "./ModalContext";

export const ModalProvider = ({ children }) => {
  const [modalState, modalDispatch] = useReducer(
    modalReducer,
    defaultModalContext
  );

  return (
    <ModalContext.Provider value={{ modalState, modalDispatch }}>
      {children}
    </ModalContext.Provider>
  );
};
