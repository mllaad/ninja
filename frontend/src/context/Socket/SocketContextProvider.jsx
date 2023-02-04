import { useContext } from "react";
import { useReducer, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  ModalContext,
  modalActionType,
  modalActionPayload,
} from "../Modal/ModalContext";
import {
  SocketContext,
  socketReducer,
  defaultSocketContextState,
  socketActionType,
} from "./socketContext";

export const messageBoxType = {
  my_Massage: "my_Massage",
  iJoinedToRoom: "iJoinedToRoom",
  roomMate_message: "roomMate_message",
  roomMate_JoinedToRoom: "roomMate_JoinedToRoom",
  roomMate_LeftTheRoom: "roomMate_LeftTheRoom",
};

const SocketContextProvider = ({ children }) => {
  const { modalDispatch } = useContext(ModalContext);

  const [socketState, socketDispatch] = useReducer(
    socketReducer,
    defaultSocketContextState
  );

  const { current: socket } = useRef(
    // http://localhost:3000
    // https://multiplayergame.onrender.com
    // https://bewildered-pea-coat-cow.cyclic.app
    // https://ninja-serverside.iran.liara.run
    io("https://ninja-serverside.iran.liara.run", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
      // withCredentials: true,
      // transports:
    })
  );

  useEffect(() => {
    socket.connect();
    socketDispatch({
      type: "update_socket",
      payload: socket,
    });

    startListening();
  }, []);

  const startListening = () => {
    // socket.on("yourID", yourIDHandle);
    socket.on("allUsers", allUsersHandle);
    socket.on("allRooms", userAllRoomsHandle);
    socket.on("gameStarted", gameStartedHandle);
    socket.on("haveChatInLobby_toClient", haveChatInLobbyHandle);
    socket.on("userJoinedToLobby_toClient", userJoinedToLobbyHandle);
    socket.on("iJoinedToLobby_toClient", iJoinedToLobbyHandle);
    socket.on("userLeftLobbyRoom_toClient", userLeftLobbyRoomHandle);

    // RECONNETS
    socket.io.on("reconnect", (attempt) => {
      console.info("Reconnected on attempt: " + attempt);
      const obj = {
        1: "اول",
        2: "دوم",
        3: "سوم",
        4: "چهارم",
        5: "پنجم",
      };
      modalDispatch({
        type: modalActionType.content,
        payload: {
          content: (
            <div> تلاش {obj[attempt]} شما در به سرور لیارا متصل شدید</div>
          ),
          style: modalActionPayload.style.normal,
        },
      });
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log(attempt);
      const obj = {
        1: "اول",
        2: "دوم",
        3: "سوم",
        4: "چهارم",
        5: "پنجم",
      };
      if (attempt === 5) return;
      modalDispatch({
        type: modalActionType.content,
        payload: {
          content: (
            <div> تلاش {obj[attempt]} برای اتصال به سرور لیارا صبور باشید</div>
          ),
          style: modalActionPayload.style.normal,
        },
      });
    });

    socket.io.on("reconnect_error", (error) => {
      console.info("Reconnection error: " + error);
    });

    socket.io.on("reconnect_failed", () => {
      console.info("Reconnection failure.");
      modalDispatch({
        type: modalActionType.content,
        payload: {
          content: (
            <div>
              <div>ERORR 502</div>
              <div>
                نتوانستیم به سرور متصل شویم لطفا از اتصال اینترنت خود مطمعن شوید
                و یا بعدا دوباره امتحان کنید
              </div>
            </div>
          ),
          style: modalActionPayload.style.error,
        },
      });
    });

    // --------------------------------------------------
    // game config
    socket.on("saveSuccesed", () => {
      modalDispatch({
        type: modalActionType.content,
        payload: {
          content: (
            <div>اطلاعات شما با موفقیت ثبت شد منتظر هم اتاقی خود باشد</div>
          ),
          style: modalActionPayload.style.normal,
        },
      });
      socketDispatch({ type: socketActionType.amIReady, payload: true });
    });
    // -------------------------------     ERRORS   --------------------------------------
    socket.on("unkownGame", unKownGameHandle);
    socket.on("tooManyPlayers", tooManyPlayersHandle);
    socket.on("timeIsNotMatch", timeIsNotMatchHandle);
    socket.on("alreadyPicked", alreadyPickedHandle);

    function unKownGameHandle() {
      modalDispatch({
        type: modalActionType.content,
        payload: {
          content: <span>اتاق ناشناس</span>,
          style: modalActionPayload.style.error,
        },
      });
    }
    function tooManyPlayersHandle() {
      modalDispatch({
        type: modalActionType.content,
        payload: {
          content: <span>اتاق پر میباشد</span>,
          style: modalActionPayload.style.error,
        },
      });
    }
    function timeIsNotMatchHandle() {
      modalDispatch({
        type: modalActionType.content,
        payload: {
          content: <span>زمان بازی خود را با هم اتاقیه خود یکی کنید</span>,
          style: modalActionPayload.style.error,
        },
      });
    }
    function alreadyPickedHandle() {
      modalDispatch({
        type: modalActionType.content,
        payload: {
          content: (
            <span>
              {" "}
              این قهرمان توسط هم اتاقیه شما انتخاب شده است لطفا قهرمان خود را
              عوض کنید{" "}
            </span>
          ),
          style: modalActionPayload.style.error,
        },
      });
    }

    // WHEN SOME ONE DISCONNECTED FROM LOBBY
    socket.on("user_disconnected", userDisconnectedHandle);

    function gameStartedHandle() {
      socketDispatch({ type: socketActionType.gameStart, payload: true });
    }

    // ALL USERS IN LOBBY
    function allUsersHandle(users) {
      socketDispatch({ type: socketActionType.allUsers, payload: users });
    }
    // ALL ROOMS
    function userAllRoomsHandle(rooms) {
      socketDispatch({ type: socketActionType.allRooms, payload: rooms });
    }
    // ME JOIND TO ROOM
    function iJoinedToLobbyHandle(data) {
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const user = { ...data, time, type: messageBoxType.iJoinedToRoom };
      socketDispatch({ type: socketActionType.myRoom, payload: user });
      socketDispatch({ type: socketActionType.myChat, payload: user });
    }
    // OTHERS JOIND TO ROOM
    function userJoinedToLobbyHandle(data) {
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const user = {
        ...data,
        time,
        type: messageBoxType.roomMate_JoinedToRoom,
      };
      socketDispatch({ type: socketActionType.myRoom, payload: user });
      socketDispatch({ type: socketActionType.myChat, payload: user });
    }
    // CHAT IN ROOM FROM ROOM MATE
    function haveChatInLobbyHandle(text) {
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const data = { text, time, type: messageBoxType.roomMate_message };
      socketDispatch({ type: socketActionType.myChat, payload: data });
    }

    // OTHER LEFT THE ROOM
    function userLeftLobbyRoomHandle(name) {
      console.log("leeeeeeeeft");
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const data = { ...name, time, type: messageBoxType.roomMate_LeftTheRoom };
      console.log(name);
      socketDispatch({ type: socketActionType.myRoom, payload: data });
      socketDispatch({ type: socketActionType.myChat, payload: data });
    }

    // DISCONNCETD USER FROM LOBBY
    function userDisconnectedHandle(uid) {
      // console.log("User Disconnected message received");
    }
  };

  // ----------------------------------- EMITS -------------------------------------------
  // REQUEST JOIN LOBBY ROOM
  const joinToLobby = (roomName, clientName) => {
    if (!clientName) {
      clientName = "unknown";
    }
    const data = { roomName, clientName };
    socket.emit("requestJoinLobbyRoom", data);
  };

  //  MY MESSAGE TO MY ROOM MATE
  const myMessageInRoom = (text) => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const data = { text, time, type: messageBoxType.my_Massage };
    socketDispatch({ type: socketActionType.myChat, payload: data });

    socket.emit("haveChatInLobby_toServer", text);
  };

  // LEAVE ROOM
  const leaveRoom = (roomName) => {
    socket.emit("leaveRoom", roomName);
    socketDispatch({ type: socketActionType.myRoom, payload: null });
    socketDispatch({ type: socketActionType.clearMyChat });
  };
  // -------------------------------------------------------------------------------------
  return (
    <SocketContext.Provider
      value={{
        socketState,
        socketDispatch,
        joinToLobby,
        myMessageInRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
