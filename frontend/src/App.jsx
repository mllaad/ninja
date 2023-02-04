import { useContext, useEffect } from "react";
import { SocketContext } from "./context/Socket/socketContext";
import moreInfo1 from "./assets/moreinfo/moreinfo-1.png";
import moreInfo2 from "./assets/moreinfo/moreinfo-2.png";
import Lobby, { Room } from "./components/Lobby/Lobby";
import axios from "axios";
import Game from "./components/Game/Game";
import "./App.css";
import Modal from "./components/Modal/Modal";
import {
  ModalContext,
  modalActionType,
  modalActionPayload,
} from "./context/Modal/ModalContext";

function App() {
  const { room, gameState } = useContext(SocketContext).socketState;
  const { modalDispatch } = useContext(ModalContext);

  // CHECK CLIENT FROM WHAT REGION
  useEffect(() => {
    axios
      .get(
        "https://ipgeolocation.abstractapi.com/v1/?api_key=2812dc4a710c4ec8bf74fb65a8fe0c25"
      )
      .then((res) => {
        if (res.data.country_code !== "IR") {
          modalDispatch({
            type: modalActionType.content,
            payload: {
              content: (
                <div>
                  برای دسترسی بهتر به سورو لیارا فیلتر شکن خود را خاموش کنید
                </div>
              ),
              style: modalActionPayload.style.error,
            },
          });
        }
      });
  }, []);

  return (
    <div className="App">
      <div className="background-img" />
      <Header />
      <Modal />
      {/* <Game/> */}
      {gameState ? <Game /> : !room ? <Lobby /> : <Room />}
    </div>
  );
}

//  ------------------------- HEADER NAVS --------------------------------------------
const Header = () => {
  const { modalDispatch } = useContext(ModalContext);
  const { allUsers, rooms } = useContext(SocketContext).socketState;

  function gameInfoHandle() {
    modalDispatch({
      type: modalActionType.content,
      payload: {
        content: <MoreInfo />,
        style: modalActionPayload.style.move,
      },
    });
  }
  function aboutMeHandle() {
    modalDispatch({
      type: modalActionType.content,
      payload: {
        content: <AboutMe />,
        style: modalActionPayload.style.move,
      },
    });
  }
  return (
    <nav className="navbar">
      <ul className="navbar__list">
        <li className="navbar__link" onClick={gameInfoHandle}>
          Game Info
        </li>
        <li className="navbar__link" onClick={aboutMeHandle}>
          About Me
        </li>
      </ul>
      <div className="navbar__info">
        تعداد کاربران : {allUsers.length}{" "}
        <span>تعداد اتاق ها : {rooms.length}</span>
      </div>
    </nav>
  );
};

const MoreInfo = () => {
  return (
    <div className="moreinfo">
      <div className="moreinfo__title">بازی انلاین 2 نفره نینجا</div>
      <div className="moreinfo__subtitle">
        {" "}
        یک اتاق بساز و با هم اتاقیت بازی کن :)
      </div>
      <div className="moreinfo__description">
        <figure className="moreinfo__figure">
          <img className="moreinfo__image" src={moreInfo1} alt="moreinfo1" />
          <figcaption className="image__caption">
            در این صفحه میتونید تمام اتاق های موجود رو ببینید یا بسازید همینطور
            میتونیم اسم خودتون رو وارد کنید در غیر اینصورت اسم شما بطور پیش فرض
            ناشناس میباشد
          </figcaption>
        </figure>
        <figure className="moreinfo__figure">
          <img className="moreinfo__image" src={moreInfo2} alt="moreinfo1" />
          <figcaption className="image__caption">
            در این صفحه شما وارد اتاق شدید میتونید قهرمانتون رو انتخاب کنید و
            زمان بازی رو مشخص کنید ویا با هم اتاقی خود صحبت کن
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

const AboutMe = () => {
  return (
    <div>
      <div className="aboutme__title">
        <span>
          {" "}
          node, express, react, typescript, socketio, howler, vite :{" "}
        </span>
        تکنولوژی های بکار رفته شامل{" "}
      </div>{" "}
      اماده کردم
      <span> socketio, typescript, objective programming :</span> این بازی رو با
      هدف یاد گیری
    </div>
  );
};

export default App;
