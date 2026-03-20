import { Entity } from "./Entity";

export interface GameState {
    guessedEntityIds: number[];
    gameWon: boolean;
    gameOver: boolean;
    id: number;
    targetEntity: Entity;
    gridId: number;
}
