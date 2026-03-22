import { describe, it, expect } from 'vitest';

/**
 * Countdown banner logic tests.
 * Tournament starts March 19, 2026. 20 days total.
 * Banner shows "Day X of 20" during tournament, "over" message after, hidden before.
 */

const TOURNAMENT_START = '2026-03-19';
const TOURNAMENT_DAYS = 20;

function getCountdownState(today: string): { visible: boolean; dayNumber: number; isOver: boolean } {
  const dayNumber = Math.floor(
    (new Date(today).getTime() - new Date(TOURNAMENT_START).getTime()) / 86400000
  ) + 1;

  if (dayNumber > TOURNAMENT_DAYS) {
    return { visible: true, dayNumber, isOver: true };
  }
  if (dayNumber < 1) {
    return { visible: false, dayNumber, isOver: false };
  }
  return { visible: true, dayNumber, isOver: false };
}

describe('countdown banner', () => {
  it('shows Day 1 on tournament start date', () => {
    const state = getCountdownState('2026-03-19');
    expect(state.visible).toBe(true);
    expect(state.dayNumber).toBe(1);
    expect(state.isOver).toBe(false);
  });

  it('shows Day 4 on March 22', () => {
    const state = getCountdownState('2026-03-22');
    expect(state.visible).toBe(true);
    expect(state.dayNumber).toBe(4);
    expect(state.isOver).toBe(false);
  });

  it('shows Day 20 on the last day (April 7)', () => {
    const state = getCountdownState('2026-04-07');
    expect(state.visible).toBe(true);
    expect(state.dayNumber).toBe(20);
    expect(state.isOver).toBe(false);
  });

  it('shows "over" message after tournament ends', () => {
    const state = getCountdownState('2026-04-08');
    expect(state.visible).toBe(true);
    expect(state.isOver).toBe(true);
  });

  it('hidden before tournament starts', () => {
    const state = getCountdownState('2026-03-18');
    expect(state.visible).toBe(false);
  });

  it('hidden well before tournament', () => {
    const state = getCountdownState('2026-01-01');
    expect(state.visible).toBe(false);
  });
});
