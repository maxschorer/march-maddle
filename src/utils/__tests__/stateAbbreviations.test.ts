import { describe, it, expect } from 'vitest';
import { abbreviateState } from '../stateAbbreviations';

describe('abbreviateState', () => {
  it('abbreviates all states used in the tournament', () => {
    expect(abbreviateState('North Carolina')).toBe('NC');
    expect(abbreviateState('Arizona')).toBe('AZ');
    expect(abbreviateState('Michigan')).toBe('MI');
    expect(abbreviateState('Florida')).toBe('FL');
    expect(abbreviateState('Texas')).toBe('TX');
    expect(abbreviateState('Connecticut')).toBe('CT');
    expect(abbreviateState('Iowa')).toBe('IA');
    expect(abbreviateState('Indiana')).toBe('IN');
    expect(abbreviateState('Washington')).toBe('WA');
    expect(abbreviateState('Virginia')).toBe('VA');
    expect(abbreviateState('Nebraska')).toBe('NE');
    expect(abbreviateState('Alabama')).toBe('AL');
    expect(abbreviateState('Kansas')).toBe('KS');
    expect(abbreviateState('Arkansas')).toBe('AR');
    expect(abbreviateState('Tennessee')).toBe('TN');
    expect(abbreviateState('New York')).toBe('NY');
    expect(abbreviateState('Wisconsin')).toBe('WI');
    expect(abbreviateState('Kentucky')).toBe('KY');
    expect(abbreviateState('California')).toBe('CA');
    expect(abbreviateState('Utah')).toBe('UT');
    expect(abbreviateState('South Carolina')).toBe('SC');
    expect(abbreviateState('Pennsylvania')).toBe('PA');
    expect(abbreviateState('Ohio')).toBe('OH');
    expect(abbreviateState('Georgia')).toBe('GA');
    expect(abbreviateState('Missouri')).toBe('MO');
    expect(abbreviateState('Louisiana')).toBe('LA');
    expect(abbreviateState('North Dakota')).toBe('ND');
    expect(abbreviateState('Hawaii')).toBe('HI');
    expect(abbreviateState('Idaho')).toBe('ID');
    expect(abbreviateState('Maryland')).toBe('MD');
  });

  it('handles Washington D.C.', () => {
    expect(abbreviateState('Washington D.C.')).toBe('DC');
  });

  it('returns input unchanged for unknown values', () => {
    expect(abbreviateState('Unknown')).toBe('Unknown');
    expect(abbreviateState('')).toBe('');
    expect(abbreviateState('Narnia')).toBe('Narnia');
  });

  it('is case-sensitive', () => {
    expect(abbreviateState('north carolina')).toBe('north carolina');
    expect(abbreviateState('TEXAS')).toBe('TEXAS');
  });
});
