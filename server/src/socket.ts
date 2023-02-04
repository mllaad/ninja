import { Server as HttpServer } from "http";
import { setInterval } from "node:timers";
import { Socket, Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Fighter, Timer } from "./game/classes.js";
import { initCharacters, gameLoop } from "./game/init-game.js";

type RoomAndChatTypes = {
  roomName: string;
  allClients: { name: string; id: string }[];
  client: string[];
  time: string;
};

const FRAME_RATE = 1000 / 60;
export class ServerSocket {
  // class itself
  public static instance: ServerSocket;

  // io
  public io: Server;

  // interval ID
  public intervalLoopGameID: { [roomName: string]: NodeJS.Timeout };

  /** Master list of all connected users */
  public users: { [uid: string]: string };

  // All Rooms
  public rooms: { [clientID: string]: string };

  // TIMER
  public timer: { [roomName: string]: Timer };

  // WHO PICK WHAT HERO
  public userPickHero: {
    [roomName: string]: { [clientID: string]: "mack" | "kenji" };
  };

  // time that users give to server for game config
  public usersGameConfig: {
    [roomName: string]: {
      [clientID: string]: { time: number; hero: string; namePlayer: string };
    };
  };

  // players confirm of starting the game
  public gameRoomConfirmStart: { [clientID: string]: string };

  // custom name of user
  public clientNames: { [clientID: string]: string };

  // all game data
  public gameState: {
    [roomName: string]: {
      mack: Fighter;
      kenji: Fighter;
      timer: number;
    };
  };

  constructor(server: HttpServer) {
    ServerSocket.instance = this;
    this.users = {};
    this.rooms = {};
    this.userPickHero = {};
    this.gameState = {};
    this.clientNames = {};
    this.usersGameConfig = {};
    this.gameRoomConfirmStart = {};
    this.timer = {};
    this.intervalLoopGameID = {};
    this.io = new Server(server, {
      cors: {
        origin: "*",
      },
    });
    this.io.on("connect", this.startListeners);
  }

  startListeners = (socket: Socket) => {
    this.userConnect(socket);
    this.userDisconnect(socket);
    this.userJoinedLobbyRoom(socket);
    this.leaveRoomListener(socket);
    this.startGameListener(socket);
    this.keyDownHandle(socket);
  };

