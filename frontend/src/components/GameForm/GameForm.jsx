import { useRef, useContext, useState, useEffect } from "react";
import { kenjiForm, mackForm } from "../../utils/game/instance";
import { SocketContext } from "../../context/Socket/socketContext";
import { GameContext } from "../../context/Game/GameContext";
import {
  ModalContext,
  modalActionPayload,
  modalActionType,
} from "../../context/Modal/ModalContext";

import './GameForm.css'
const GameForm = () => {
  const canvasRef = useRef(null);
  const animationID = useRef(null);
  const { socket, amIReady } = useContext(SocketContext).socketState;
  const { room } = useContext(SocketContext).socketState;

  const { myHero, setMyHero } = useContext(GameContext);
  const { modalDispatch } = useContext(ModalContext);
  // const [selectedHiro, setSelectedHiro] = useState("kenji");
  const [time, setTime] = useState("30");

  useEffect(() => {
    const width = (canvasRef.current.width = 100);
    const height = (canvasRef.current.height = 170);
    canvasRef.current.style.margin = "auto";
    const c = canvasRef.current.getContext("2d");
    c.fillStyle = "rgb(31, 31, 31)";
    c.fillRect(0, 0, width, height);
    const hero = myHero;
    if (!hero) return;

    cancelAnimationFrame(animationID.current);
    function animation() {
      animationID.current = requestAnimationFrame(animation);

      c.fillStyle = "rgb(31, 31, 31)";
      c.fillRect(0, 0, width, height);

      if (hero === "mack") {
        mackForm.updateFrames(c);
      }
      if (hero === "kenji") {
        kenjiForm.updateFrames(c);
      }
    }

    animation();
    return () => cancelAnimationFrame(animationID.current);
  }, [myHero]);

  function changeHeroHandle(e) {
    setMyHero(e.target.value);
  }
  function changeTimeHandle(e) {
    setTime(e.target.value);
  }
  const btnClassName =
    "game-form__button " + (amIReady ? "btn--ready" : "btn--notready");

  function submitHandle(e) {
    e.preventDefault();
    if (amIReady) {
      if (room.allClients.length === 2) {
        modalDispatch({
          type: modalActionType.content,
          payload: {
            content: <div>منتظر هم اتاقی خود باشید</div>,
            style: modalActionPayload.style.error,
          },
        });
      }
      if (room.allClients.length === 1) {
        modalDispatch({
          type: modalActionType.content,
          payload: {
            content: <div>شما برای بازی به یک هم اتاقی نیاز دارید</div>,
            style: modalActionPayload.style.error,
          },
        });
      }

      return;
    }
    socket.emit("gameStart_toServer", {
      playerName: "",
      hero: myHero,
      time,
    });
  }
  return (
    <div className="game-form">
      <form className="game-form__form" onSubmit={submitHandle}>
        <canvas className="game-form__canvas" ref={canvasRef} />
        <div className="hero-pick">
          <div className="hero-pick__group">
            <input
              type="radio"
              id="mack"
              name="hero"
              value="mack"
              className="hero-pick__input"
              onChange={changeHeroHandle}
            />
            <label
              htmlFor="mack"
              className="hero-pick__label"
              style={{ color: `${myHero === "mack" ? "red" : "white"}` }}
            >
              mack
            </label>
          </div>
          <div className="hero-pick__group">
            <input
              type="radio"
              id="kenji"
              name="hero"
              value="kenji"
              className="hero-pick__input"
              onChange={changeHeroHandle}
            />
            <label
              htmlFor="kenji"
              className="hero-pick__label"
              style={{ color: `${myHero === "kenji" ? "red" : "white"}` }}
            >
              kenji
            </label>
          </div>
        </div>
        <div className="set-time">
          <p className="set-time__title">Time</p>
          <div className="set-time__group">
            <label
              className="set-time__label"
              htmlFor="60"
              style={{ color: `${time === "60" ? "red" : "white"}` }}
            >
              60
            </label>
            <input
              className="set-time__input"
              id="60"
              name="time"
              type="radio"
              value={"60"}
              onChange={changeTimeHandle}
            />
            <label
              className="set-time__label"
              htmlFor="30"
              style={{ color: `${time === "30" ? "red" : "white"}` }}
            >
              30
            </label>
            <input
              className="set-time__input"
              id="30"
              name="time"
              type="radio"
              value={"30"}
              onChange={changeTimeHandle}
            />
            <label
              className="set-time__label"
              htmlFor="15"
              style={{ color: `${time === "15" ? "red" : "white"}` }}
            >
              15
            </label>
            <input
              className="set-time__input"
              id="15"
              name="time"
              type="radio"
              value={"15"}
              onChange={changeTimeHandle}
            />
          </div>
        </div>
        <button className={btnClassName} type="submit">
          {amIReady ? "ready" : "notReady"}
        </button>
      </form>
    </div>
  );
};

export default GameForm;
