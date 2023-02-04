import { useRef, useContext } from "react";
import {
  ModalContext,
  modalActionPayload,
  modalActionType,
} from "../../context/Modal/ModalContext";
import { SocketContext } from "../../context/Socket/socketContext";
import "./Form.css";
const LobbyForm = ({ myName }) => {
  const inputRoomRef = useRef(null);

  const { joinToLobby } = useContext(SocketContext);
  const { modalDispatch } = useContext(ModalContext);

  function createRoomHandle(e) {
    e.preventDefault();
    const roomName = inputRoomRef.current.value;
    if (!roomName) {
      const component = <p> نام اتاق را وارد کنید </p>;
      modalDispatch({
        type: modalActionType.content,
        payload: { content: component, style: modalActionPayload.style.error },
      });
      return;
    }
    joinToLobby(roomName, myName.current.value);
  }

  return (
    <form className="lobby-form" onSubmit={createRoomHandle}>
      {/* // NAME */}
      <div className="lobby-form__group">
        <label htmlFor="myname-input" className="lobby-form__label">
          your name
        </label>
        <input
          ref={myName}
          type="text"
          id="myname-input"
          className="lobby-form__input"
        />
      </div>
      {/* // ROOM */}
      <div className="lobby-form__group">
        <label htmlFor="roomname-input" className="lobby-form__label">
          roomName
        </label>
        <input
          ref={inputRoomRef}
          type="text"
          id="roomname-input"
          className="lobby-form__input"
        />
      </div>
      <button className="lobby-form__btn">Create Room</button>
    </form>
  );
};

export default LobbyForm;