  // USERJOINROOM
  userJoinedLobbyRoom = (socket: Socket) => {
    socket.on(
      "requestJoinLobbyRoom",
      async (request: { clientName: string; roomName: string }) => {
        console.log("______________________________________________________");
        console.log(this.intervalLoopGameID);
        console.log(this.gameRoomConfirmStart);
        console.log(this.userPickHero);
        console.log(this.usersGameConfig);
        console.log(this.gameState);

        const { clientName, roomName } = request;
        socket.join(roomName);
        const clientsInRoom = this.io.sockets.adapter.rooms.get(roomName);

        if (!clientsInRoom) {
          socket.emit("unkownGame");
          socket.leave(roomName);
          return;
        }

        if (clientsInRoom.size === 3) {
          socket.emit("tooManyPlayers");
          socket.leave(roomName);
          return;
        }

        // STORE IN THIS.ROOMS
        this.rooms[socket.id] = roomName;

        // STORE CLIENT NAME
        this.clientNames[socket.id] = clientName;

        const sendToME = (nameSpace: string, payload?: object) => {
          socket.emit(nameSpace, payload);
        };
        const sendToOther = (nameSpace: string, payload?: object) => {
          this.io.to(roomName).except(socket.id).emit(nameSpace, payload);
        };

        // GIVES US NAMES OF CLIENTS THAT ARE IN THE ROOM
        const client = [this.clientNames[socket.id]];
        let allClients: { name: string; id: string }[] = [];
        clientsInRoom.forEach((clientID) => {
          allClients.push({ name: this.clientNames[clientID], id: clientID });
        });

        // CREATED AT
        const time = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        // TYPE OF DATA
        const data: RoomAndChatTypes = { roomName, allClients, client, time };

        // OTHER ON ROOM GOING TO NOTICE IT
        sendToOther("userJoinedToLobby_toClient", data);

        // ME ON ROOM GOING TO NOTICE IT
        sendToME("iJoinedToLobby_toClient", data);

        // RECULCULATE ALL ROOMS
        this.sendMassage(
          "allRooms",
          Object.values(this.users),
          this.sortedRooms()
        );

        // CHAT INSIDE OF LOBBY
        socket.on("haveChatInLobby_toServer", (message) => {
          sendToOther("haveChatInLobby_toClient", message);
        });
      }
    );
  };
  // START THE GAME
  startGameListener = (socket: Socket) => {
    socket.on("gameStart_toServer", async (obj) => {
      const { namePlayer, hero, time } = obj;
      const roomName = this.rooms[socket.id];

      if (this.usersGameConfig[roomName]) {
        const alreadyPicked = Object.values(
          this.usersGameConfig[roomName]
        ).some((_obj) => _obj.hero === hero);

        const isTimeMatching = Object.values(
          this.usersGameConfig[roomName]
        ).some((obj) => obj.time !== time);

        if (isTimeMatching) return socket.emit("timeIsNotMatch");
        if (alreadyPicked) return socket.emit("alreadyPicked");
      }

      // game config
      this.usersGameConfig[roomName] = { [socket.id]: obj };

      // who control what charecter
      this.userPickHero[roomName] = {
        ...this.userPickHero[roomName],
        [socket.id]: hero,
      };
      // confirming for starting the game
      this.gameRoomConfirmStart[socket.id] = roomName;

      const numberOfConfermForStart = Object.entries(
        this.gameRoomConfirmStart
      ).reduce((total: number, [_, _roomName]) => {
        if (_roomName === roomName) {
          return total + 1;
        }
        return total;
      }, 0);

      if (numberOfConfermForStart == 1) {
        socket.emit("saveSuccesed");
      }

      if (numberOfConfermForStart == 2) {
        this.io.sockets.in(roomName).emit("gameStarted");
        this.gameState = {
          ...this.gameState,
          [roomName]: initCharacters({ namePlayer, time }),
        };

        this.startGameInterval(roomName, socket);
      }
    });
  };
  // GAME ON LOOP
  startGameInterval(roomName: string, socket: Socket) {
    this.timer[roomName] = new Timer(this.gameState[roomName].timer);
    this.timer[roomName].decrease();

    let delay = 0;
    clearInterval(this.intervalLoopGameID[roomName]);

    // IF NOT THEN RUN THE GAME
    this.intervalLoopGameID[roomName] = setInterval(async () => {
      Object.entries(this.gameState).forEach(async ([roomName, gameState]) => {
        const winner = gameLoop({
          playerOne: gameState.mack,
          playerTwo: gameState.kenji,
          timer: this.timer[roomName].time,
        });

        // CONTINIUE
        this.io.sockets.in(roomName).emit("game", {
          playersState: gameState,
          timer: this.timer[roomName].time,
          result: winner,
        });

        // IF ENDED
        if (winner) {
          delay++;
          if (delay === 300) {
            this.io.sockets.in(roomName).emit("gameOver", {
              playersState: this.gameState[roomName],
              result: winner,
            });
            delay = 0;
            this.gameEndInRoom(roomName);
          }
        }
      });
    }, FRAME_RATE);
  }
  // ---------------------------------------------------------------------------------------------//
  gameEndInRoom = async (roomName: string) => {
    delete this.gameState[roomName];
    delete this.userPickHero[roomName];

    delete this.usersGameConfig[roomName];

    // IF THERE ISENT ANY GAME STATE
    if (!Object.keys(this.gameState).length) {
      console.log("cancled");
      clearInterval(this.intervalLoopGameID[roomName]);
      delete this.intervalLoopGameID[roomName];
    }

    // LEAVE FROM LOBBY WHEN GAME GETS ENDED
    (await this.io.in(roomName).fetchSockets()).forEach((user) => {
      user.leave(roomName);
      delete this.userPickHero[user.id];
      delete this.rooms[user.id];
      delete this.clientNames[user.id];
      delete this.gameRoomConfirmStart[user.id];
    });
    // TELL EVERYBODY NEW INFORMATION
    this.sendMassage("allRooms", Object.values(this.users), this.sortedRooms());
  };
  // ---------------------------------------------------------------------------------------------//
  // KEYDOWN
  keyDownHandle = (socket: Socket) => {
    socket.on("keyDown", (keyCode) => {
      // NAME OF THE ROOM
      const roomName = Array.from(socket.rooms)[1];

      // STATE BASED ON ROOM
      const gameRoom = this.gameState[roomName];
      if (!gameRoom) return;

      // WHO IS WHO
      const isPlayerOrEnemy: string = this.userPickHero[roomName][socket.id];

      const playerOrEnemy: Fighter = gameRoom[isPlayerOrEnemy as keyof object];
      if (!playerOrEnemy) return;
      switch (keyCode) {
        case "a":
          playerOrEnemy.moveLeft();
          break;
        case "d":
          playerOrEnemy.moveRight();
          break;
        case "w":
          playerOrEnemy.jump();
          break;
        case "space":
          playerOrEnemy.attack();
          break;
        default:
          break;
      }
    });

    socket.on("keyUp", (keyCode) => {
      const roomName = Array.from(socket.rooms)[1];
      const gameRoom = this.gameState[roomName];
      if (!gameRoom) return;
      const isPlayerOrEnemy: string = this.userPickHero[roomName][socket.id];
      const playerOrEnemy: Fighter = gameRoom[isPlayerOrEnemy as keyof object];
      if (!playerOrEnemy) return;
      switch (keyCode) {
        case "a":
          playerOrEnemy.keys.a.pressed = false;
          break;
        case "d":
          playerOrEnemy.keys.d.pressed = false;
          break;

        default:
          break;
      }
    });
  };

