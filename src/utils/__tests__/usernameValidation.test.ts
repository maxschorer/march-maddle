import { describe, it, expect } from 'vitest';

// Extract validation logic to test independently
function validate(value: string): string | null {
  if (value.length < 6) return 'Must be at least 6 characters';
  if (value.length > 20) return 'Must be 20 characters or fewer';
  if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Only letters and numbers';
  return null;
}

describe('username validation', () => {
  it('rejects usernames shorter than 6 characters', () => {
    expect(validate('')).toBe('Must be at least 6 characters');
    expect(validate('abc')).toBe('Must be at least 6 characters');
    expect(validate('ab12')).toBe('Must be at least 6 characters');
    expect(validate('abcde')).toBe('Must be at least 6 characters');
  });

  it('accepts 6-character usernames', () => {
    expect(validate('abcdef')).toBeNull();
    expect(validate('abc123')).toBeNull();
  });

  it('accepts 20-character usernames', () => {
    expect(validate('a'.repeat(20))).toBeNull();
  });

  it('rejects usernames longer than 20 characters', () => {
    expect(validate('a'.repeat(21))).toBe('Must be 20 characters or fewer');
  });

  it('accepts letters and numbers only', () => {
    expect(validate('abcdef')).toBeNull();
    expect(validate('123456')).toBeNull();
    expect(validate('abc123')).toBeNull();
    expect(validate('ABCdef')).toBeNull();
  });

  it('rejects special characters', () => {
    expect(validate('abc_12')).toBe('Only letters and numbers');
    expect(validate('abc-12')).toBe('Only letters and numbers');
    expect(validate('abc 12')).toBe('Only letters and numbers');
    expect(validate('abc!12')).toBe('Only letters and numbers');
    expect(validate('abc@12')).toBe('Only letters and numbers');
    expect(validate('abc.12')).toBe('Only letters and numbers');
  });

  it('rejects unicode characters', () => {
    expect(validate('café12')).toBe('Only letters and numbers');
    expect(validate('naïve1')).toBe('Only letters and numbers');
  });
});
