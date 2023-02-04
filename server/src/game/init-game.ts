import { Fighter, Timer } from "./classes.js";
import { determineWinner, rectangularCollision } from "./utils.js";
export function initCharacters({
  namePlayer,
  time,
}: {
  namePlayer: string;
  time: number;
}) {
  return {
    mack: new Fighter({
      position: {
        x: 400,
        y: 0,
      },
      takeDamage: 35,
      velocity: {
        x: 0,
        y: 0,
      },
      speed: 5,
      scale: 2.5,
      offset: {
        x: 200,
        y: 157,
      },
      attackBox: {
        position: {
          x: 0,
          y: 0,
        },
        offset: {
          x: 20,
          y: 50,
        },
        width: 195,
        height: 50,
      },
    }),
    kenji: new Fighter({
      position: {
        x: 600,
        y: 100,
      },
      velocity: {
        x: 0,
        y: 10,
      },
      speed: 10,
      takeDamage: 35,
      scale: 2.5,
      offset: {
        x: 215,
        y: 170,
      },

      attackBox: {
        position: { x: 0, y: 0 },
        offset: {
          x: -170,
          y: 50,
        },
        width: 170,
        height: 50,
      },
    }),
    timer: time,
  };
}

// GAME LOOP
export function gameLoop({
  playerOne,
  playerTwo,
  timer,
}: {
  playerOne: Fighter;
  playerTwo: Fighter;
  timer: number;
}): "" | "tie" | "mack" | "kenji" | void {
  if (timer <= 0 || playerOne.health <= 0 || playerTwo.health <= 0) {
    // UPDATE PLAYERS
    playerOne.update();
    playerTwo.update();

    return determineWinner({
      playerOne: playerOne,
      playerTwo: playerTwo,
    });
  }

  // PLAYER ONE IS ATTACKING
  if (
    rectangularCollision({
      rectangle1: playerOne,
      rectangle2: playerTwo,
    }) &&
    playerOne.isAttacking &&
    playerOne.bladeComingOutFromSword
  ) {
    playerTwo.takeHit = true;
  }

  // PLAYER TWO IS ATTACKING
  if (
    rectangularCollision({
      rectangle1: playerOne,
      rectangle2: playerTwo,
    }) &&
    playerTwo.isAttacking &&
    playerTwo.bladeComingOutFromSword
  ) {
    playerOne.takeHit = true;
  }

  // UPDATE PLAYERS
  playerOne.update();
  playerTwo.update();
}
