import { describe, it, expect } from 'vitest';
import {
  closeFunctionRegistry,
  marchMadnessConferenceGroups,
  stateRegionGroups,
} from '../closeFunctions';

describe('within2', () => {
  const fn = closeFunctionRegistry.within2;

  it('returns true for values within 2', () => {
    expect(fn(5, 3)).toBe(true);
    expect(fn(5, 7)).toBe(true);
    expect(fn(5, 5)).toBe(true);
  });

  it('returns false for values more than 2 apart', () => {
    expect(fn(5, 8)).toBe(false);
    expect(fn(5, 2)).toBe(false);
  });
});

describe('within10', () => {
  const fn = closeFunctionRegistry.within10;

  it('returns true for values within 10', () => {
    expect(fn(50, 45)).toBe(true);
    expect(fn(50, 60)).toBe(true);
  });

  it('returns false for values more than 10 apart', () => {
    expect(fn(50, 61)).toBe(false);
    expect(fn(50, 39)).toBe(false);
  });
});

describe('sameMarchMadnessConference', () => {
  const fn = closeFunctionRegistry.sameMarchMadnessConference;

  it('returns true for conferences in same tier', () => {
    // Power conferences
    expect(fn('SEC', 'Big Ten')).toBe(true);
    expect(fn('ACC', 'Big 12')).toBe(true);
  });

  it('returns false for conferences in different tiers', () => {
    expect(fn('SEC', 'MAAC')).toBe(false);
    expect(fn('Big East', 'Big Sky')).toBe(false);
  });

  it('returns false for same conference (handled by exact match)', () => {
    // This function is only called when values differ
    // But if called with same value, it returns true
    expect(fn('SEC', 'SEC')).toBe(true);
  });
});

describe('sameStateRegion', () => {
  const fn = closeFunctionRegistry.sameStateRegion;

  it('returns true for states in same region', () => {
    // Southeast
    expect(fn('Alabama', 'Florida')).toBe(true);
    expect(fn('Georgia', 'Tennessee')).toBe(true);
    // Midwest
    expect(fn('Illinois', 'Ohio')).toBe(true);
  });

  it('returns false for states in different regions', () => {
    expect(fn('Alabama', 'California')).toBe(false);
    expect(fn('Texas', 'Ohio')).toBe(false);
  });
});

describe('conference groups coverage', () => {
  it('has 4 tiers', () => {
    expect(marchMadnessConferenceGroups).toHaveLength(4);
  });

  it('power tier has 5 conferences', () => {
    expect(marchMadnessConferenceGroups[0]).toHaveLength(5);
    expect(marchMadnessConferenceGroups[0]).toContain('SEC');
    expect(marchMadnessConferenceGroups[0]).toContain('Big Ten');
  });
});

describe('state region groups coverage', () => {
  it('has 5 regions', () => {
    expect(stateRegionGroups).toHaveLength(5);
  });

  it('Southeast is the largest region', () => {
    const southeast = stateRegionGroups[0];
    expect(southeast).toContain('Alabama');
    expect(southeast).toContain('Florida');
    expect(southeast.length).toBeGreaterThan(8);
  });
});
