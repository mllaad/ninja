import { Sprite, Fighter } from "./classes";
import backgroundUrl from "./../../assets/game/background.png";
import shopUrl from "./../../assets/game/shop.png";

import samuraiMackIdle from "./../../assets/game/samuraiMack/Idle.png";
import samuraiMackRun from "./../../assets/game/samuraiMack/Run.png";

import samuraiMackFall from "./../../assets/game/samuraiMack/Fall.png";
import samuraiMackAttack1 from "./../../assets/game/samuraiMack/Attack1.png";
import samuraiMackTakeHit from "./../../assets/game/samuraiMack/Take Hit - white silhouette.png";
import samuraiMackDeath from "./../../assets/game/samuraiMack/Death.png";

import kengiIdle from "./../../assets/game/kenji/Idle.png";
import kengiRun from "./../../assets/game/kenji/Run.png";

import kengiFall from "./../../assets/game/kenji/Fall.png";
import kengiAttack1 from "./../../assets/game/kenji/Attack1.png";
import kengiTakeHit from "./../../assets/game/kenji/Take hit.png";
import kengiDeath from "./../../assets/game/kenji/Death.png";

import kengijump from "./../../assets/game/kenji/Jump.png";
import samuraiMackjump from "./../../assets/game/samuraiMack/Jump.png";
// export const background = new Sprite({
//   position: {
//     x: 0,
//     y: 0,
//   },
//   imageSrc: backgroundUrl,
// });
// export const shop = new Sprite({
//   position: {
//     x: 600,
//     y: 134,
//   },
//   scale: 2.7,
//   imageSrc: shopUrl,
//   framesMax: 6,
//   framesHold: 7,
// });

export const createHeros = () => {
  return {
    background: new Sprite({
      position: {
        x: 0,
        y: 0,
      },
      imageSrc: backgroundUrl,
    }),
    shop: new Sprite({
      position: {
        x: 600,
        y: 134,
      },
      scale: 2.7,
      imageSrc: shopUrl,
      framesMax: 6,
      framesHold: 7,
    }),
    kenji: new Fighter({
      position: {
        x: 400,
        y: 330,
      },
      velocity: {
        x: 0,
        y: 10,
      },
      framesHold: 10,
      color: "blue",
      imageSrc: kengiIdle,
      framesMax: 4,
      scale: 2.5,
      offset: {
        x: 215,
        y: 170,
      },
      sprites: {
        idle: {
          imageSrc: kengiIdle,
          framesMax: 4,
          image: new Image(),
        },
        run: {
          imageSrc: kengiRun,
          framesMax: 8,
          image: new Image(),
        },
        jump: {
          imageSrc: kengijump,
          framesMax: 2,
          image: new Image(),
        },
        fall: {
          imageSrc: kengiFall,
          framesMax: 2,
          image: new Image(),
        },
        attack1: {
          imageSrc: kengiAttack1,
          framesMax: 4,
          image: new Image(),
        },
        takeHit: {
          imageSrc: kengiTakeHit,
          framesMax: 3,
          image: new Image(),
        },
        death: {
          imageSrc: kengiDeath,
          framesMax: 7,
          image: new Image(),
        },
      },
      attackBox: {
        offset: {
          x: -170,
          y: 50,
        },
        width: 170,
        height: 50,
      },
    }),
    mack: new Fighter({
      position: {
        x: 0,
        y: 330,
      },
      velocity: {
        x: 0,
        y: 0,
      },
      framesHold: 6,
      imageSrc: samuraiMackIdle,
      framesMax: 8,
      scale: 2.5,
      offset: {
        x: 215,
        y: 157,
      },
      sprites: {
        idle: {
          imageSrc: samuraiMackIdle,
          framesMax: 8,
          image: new Image(),
        },
        run: {
          imageSrc: samuraiMackRun,
          framesMax: 8,
          image: new Image(),
        },
        jump: {
          imageSrc: samuraiMackjump,
          framesMax: 2,
          image: new Image(),
        },
        fall: {
          imageSrc: samuraiMackFall,
          framesMax: 2,
          image: new Image(),
        },
        attack1: {
          imageSrc: samuraiMackAttack1,
          framesMax: 6,
          image: new Image(),
        },
        takeHit: {
          imageSrc: samuraiMackTakeHit,
          framesMax: 4,
          image: new Image(),
        },
        death: {
          imageSrc: samuraiMackDeath,
          framesMax: 6,
          image: new Image(),
        },
      },
      attackBox: {
        offset: {
          x: 60,
          y: 50,
        },
        width: 195,
        height: 50,
      },
    }),
  };
};

//------------------------  FORM INSTANCES -----------------------------

export const mackForm = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  framesHold: 5,
  imageSrc: samuraiMackIdle,
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 200,
    y: 170,
  },
});

export const kenjiForm = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  framesHold: 6,
  imageSrc: kengiIdle,
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 200,
    y: 170,
  },
});
