import { describe, it, expect } from 'vitest';
import data from '../../../march-maddle-data.json';

describe('march-maddle-data.json', () => {
  it('has exactly 68 teams', () => {
    expect(data.teams).toHaveLength(68);
  });

  it('has no duplicate team names', () => {
    const names = data.teams.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('has unique overall_seed values 1-68', () => {
    const seeds = data.teams.map(t => t.overall_seed).sort((a, b) => a - b);
    expect(seeds).toEqual(Array.from({ length: 68 }, (_, i) => i + 1));
  });

  it('has unique kenpom values', () => {
    const kenpoms = data.teams.map(t => t.kenpom);
    expect(new Set(kenpoms).size).toBe(kenpoms.length);
  });

  it('has seeds 1-16', () => {
    for (const team of data.teams) {
      expect(team.seed).toBeGreaterThanOrEqual(1);
      expect(team.seed).toBeLessThanOrEqual(16);
    }
  });

  it('has exactly 4 regions', () => {
    const regions = new Set(data.teams.map(t => t.region));
    expect(regions).toEqual(new Set(['East', 'West', 'South', 'Midwest']));
  });

  it('has 4 teams per seed for seeds 1-10', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const count = data.teams.filter(t => t.seed === seed).length;
      expect(count).toBe(4);
    }
  });

  it('has valid ESPN logo URLs for all teams', () => {
    for (const team of data.teams) {
      expect(team.logo_url).toMatch(/^https:\/\/a\.espncdn\.com\/i\/teamlogos\/ncaa\/500\/\d+\.png$/);
    }
  });

  it('has unique espn_id values', () => {
    const ids = data.teams.map(t => t.espn_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe('schedule', () => {
    it('has 21 days', () => {
      expect(data.schedule).toHaveLength(21);
    });

    it('has consecutive dates from 2026-03-17 to 2026-04-06', () => {
      const start = new Date('2026-03-17');
      for (let i = 0; i < 21; i++) {
        const expected = new Date(start);
        expected.setDate(start.getDate() + i);
        expect(data.schedule[i].date).toBe(expected.toISOString().split('T')[0]);
      }
    });

    it('has consecutive day numbers 1-21', () => {
      const dayNumbers = data.schedule.map(d => d.day_number);
      expect(dayNumbers).toEqual(Array.from({ length: 21 }, (_, i) => i + 1));
    });

    it('references only teams that exist in the teams array', () => {
      const teamNames = new Set(data.teams.map(t => t.name));
      for (const day of data.schedule) {
        expect(teamNames.has(day.team)).toBe(true);
      }
    });

    it('has no duplicate teams in schedule', () => {
      const teams = data.schedule.map(d => d.team);
      expect(new Set(teams).size).toBe(teams.length);
    });

    it('has kenpom values matching the teams array', () => {
      for (const day of data.schedule) {
        const team = data.teams.find(t => t.name === day.team);
        expect(team).toBeDefined();
        expect(day.kenpom).toBe(team!.kenpom);
      }
    });
  });

  describe('grid config', () => {
    it('has 5 attributes', () => {
      expect(data.grid.attributes).toHaveLength(5);
    });

    it('has expected attribute keys', () => {
      const keys = data.grid.attributes.map(a => a.key);
      expect(keys).toEqual(['region', 'seed', 'conference', 'state', 'kenpom']);
    });

    it('has conference as photo displayType', () => {
      const conf = data.grid.attributes.find(a => a.key === 'conference');
      expect(conf?.displayType).toBe('photo');
    });

    it('has maxGuesses of 6', () => {
      expect(data.grid.maxGuesses).toBe(6);
    });
  });
});
