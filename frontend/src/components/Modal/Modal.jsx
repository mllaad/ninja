import { useEffect } from "react";
import { useRef, useContext } from "react";
import { ModalContext } from "../../context/Modal/ModalContext";
import { AiOutlineClose } from "react-icons/ai";
import "./Modal.css";
const Modal = () => {
  const { content, show, style } = useContext(ModalContext).modalState;
  
  const modalStyle = {
    normal: "normal",
    error: "error",
    move: "move",
  };

  if (modalStyle.normal === style) {
    return <ModalNormal isShow={show}>{content}</ModalNormal>;
  }
  if (modalStyle.error === style) {
    return <ModalError isShow={show}>{content}</ModalError>;
  }
  if (modalStyle.move === style) {
    return <ModalMove isShow={show}>{content}</ModalMove>;
  } else {
    console.log("wrong dispatch on modal dispatch *** not style definde ***");
  }
};

// -----------------------  NORMAL MODAL  --------------------------------- //
const ModalNormal = ({ children, isShow }) => {
  const { modalDispatch } = useContext(ModalContext);
  const modalRef = useRef(null);
  useEffect(() => {
    const modal = modalRef.current.classList;

    setTimeout(() => {
      if (isShow) {
        modal.add("modalnormal--show");
        modal.remove("modalnormal--hide");
        setTimeout(() => {
          modalDispatch({ type: "hide" });
        }, 2000);
      }
    }, 10);
    if (!isShow) {
      modal.remove("modalnormal--show");
      modal.add("modalnormal--hide");
    }
  }, [isShow]);

  function clickHandle(e) {
    if (e.target.id == "modal") {
      modalDispatch({ type: "hide" });
      document.removeEventListener("click", clickHandle);
    }
  }

  return (
    <div
      className="modalnormal"
      ref={modalRef}
      id="modal"
      onClick={clickHandle}
    >
      <div className="modalnormal__main">
        <div className="modalnormal__content">{children}</div>
      </div>
    </div>
  );
};
//  --------------------------- MODAL ERROR -------------------------------
const ModalError = ({ children, isShow }) => {
  const { modalDispatch } = useContext(ModalContext);
  const modalRef = useRef(null);

  useEffect(() => {
    const modal = modalRef.current.classList;

    if (isShow) {
      modal.remove("modalerror--hide");
      modal.add("modalerror--show");
    }
    if (!isShow) {
      modal.remove("modalerror--show");
      modal.add("modalerror--hide");
    }
  }, [isShow]);

  function clickHandle() {
    modalDispatch({ type: "hide" });
  }
  return (
    <div className="modalerror" ref={modalRef}>
      <div className="modalerror__main">
        <div className="modalerror__btn" onClick={clickHandle}>
          <AiOutlineClose style={{ pointerEvents: "none" }} />
        </div>
        <div className="modalerror__content">{children}</div>
      </div>
    </div>
  );
};

// --------------------------- MODAL MOVE ------------------------
const ModalMove = ({ children, isShow }) => {
  const { modalDispatch } = useContext(ModalContext);
  const modalRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    const modal = modalRef.current.classList;
    const main = mainRef.current.classList;

    setTimeout(() => {
      if (isShow) {
        modal.add("modalmove--show");
        main.add("main--show");
      }
      if (!isShow) {
        modal.remove("modalmove--show");
        main.remove("main--show");
      }
    }, 10);
  }, [isShow]);

  function clickHandle() {
    modalDispatch({ type: "hide" });
  }
  return (
    <div className="modalmove" ref={modalRef}>
      <div className="modalmove__main" ref={mainRef}>
        <div className="modalmove__btn" onClick={clickHandle}>
          <AiOutlineClose style={{ pointerEvents: "none" }} />
        </div>
        <div className="modalmove__content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
