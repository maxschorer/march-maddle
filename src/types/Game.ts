import { Entity } from "./Entity";
import { Guess } from "./Guess";

export interface GameState {
    guesses: Guess[];
    gameWon: boolean;
    gameOver: boolean;
    id: number;
    targetEntity: Entity;
    gridId: number;
}
