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
export const delayActionsFactory = (cb, delay = 600) => {
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
        return "mack";
    if (playerOne.health < playerTwo.health)
        return "kenji";
    return "tie";
}
