function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}
export {};
