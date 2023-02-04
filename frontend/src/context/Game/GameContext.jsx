import { useContext, useState } from "react";
import { createContext } from "react";

export const GameContext = createContext({
  myHero: "kenji",
  setMyHero: () => null,
  amIReady: false,
  setAmIReady: () => null,
});

export const GameProvider = ({ children }) => {
  const [myHero, setMyHero] = useState("kenji");
  const [amIReady, setAmIReady] = useState(false);
  const value = { myHero, setMyHero, amIReady, setAmIReady };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
