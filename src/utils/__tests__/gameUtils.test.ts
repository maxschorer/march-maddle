import { describe, it, expect } from 'vitest';
import { compareAttributes, formatNumber, formatMoney } from '../gameUtils';
import { Entity } from '@/types/Entity';
import { GridAttribute } from '@/types/Grid';

const makeEntity = (overrides: Record<string, string | number>): Entity => ({
  entity_id: 1,
  name: 'Test Team',
  imgPath: 'test.png',
  attributes: Object.entries(overrides).map(([key, value]) => ({
    key,
    value: String(value),
    img_path: null,
  })),
});

const makeAttr = (key: string, opts: Partial<GridAttribute> = {}): GridAttribute => ({
  key,
  displayName: key,
  displayType: 'text',
  closeFn: null,
  closeFnName: null,
  hasDirection: false,
  ...opts,
});

describe('compareAttributes', () => {
  it('returns exact match when values are equal', () => {
    const guessed = makeEntity({ region: 'East' });
    const target = makeEntity({ region: 'East' });
    const attrs = [makeAttr('region')];

    const result = compareAttributes(guessed, target, attrs);
    expect(result).toHaveLength(1);
    expect(result[0].match).toBe('exact');
    expect(result[0].direction).toBeNull();
  });

  it('returns incorrect when values differ and no closeFn', () => {
    const guessed = makeEntity({ region: 'East' });
    const target = makeEntity({ region: 'West' });
    const attrs = [makeAttr('region')];

    const result = compareAttributes(guessed, target, attrs);
    expect(result[0].match).toBe('incorrect');
  });

  it('returns close when closeFn returns true', () => {
    const guessed = makeEntity({ seed: '3' });
    const target = makeEntity({ seed: '5' });
    const attrs = [makeAttr('seed', {
      closeFn: (a, b) => Math.abs(Number(a) - Number(b)) <= 2,
      closeFnName: 'within2',
      displayType: 'number',
      hasDirection: true,
    })];

    const result = compareAttributes(guessed, target, attrs);
    expect(result[0].match).toBe('close');
    expect(result[0].direction).toBe('higher'); // target (5) > guessed (3)
  });

  it('returns incorrect when closeFn returns false', () => {
    const guessed = makeEntity({ seed: '1' });
    const target = makeEntity({ seed: '10' });
    const attrs = [makeAttr('seed', {
      closeFn: (a, b) => Math.abs(Number(a) - Number(b)) <= 2,
      closeFnName: 'within2',
      displayType: 'number',
      hasDirection: true,
    })];

    const result = compareAttributes(guessed, target, attrs);
    expect(result[0].match).toBe('incorrect');
    expect(result[0].direction).toBe('higher');
  });

  it('sets direction for number type when not exact', () => {
    const guessed = makeEntity({ kenpom: '50' });
    const target = makeEntity({ kenpom: '10' });
    const attrs = [makeAttr('kenpom', {
      displayType: 'number',
      hasDirection: true,
    })];

    const result = compareAttributes(guessed, target, attrs);
    expect(result[0].direction).toBe('lower'); // target (10) < guessed (50)
  });

  it('no direction for exact match even with hasDirection', () => {
    const guessed = makeEntity({ seed: '5' });
    const target = makeEntity({ seed: '5' });
    const attrs = [makeAttr('seed', {
      displayType: 'number',
      hasDirection: true,
    })];

    const result = compareAttributes(guessed, target, attrs);
    expect(result[0].match).toBe('exact');
    expect(result[0].direction).toBeNull();
  });

  it('compares multiple attributes', () => {
    const guessed = makeEntity({ region: 'East', seed: '1', state: 'NC' });
    const target = makeEntity({ region: 'East', seed: '5', state: 'VA' });
    const attrs = [
      makeAttr('region'),
      makeAttr('seed', { displayType: 'number', hasDirection: true }),
      makeAttr('state'),
    ];

    const result = compareAttributes(guessed, target, attrs);
    expect(result[0].match).toBe('exact');   // region
    expect(result[1].match).toBe('incorrect'); // seed
    expect(result[1].direction).toBe('higher');
    expect(result[2].match).toBe('incorrect'); // state
  });
});

describe('formatNumber', () => {
  it('returns plain number under 1000', () => {
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K', () => {
    expect(formatNumber(1000)).toBe('1K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(10000)).toBe('10K');
  });
});

describe('formatMoney', () => {
  it('handles null/undefined', () => {
    expect(formatMoney(null)).toBe('');
    expect(formatMoney(undefined)).toBe('');
  });

  it('formats millions', () => {
    expect(formatMoney(5000000)).toBe('$5.0M');
    expect(formatMoney(1500000)).toBe('$1.5M');
  });

  it('formats billions', () => {
    expect(formatMoney(2000000000)).toBe('$2.0B');
  });

  it('formats thousands', () => {
    expect(formatMoney(50000)).toBe('$50K');
  });
});
