export interface GameState {
    guessedEntityIds: number[];
    gameWon: boolean;
    gameOver: boolean;
    id: number;
    gridId: number;
}
