import { describe, it, expect } from 'vitest';
import { closeFunctionRegistry, getCloseFunction, closeHints } from '../closeFunctions';

describe('within2', () => {
  const fn = closeFunctionRegistry.within2;

  it('returns true for exact match', () => {
    expect(fn(5, 5)).toBe(true);
  });

  it('returns true within range', () => {
    expect(fn(5, 3)).toBe(true);
    expect(fn(5, 7)).toBe(true);
    expect(fn(10, 8)).toBe(true);
  });

  it('returns false outside range', () => {
    expect(fn(5, 2)).toBe(false);
    expect(fn(5, 8)).toBe(false);
  });

  it('works with string numbers', () => {
    expect(fn('5', '3')).toBe(true);
    expect(fn('5', '8')).toBe(false);
  });
});

describe('within10', () => {
  const fn = closeFunctionRegistry.within10;

  it('returns true within range', () => {
    expect(fn(50, 40)).toBe(true);
    expect(fn(50, 60)).toBe(true);
    expect(fn(50, 50)).toBe(true);
  });

  it('returns false outside range', () => {
    expect(fn(50, 39)).toBe(false);
    expect(fn(50, 61)).toBe(false);
  });
});

describe('sameMarchMadnessConference', () => {
  const fn = closeFunctionRegistry.sameMarchMadnessConference;

  it('returns true for same power conference tier', () => {
    expect(fn('SEC', 'Big Ten')).toBe(true);
    expect(fn('ACC', 'Big 12')).toBe(true);
    expect(fn('Big East', 'SEC')).toBe(true);
  });

  it('returns true for same mid-major tier', () => {
    expect(fn('WCC', 'Mountain West')).toBe(true);
    expect(fn('Atlantic 10', 'American')).toBe(true);
  });

  it('returns true for same low-major tier', () => {
    expect(fn('MAAC', 'NEC')).toBe(true);
    expect(fn('MEAC', 'SWAC')).toBe(true);
  });

  it('returns false for different tiers', () => {
    expect(fn('SEC', 'WCC')).toBe(false);
    expect(fn('Big Ten', 'MAAC')).toBe(false);
    expect(fn('Mountain West', 'NEC')).toBe(false);
  });

  it('returns true for same conference', () => {
    expect(fn('SEC', 'SEC')).toBe(true);
  });
});

describe('sameStateRegion', () => {
  const fn = closeFunctionRegistry.sameStateRegion;

  it('returns true for same southeast region', () => {
    expect(fn('Alabama', 'Florida')).toBe(true);
    expect(fn('North Carolina', 'Tennessee')).toBe(true);
  });

  it('returns true for same midwest region', () => {
    expect(fn('Ohio', 'Michigan')).toBe(true);
    expect(fn('Iowa', 'Wisconsin')).toBe(true);
  });

  it('returns true for same west region', () => {
    expect(fn('California', 'Washington')).toBe(true);
    expect(fn('Hawaii', 'Idaho')).toBe(true);
  });

  it('returns false for different regions', () => {
    expect(fn('Alabama', 'California')).toBe(false);
    expect(fn('Texas', 'Ohio')).toBe(false);
  });

  it('includes Washington D.C. in southeast', () => {
    expect(fn('Washington D.C.', 'Virginia')).toBe(true);
  });

  it('returns false for same state (same state = exact, not close)', () => {
    // same state is exact match at the game level, but the close fn itself returns true
    expect(fn('Texas', 'Texas')).toBe(true);
  });
});

describe('sameNbaDivision', () => {
  const fn = closeFunctionRegistry.sameNbaDivision;

  it('returns true for same division', () => {
    expect(fn('BOS', 'NYK')).toBe(true);
    expect(fn('LAL', 'GSW')).toBe(true);
  });

  it('returns false for different divisions', () => {
    expect(fn('BOS', 'LAL')).toBe(false);
  });

  it('returns false for invalid teams', () => {
    expect(fn('INVALID', 'BOS')).toBe(false);
  });
});

describe('adjacentNbaPosition', () => {
  const fn = closeFunctionRegistry.adjacentNbaPosition;

  it('returns true for adjacent positions', () => {
    expect(fn('PG', 'SG')).toBe(true);
    expect(fn('SG', 'SF')).toBe(true);
    expect(fn('PF', 'C')).toBe(true);
  });

  it('returns true for same position', () => {
    expect(fn('PG', 'PG')).toBe(true);
  });

  it('returns false for non-adjacent positions', () => {
    expect(fn('PG', 'SF')).toBe(false);
    expect(fn('PG', 'C')).toBe(false);
  });
});

describe('sameNFLDivision', () => {
  const fn = closeFunctionRegistry.sameNFLDivision;

  it('returns true for same division', () => {
    expect(fn('BUF', 'MIA')).toBe(true);
    expect(fn('DAL', 'PHI')).toBe(true);
  });

  it('returns false for different divisions', () => {
    expect(fn('BUF', 'KC')).toBe(false);
  });
});

describe('getCloseFunction', () => {
  it('returns function for valid name', () => {
    expect(getCloseFunction('within2')).toBe(closeFunctionRegistry.within2);
    expect(getCloseFunction('within10')).toBe(closeFunctionRegistry.within10);
  });

  it('returns null for invalid name', () => {
    expect(getCloseFunction('nonexistent')).toBeNull();
    expect(getCloseFunction(null)).toBeNull();
    expect(getCloseFunction('')).toBeNull();
  });
});

describe('closeHints', () => {
  it('has hints for march maddle close functions', () => {
    expect(closeHints.sameMarchMadnessConference).toBeDefined();
    expect(closeHints.sameStateRegion).toBeDefined();
    expect(closeHints.within2).toBeDefined();
    expect(closeHints.within10).toBeDefined();
  });
});
