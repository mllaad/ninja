import { Fighter } from "./classes.js";
export function initCharacters() {
    return {
        playerOne: new Fighter({
            position: {
                x: 0,
                y: 0,
            },
            takeDamage: 10,
            velocity: {
                x: 0,
                y: 0,
            },
            speed: 10,
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
        playerTwo: new Fighter({
            position: {
                x: 400,
                y: 100,
            },
            velocity: {
                x: 0,
                y: 10,
            },
            speed: 20,
            takeDamage: 50,
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
    };
}
// GAME LOOP
export function gameLoop({ playerOne, playerTwo, timer, }) {
    // PLAYER ONE IS ATTACKING
    if (rectangularCollision({
        rectangle1: playerOne,
        rectangle2: playerTwo,
    }) &&
        playerOne.isAttacking &&
        playerOne.bladeComingOutFromSword) {
        playerTwo.takeHit = true;
    }
    // PLAYER TWO IS ATTACKING
    if (rectangularCollision({
        rectangle1: playerOne,
        rectangle2: playerTwo,
    }) &&
        playerTwo.isAttacking &&
        playerTwo.bladeComingOutFromSword) {
        playerOne.takeHit = true;
    }
    // UPDATE PLAYERS
    playerOne.update();
    playerTwo.update();
    if (timer <= 0 || playerOne.health <= 0 || playerTwo.health <= 0) {
        return determineWinner({
            playerOne: playerOne,
            playerTwo: playerTwo,
        });
    }
}
// ATTACKS
export function rectangularCollision({ rectangle1, rectangle2, }) {
    return (rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
        rectangle2.position.x &&
        rectangle1.attackBox.position.x <=
            rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
            rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height);
}
/// DELAY FOR ATTACING FUNCTION FACTORY
export const delayActionsFactory = (cb, delay = 1000) => {
    let allow = true; // IN START IS ALLOW TO ATTACK
    // ARG AS FIGHTER CLASS OBJECT
    return () => {
        // if (!arg) return;
        if (!allow)
            return;
        allow = false; // THIS GOES FALSE TILL SETTIMEOUT MAKE IT ALLOW AGAIN
        cb();
        setTimeout(() => {
            allow = true;
        }, delay);
    };
};
export function determineWinner({ playerOne, playerTwo, }) {
    if (playerOne.health > playerTwo.health)
        return "playerOne";
    if (playerOne.health < playerTwo.health)
        return "playerTwo";
    return "tie";
}
