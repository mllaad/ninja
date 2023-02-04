import { useRef } from "react";
import { SiNintendogamecube } from "react-icons/si";
import { useContext } from "react";
import {
  socketActionType,
  SocketContext,
} from "../../context/Socket/socketContext";
import Form from "../Form/Form";
import "./Lobby.css";
import GameForm from "../GameForm/GameForm";
import { SliderIcon, Messages } from "../Chat/Chat";

const Lobby = () => {
  const { socket, rooms } = useContext(SocketContext).socketState;

  const { joinToLobby } = useContext(SocketContext);
  const myNameRef = useRef(null);

  let massageComponent;
  if (!socket) {
    massageComponent = (
      <div className="rooms_no-connection">No Connection :(</div>
    );
  }
  if (!rooms.length) {
    massageComponent = (
      <div className="rooms_no-connection">No Room Exist!</div>
    );
  }

  return (
    <div className="lobby">
      <h1 className="lobby__title">LOBBY</h1>
      <div className="lobby__container">
        <ul className="rooms-list">
          {socket && rooms.length
            ? rooms.map((room) => {
                function clickHandle() {
                  joinToLobby(room.roomName, myNameRef.current.value);
                }
                return (
                  <li
                    className="rooms-list__room"
                    key={room.roomName}
                    onClick={clickHandle}
                  >
                    <span className="rooms-list__span">{room.roomName}</span>
                    <span className="rooms-list__span">
                      members : {room.members.length} / 2
                    </span>
                  </li>
                );
              })
            : massageComponent}
        </ul>
        <Form myName={myNameRef} />
      </div>
    </div>
  );
};

export default Lobby;
// ---------------------------------------  THE ROOM COMPONENT ---------------------------------
export const Room = () => {
  const roomChatRef = useRef(null);
  const { room, myID } = useContext(SocketContext).socketState;
  const { socketDispatch } = useContext(SocketContext);
  const { myMessageInRoom, leaveRoom } = useContext(SocketContext);
  const inputRef = useRef(null);
  if (!room) return;

  // FROM SUBMIT MESSAGE
  function messageSubmitHandle(e) {
    e.preventDefault();
    const text = inputRef.current.value;
    myMessageInRoom(text);
    inputRef.current.value = "";
  }
  // FROM ENTER MESSAGE
  function messageKeyDownHandle(e) {
    if (e.code === "Enter") {
      const text = inputRef.current.value;
      myMessageInRoom(text);
      e.currentTarget.value = "";
    }
  }
  function leaveHandleButtonHandle() {
    leaveRoom(room.roomName);
    socketDispatch({ type: socketActionType.amIReady, payload: null });
  }

  return (
    <div className="room">
      <div className="room__container">
        <SliderIcon chatComponent={roomChatRef} />
        {/* // ------------------------------- ROOM HEADER ------------------------ */}
        <div className="room__firstline">
          <h1 className="room__title">
            <SiNintendogamecube /> <span>{room.roomName}</span>
          </h1>
          <button className="room__leavebtn" onClick={leaveHandleButtonHandle}>
            LEAVE ROOM
          </button>
        </div>
        {/* -------------------------- MAIN --------------------------------------- */}
        <div className="room__main">
          <div className="room__chat" ref={roomChatRef}>
            <Messages />
            <form className="chat__form" onSubmit={messageSubmitHandle}>
              <textarea
                onKeyDown={messageKeyDownHandle}
                ref={inputRef}
                // htmlFor="chat__form_input"
                className="chat__textarea"
                type="text"
              />
              <button className="chat__btn">sendMassage</button>
            </form>
          </div>
          <div className="game__form">
            <GameForm />
          </div>
        </div>
      </div>
    </div>
  );
};
