import { useEffect, useRef, useContext } from "react";
import { createHeros } from "../../utils/game/instance";
import "./Game.css";
import { Howl, Howler } from "howler";
import bgSong from "../../assets/sounds/Prince_of_Persia.mp3";
import {
  SocketContext,
  socketActionType,
} from "../../context/Socket/socketContext";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineArrowUp,
} from "react-icons/ai";
import { GiFragmentedSword } from "react-icons/gi";

import { GameContext } from "../../context/Game/GameContext";

const Game = () => {
  const { socket } = useContext(SocketContext).socketState;

  const song = new Howl({
    src: [bgSong],
    loop: true,
    volume: 0.05,
  });

  const { socketDispatch } = useContext(SocketContext);
  const { myHero } = useContext(GameContext);
  const canvasRef = useRef(null);
  const playerOneHealthRef = useRef(null);
  const playerTwoHealthRef = useRef(null);
  const timerRef = useRef(null);
  const displayTextRef = useRef(null);

  //  reset thair lifes

  let c, width, height;
  useEffect(() => {
    let myWidth = document.body.offsetWidth;
    // if ( screen.availHeight > screen.availWidth) {
    //   myWidth = document.body.offsetHeight;
    // }
    const present = document.body.offsetWidth < 900 ? 95 / 100 : 70 / 100;
    const widthBrowser = myWidth * present;
    const widthCanvasStatic = 1024;
    const scale = widthBrowser / widthCanvasStatic;
    c = canvasRef.current.getContext("2d");

    width = canvasRef.current.width = widthCanvasStatic * scale;
    height = canvasRef.current.height = 579 * scale;

    // INIT CANVAS
    c.fillRect(0, 0, width, height);

    if (!socket) return;
    let gameID;
    song.play();
    const { kenji, mack, background, shop } = createHeros();

    socket.on("game", ({ playersState, timer, result }) => {
      console.log(playersState.kenji.health);
      console.log(playersState.mack.health);
      cancelAnimationFrame(gameID);
      function animate() {
        gameID = requestAnimationFrame(animate);
        if (c == null) return;
        if (timerRef.current) {
          timerRef.current.innerText = timer;
        }
        // INIT GAME WORLD
        c.fillStyle = "black";
        c.fillRect(0, 0, width, height);
        background.updateFrames(c, scale);
        shop.updateFrames(c, scale);
        // INIT CHARECTORS
        c.fillStyle = "rgba(255,255,255, 0.15)";
        c.fillRect(0, 0, width, height);

        // UPDATE FRAMES
        mack.updateFrames(c, scale);
        kenji.updateFrames(c, scale);

        // UPDATE HEALTHS'
        if (playerOneHealthRef.current) {
          if (playersState.mack.health <= 0) {
            playerOneHealthRef.current.style.width = 0;
          }
          playerOneHealthRef.current.style.width = `${playersState.mack.health}%`;
        }
        if (playerTwoHealthRef.current) {
          if (playersState.kenji.health <= 0) {
            playerTwoHealthRef.current.style.width = 0;
          }
          playerTwoHealthRef.current.style.width = `${playersState.kenji.health}%`;
        }

        // UPDATE ACTIONS AND MOVEMENTS
        mack.updateActions({
          position: playersState.mack.position,
          imageName: playersState.mack.imageName,
          death: playersState.mack.death,
        });
        kenji.updateActions({
          position: playersState.kenji.position,
          imageName: playersState.kenji.imageName,
          death: playersState.mack.death,
        });

        //  RESULT OF GAME
        if (result) {
          song.stop();
          displayTextRef.current.style.display = "block";
          displayTextRef.current.style.fontSize = "1rem";
          if (result === "tie") {
            displayTextRef.current.textContent = "Tie!";
            return;
          }
          if (result === myHero) {
            displayTextRef.current.textContent = "You Win!";
          } else {
            displayTextRef.current.textContent = "You Lose!";
          }
        }
      }
      animate();
    });
    // TERMINATE THE GAME COMPONENT
    socket.on("gameOver", (w) => {
      song.stop();
      cancelAnimationFrame(gameID);
      socketDispatch({
        type: socketActionType.gameEnd,
      });
      socketDispatch({
        type: socketActionType.myRoom,
        payload: null,
      });
      socketDispatch({
        type: socketActionType.amIReady,
        payload: null,
      });
      socket.off("game");
    });
    socket.on("heLeft_yourWin", () => {
      song.stop();
      if (displayTextRef.current) {
        displayTextRef.current.style.display = "block";
        displayTextRef.current.style.fontSize = "10px";
        displayTextRef.current.textContent = "Opponent Left The Game You Win!";
      }
      setTimeout(() => {
        cancelAnimationFrame(gameID);
        socketDispatch({
          type: socketActionType.gameEnd,
        });
        socketDispatch({
          type: socketActionType.myRoom,
          payload: null,
        });
      }, 3000);
      socketDispatch({
        type: socketActionType.amIReady,
        payload: null,
      });
      socket.off("game");
    });
    window.addEventListener("keydown", (e) => {
      if (!mack.death) {
        switch (e.key) {
          case "D":
            socket.emit("keyDown", "d");
            break;
          case "d":
            socket.emit("keyDown", "d");
            break;
          case "A":
            socket.emit("keyDown", "a");
            break;
          case "a":
            socket.emit("keyDown", "a");
            break;
          case "W":
            socket.emit("keyDown", "w");
            break;
          case "w":
            socket.emit("keyDown", "w");
            break;
          case " ":
            socket.emit("keyDown", "space");
            break;
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "D":
          socket.emit("keyUp", "d");
          break;
        case "d":
          socket.emit("keyUp", "d");
          break;
        case "A":
          socket.emit("keyUp", "a");
          break;
        case "a":
          socket.emit("keyUp", "a");
          break;
      }
    });
  }, [socket]);

  function keyDownHandle(e) {
    switch (e.target.id) {
      case "up":
        socket.emit("keyDown", "w");
        break;
      case "left":
        socket.emit("keyDown", "a");
        break;
      case "hit":
        socket.emit("keyDown", "space");
        break;
      case "right":
        socket.emit("keyDown", "d");
        break;
    }
  }
  function touchCancleHandle(e) {
    switch (e.target.id) {
      case "right":
        socket.emit("keyUp", "d");
        break;
      case "left":
        socket.emit("keyUp", "a");
        break;
    }
  }
  return (
    <div className="wrraper">
      <div className="touchpad">
        <div className="touchpad__row1">
          <span
            id="up"
            onTouchStart={keyDownHandle}
            onTouchEnd={touchCancleHandle}
          >
            <AiOutlineArrowUp
              style={{
                pointerEvents: "none",
              }}
            />
          </span>
        </div>
        <div className="touchpad__row2">
          <span
            id="left"
            onTouchStart={keyDownHandle}
            onTouchEnd={touchCancleHandle}
          >
            {" "}
            <AiOutlineArrowLeft
              style={{
                pointerEvents: "none",
              }}
            />
          </span>
          <span
            id="hit"
            onTouchStart={keyDownHandle}
            onTouchEnd={touchCancleHandle}
          >
            {" "}
            <GiFragmentedSword
              style={{
                pointerEvents: "none",
              }}
            />
          </span>
          <span
            id="right"
            onTouchStart={keyDownHandle}
            onTouchEnd={touchCancleHandle}
          >
            {" "}
            <AiOutlineArrowRight
              style={{
                pointerEvents: "none",
              }}
            />
          </span>
        </div>
      </div>
      <div className="container">
        <div className="lower-container">
          <div className="healthbar-one">
            <div className="healthbar-one__background" />
            <div className="healthbar-one__health" ref={playerOneHealthRef} />
          </div>
          <div className="timer" ref={timerRef} />
          <div className="healthbar-two">
            <div className="healthbar-two__background" />
            <div className="healthbar-two__health" ref={playerTwoHealthRef} />
          </div>
        </div>
        <div className="displayText" ref={displayTextRef} />
        <canvas ref={canvasRef} className="game__canvas"></canvas>
      </div>
    </div>
  );
};

export default Game;
