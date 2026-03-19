import { Entity, DbEntity } from './Entity';

export type Match = 'exact' | 'close' | 'incorrect';
export type Direction = 'higher' | 'lower' | null;

export interface AttributeComparison {
  attribute: string;
  match: Match;
  direction: Direction;
  targetValue: string | number;
  guessedValue: string | number;
}

export interface Guess {
  entity: Entity;
  comparison: AttributeComparison[];
}

// Database version of Guess (how it's stored in Supabase)
export interface DbGuess {
  entity: DbEntity;
  comparison: AttributeComparison[];
}