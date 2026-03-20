import { describe, it, expect } from 'vitest';
import { compareAttributes, formatNumber, formatMoney } from '../gameUtils';
import { Entity } from '../../types/Entity';
import { GridAttribute } from '../../types/Grid';

// Helper to build entities
function makeEntity(name: string, attrs: Record<string, string>): Entity {
  return {
    entity_id: 1,
    name,
    imgPath: '',
    attributes: Object.entries(attrs).map(([key, value]) => ({ key, value, img_path: null })),
  };
}

describe('compareAttributes', () => {
  const baseAttr: GridAttribute = {
    key: 'seed',
    displayName: 'Seed',
    displayType: 'number',
    hasDirection: true,
    closeFn: null,
    closeFnName: null,
  };

  it('returns exact match when values are equal', () => {
    const guess = makeEntity('Duke', { seed: '1' });
    const target = makeEntity('Arizona', { seed: '1' });
    const result = compareAttributes(guess, target, [baseAttr]);
    expect(result[0].match).toBe('exact');
    expect(result[0].direction).toBeNull();
  });

  it('returns incorrect with direction for different numbers', () => {
    const guess = makeEntity('Duke', { seed: '3' });
    const target = makeEntity('Arizona', { seed: '1' });
    const result = compareAttributes(guess, target, [baseAttr]);
    expect(result[0].match).toBe('incorrect');
    expect(result[0].direction).toBe('lower'); // target 1 < guessed 3
  });

  it('returns higher direction when target is larger', () => {
    const guess = makeEntity('Duke', { seed: '1' });
    const target = makeEntity('Arizona', { seed: '5' });
    const result = compareAttributes(guess, target, [baseAttr]);
    expect(result[0].direction).toBe('higher');
  });

  it('returns close match when closeFn returns true', () => {
    const closeFn = (_t: unknown, _g: unknown) => true;
    const attr: GridAttribute = { ...baseAttr, closeFn, closeFnName: 'within2' };
    const guess = makeEntity('Duke', { seed: '3' });
    const target = makeEntity('Arizona', { seed: '1' });
    const result = compareAttributes(guess, target, [attr]);
    expect(result[0].match).toBe('close');
  });

  it('returns incorrect when closeFn returns false', () => {
    const closeFn = (_t: unknown, _g: unknown) => false;
    const attr: GridAttribute = { ...baseAttr, closeFn, closeFnName: 'within2' };
    const guess = makeEntity('Duke', { seed: '10' });
    const target = makeEntity('Arizona', { seed: '1' });
    const result = compareAttributes(guess, target, [attr]);
    expect(result[0].match).toBe('incorrect');
  });

  it('does not set direction for text displayType', () => {
    const attr: GridAttribute = {
      key: 'region',
      displayName: 'Region',
      displayType: 'text',
      hasDirection: false,
      closeFn: null,
      closeFnName: null,
    };
    const guess = makeEntity('Duke', { region: 'East' });
    const target = makeEntity('Arizona', { region: 'West' });
    const result = compareAttributes(guess, target, [attr]);
    expect(result[0].direction).toBeNull();
  });

  it('handles multiple attributes', () => {
    const attrs: GridAttribute[] = [
      { key: 'seed', displayName: 'Seed', displayType: 'number', hasDirection: true, closeFn: null, closeFnName: null },
      { key: 'region', displayName: 'Region', displayType: 'text', hasDirection: false, closeFn: null, closeFnName: null },
    ];
    const guess = makeEntity('Duke', { seed: '1', region: 'East' });
    const target = makeEntity('Arizona', { seed: '1', region: 'West' });
    const result = compareAttributes(guess, target, attrs);
    expect(result).toHaveLength(2);
    expect(result[0].match).toBe('exact');
    expect(result[1].match).toBe('incorrect');
  });

  it('throws for missing attribute', () => {
    const guess = makeEntity('Duke', {});
    const target = makeEntity('Arizona', { seed: '1' });
    expect(() => compareAttributes(guess, target, [baseAttr])).toThrow('Attribute seed not found');
  });
});

describe('formatNumber', () => {
  it('returns small numbers as-is', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K', () => {
    expect(formatNumber(1000)).toBe('1K');
    expect(formatNumber(5000)).toBe('5K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(10000)).toBe('10K');
  });

  it('removes trailing .0', () => {
    expect(formatNumber(2000)).toBe('2K');
    expect(formatNumber(3000)).toBe('3K');
  });
});

describe('formatMoney', () => {
  it('returns empty string for null/undefined/NaN', () => {
    expect(formatMoney(null)).toBe('');
    expect(formatMoney(undefined)).toBe('');
    expect(formatMoney('abc')).toBe('');
  });

  it('formats small values', () => {
    expect(formatMoney(0)).toBe('$0');
    expect(formatMoney(500)).toBe('$500');
  });

  it('formats thousands', () => {
    expect(formatMoney(1000)).toBe('$1K');
    expect(formatMoney(50000)).toBe('$50K');
  });

  it('formats millions', () => {
    expect(formatMoney(1000000)).toBe('$1.0M');
    expect(formatMoney(1500000)).toBe('$1.5M');
    expect(formatMoney(10000000)).toBe('$10M');
  });

  it('formats billions', () => {
    expect(formatMoney(1000000000)).toBe('$1.0B');
    expect(formatMoney(1500000000)).toBe('$1.5B');
    expect(formatMoney(10000000000)).toBe('$10B');
  });

  it('accepts string values', () => {
    expect(formatMoney('1500000')).toBe('$1.5M');
  });
});
