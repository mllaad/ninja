import { useContext, useState, useRef, useEffect } from "react";
import { MdOutlineDoubleArrow } from "react-icons/md";
import { SocketContext } from "../../context/Socket/socketContext";
import { messageBoxType } from "../../context/Socket/SocketContextProvider";
import "./Chat.css";
//  ---------------------------------------- CHAT  ------------------------------------------
export const Messages = () => {
  const { messages } = useContext(SocketContext).socketState;

  return (
    <div className="chat__messages">
      <ul className="messages ">
        {messages.map((message, k) => {
          let notice = "";
          let classNameDiv = "";
          switch (message.type) {
            case messageBoxType.iJoinedToRoom:
              notice = "you Joined! ";
              classNameDiv = "notice";
              break;
            case messageBoxType.roomMate_JoinedToRoom:
              notice = `${message.client[0] || ""} Joined!`;
              classNameDiv = "box--notice";
              break;
            case messageBoxType.roomMate_LeftTheRoom:
              notice = `${message.client[0]} left room!`;
              classNameDiv = "box--notice";
              break;
            case messageBoxType.my_Massage:
              classNameDiv = "box--right";
              break;
            case messageBoxType.roomMate_message:
              classNameDiv = "box--left";
              break;
            default:
              break;
          }
          return (
            <li key={k} className="message ">
              {notice ? (
                <div className="message__notice">
                  <span>{notice}</span>
                  <span className="message__time time--center">
                    {message.time}
                  </span>
                </div>
              ) : (
                <div className={"message__box " + classNameDiv}>
                  {message.text}
                  <span className="message__time time--underbox">
                    {message.time}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ----------------------------------- SLIDER -------------------------------------------
export const SliderIcon = ({ chatComponent }) => {
  const { messages } = useContext(SocketContext).socketState;

  const iconRef = useRef(null);
  const notificationMessage = useRef("");

  // IS SLIDER VISIVBLE OR NO
  const [isShowSlider, setIsShowSlider] = useState(false);

  // NUM OF UNSEEN MESSESAGES
  const [notificationNum, setNotificationNum] = useState(0);

  // MESSAGE ON TIMER
  const [notificationIsShow, setNotificationIsShow] = useState({});
  const notificationTimer = (text, time) => {
    setNotificationIsShow({ show: true, text });
    setTimeout(() => {
      setNotificationIsShow({ show: false });
    }, time);
  };

  useEffect(() => {
    const type = messages[messages.length - 1].type;
    if (type === "iJoinedToRoom") return;
    if (isShowSlider) return;
    switch (type) {
      case "roomMate_JoinedToRoom":
        setNotificationNum((notification) => notification + 1);
        notificationMessage.current = "RoomMate Joined!";
        notificationTimer("RoomMate Joined!", 1000);
        break;
      case "roomMate_message":
        setNotificationNum((notification) => notification + 1);
        notificationMessage.current = "You have Message!";
        notificationTimer("You have Message!", 1000);
        break;
      case "roomMate_LeftTheRoom":
        setNotificationNum((notification) => notification + 1);
        notificationMessage.current = "RoomMate Left!";
        notificationTimer("RoomMate Left!", 1000);
        break;
    }
  }, [messages]);

  function clickHandle() {
    setNotificationNum(0);
    setIsShowSlider((show) => !show);
    chatComponent.current.classList.toggle("chat--show");
    iconRef.current.classList.toggle("icon--rotate");
  }

  return (
    <div className="slider" onClick={clickHandle}>
      {!isShowSlider ? <span className="slider__span">Chat Room</span> : ""}
      {/* IF IS NOTIFICATION  */}
      {notificationIsShow.show ? (
        <div className="slider__notification">{notificationIsShow.text}</div>
      ) : (
        ""
      )}
      {notificationNum ? (
        <span
          className="slider__notification-num"
          title={notificationMessage.current}
        >
          {notificationNum}
        </span>
      ) : (
        ""
      )}
      <div ref={iconRef} className={"icon"}>
        <MdOutlineDoubleArrow className="slider__icon" />
      </div>
    </div>
  );
};