  // --------------------------------------- LEFT LOBBY ---------------------------------//
  leaveRoomListener(socket: Socket) {
    socket.on("leaveRoom", (roomName) => {
      socket.leave(this.rooms[socket.id]);

      delete this.usersGameConfig[roomName];
      this.leaveRoomHandle(socket, roomName);
    });
  }
  leaveRoomHandle = (socket: Socket, roomName: string) => {
    const clientsInRoom = this.io.sockets.adapter.rooms.get(roomName);

    if (clientsInRoom) {
      const client = [this.clientNames[socket.id]];
      let allClients: { name: string; id: string }[] = [];
      clientsInRoom.forEach((clientID) => {
        allClients.push({ name: this.clientNames[clientID], id: clientID });
      });
      const data: RoomAndChatTypes = {
        allClients,
        client,
        roomName,
        time: "null",
      };
      this.io
        .to(this.rooms[socket.id])
        .emit("userLeftLobbyRoom_toClient", data);
    }

    // STORE IN THIS.ROOMS
    delete this.rooms[socket.id];
    // STORE CLIENT NAME
    delete this.clientNames[socket.id];

    delete this.gameRoomConfirmStart[socket.id];

    // RECALCULATE ROOMS
    this.sendMassage("allRooms", Object.values(this.users), this.sortedRooms());
  };
  // ---------------------------------------------------------------------------------------------//
  // CONNECTED USER
  userConnect = (socket: Socket) => {
    // console.log(`connected width id: ${socket.id}`);
    // GET YOUR SOCKET ID
    socket.emit("yourID", socket.id);
    const uid = uuidv4();
    this.users[uid] = socket.id;
    const users = Object.values(this.users);

    this.sendMassage("allUsers", users, users);
    // ROOMS
    this.sendMassage("allRooms", Object.values(this.users), this.sortedRooms());
  };
  // ---------------------------------------------------------------------------------------------//
  // DISCONNECTED USER
  userDisconnect = (socket: Socket) => {
    socket.on("disconnect", async () => {
      const uid = this.getUidFromSocketID(socket.id);
      if (uid) {
        const leftedUser = this.users[uid];
        const users = Object.values(this.users);
        this.sendMassage("user_disconnected", users, leftedUser);

        const roomName = this.rooms[socket.id];

        // IF IN ROOM
        if (roomName) {
          const otherClient = this.io.sockets.adapter.rooms.get(roomName);

          // IF ANOTHER PERSON IS IN ROOM
          if (otherClient) {
            const num = Object.entries(this.gameRoomConfirmStart).reduce(
              (total, [client, _roomName]) => {
                if (_roomName === roomName) {
                  return total + 1;
                }
                return total;
              },
              0
            );
            // DISCONNECTED FROM GAME
            if (num === 2) {
              this.io.to(Array.from(otherClient)).emit("heLeft_yourWin");
              this.gameEndInRoom(roomName);
            }
            // DISCONNECTED FROM ROOM
          } else {
            delete this.usersGameConfig[roomName];
            this.leaveRoomHandle(socket, roomName);
          }
        }

        delete this.users[uid];
        delete this.userPickHero[socket.id];
        delete this.clientNames[socket.id];
        delete this.rooms[socket.id];
        delete this.gameRoomConfirmStart[socket.id];
        this.sendMassage("allRooms", users, this.sortedRooms());
      }
    });
  };
  // ---------------------------------------------------------------------------------------------//
  getUidFromSocketID = (id: string) => {
    return Object.keys(this.users).find((uid) => this.users[uid] === id);
  };

  sendMassage = (name: string, users: string[], payload?: object | string) => {
    // console.log(`Emmiting event: ${name} to ${users}`);
    users.forEach((id) =>
      payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)
    );
  };

  // make array of object of roonName (usebale data for client)
  sortedRooms = () => {
    const results = Object.entries(this.rooms).reduce(
      (t: { roomName: string; members: string[] }[], [k, v]) => {
        const alreadyExistedRoom = t.some((total) => total.roomName === v);
        if (!alreadyExistedRoom) {
          return [...t, { roomName: v, members: [k] }];
        }
        if (alreadyExistedRoom) {
          return t.map((total) => {
            return total.roomName === v
              ? { ...total, members: [...total.members, k] }
              : total;
          });
        }
        return [];
      },
      []
    );
    return results;
  };
}
