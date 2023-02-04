import { createContext } from "react";

export const socketActionType = {
  mySocket: "update_socket",
  allUsers: "all_users",
  allRooms: "allRooms",
  myRoom: "joinedRoom",
  myChat: "haveChat",
  clearMyChat: "clearChat",
  gameStart: "gameStart",
  gameEnd: "gameEnd",
  amIReady: "amIReady",
};

export const defaultSocketContextState = {
  socket: null,
  // uid: null,
  // myID: null,

  // ALL USERS
  allUsers: [],

  // ALL ROOMS
  rooms: [],

  // MY ROOM
  room: null,

  // STORE MASSGAGES
  messages: [],

  // GAME STATE
  gameState: false,

  amIReady: false,
};

export const socketReducer = (state, action) => {
  // console.info(
  //   "Massage recieved - Action: " + action.type + " - Payload: ",
  //   action.payload
  // );

  switch (action.type) {
    // SOCKET
    case socketActionType.mySocket:
      return { ...state, socket: action.payload };
    // ALL USERS
    case socketActionType.allUsers:
      return { ...state, allUsers: [...action.payload] };
    // GAME IS START
    case socketActionType.gameStart:
      return { ...state, gameState: true };
    case socketActionType.gameEnd:
      return { ...state, gameState: false };
    // ALL ROOMS
    case socketActionType.allRooms:
      return { ...state, rooms: [...action.payload] };

    // ROOM THAT I JOIND
    case socketActionType.myRoom:
      return { ...state, room: action.payload };

    //   MY CHAT
    case socketActionType.myChat:
      return { ...state, messages: [...state.messages, action.payload] };
    // CLEAR CHAT
    case socketActionType.clearMyChat:
      return { ...state, messages: [] };

    case socketActionType.amIReady:
      return { ...state, amIReady: action.payload };
    default:
      return state;
  }
};

export const SocketContext = createContext({
  socketState: defaultSocketContextState,
  socketDispatch: () => null,
  joinToLobby: () => null,
  myMessageInRoom: () => null,
  leaveRoom: () => null,
});
