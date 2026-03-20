// Registry of close functions that can be referenced by name in the database
// Each function takes two values (target, guessed) and returns true if they are "close"

export type CloseFunctionName =
  | 'within2'
  | 'sameNbaDivision'
  | 'adjacentNbaPosition'
  | 'similarNbaPosition'
  | 'sameCollegeConference'
  | 'sameNFLDivision'
  | 'within10'
  | 'sameMarchMadnessConference'
  | 'sameStateRegion';

export type CloseFunction = (target: unknown, guess: unknown) => boolean;

// Numeric range functions
const within2: CloseFunction = (target: unknown, guess: unknown) => {
  return Math.abs(Number(target) - Number(guess)) <= 2;
};

const sameNbaDivision: CloseFunction = (target: unknown, guess: unknown) => {
  const divisions = [
    ['BOS', 'BKN', 'NYK', 'PHI', 'TOR'],
    ['CHI', 'CLE', 'DET', 'IND', 'MIL'],
    ['ATL', 'CHA', 'MIA', 'ORL', 'WAS'],
    ['DEN', 'MIN', 'OKC', 'POR', 'UTA'],
    ['GSW', 'LAC', 'LAL', 'PHX', 'SAC'],
    ['DAL', 'HOU', 'MEM', 'NOP', 'SAS']
  ];
  for (const division of divisions) {
    if (division.includes(String(target)) && division.includes(String(guess))) {
      return true;
    }
  }
  return false;
};

const adjacentNbaPosition: CloseFunction = (target: unknown, guess: unknown) => {
  const order = ['PG', 'SG', 'SF', 'PF', 'C'];
  const i = order.indexOf(String(target));
  const j = order.indexOf(String(guess));
  return Math.abs(i - j) <= 1;
};

const similarNbaPosition: CloseFunction = (target: unknown, guess: unknown) => {
  const targetPos = String(target);
  const guessPos = String(guess);

  const guards = ['G', 'PG', 'SG'];
  const forwards = ['F', 'SF', 'PF'];
  const centers = ['C'];

  if (guards.includes(targetPos) && guards.includes(guessPos)) return true;
  if (forwards.includes(targetPos) && forwards.includes(guessPos)) return true;
  if (centers.includes(targetPos) && centers.includes(guessPos)) return true;

  return false;
};

const sameCollegeConference: CloseFunction = (target: unknown, guess: unknown) => {
  const conferences = [
    ['Boston College', 'California', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech', 'Louisville', 'Miami', 'NC State', 'North Carolina', 'Pittsburgh', 'SMU', 'Stanford', 'Syracuse', 'Virginia', 'Virginia Tech', 'Wake Forest'],
    ['Army', 'Charlotte', 'East Carolina', 'Florida Atlantic', 'Memphis', 'Navy', 'North Texas', 'Rice', 'South Florida', 'Temple', 'Tulane', 'Tulsa', 'UAB', 'UTSA'],
    ['Arizona', 'Arizona State', 'Baylor', 'BYU', 'Cincinnati', 'Colorado', 'Houston', 'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State', 'TCU', 'Texas Tech', 'UCF', 'Utah', 'West Virginia'],
    ['Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State', 'Minnesota', 'Nebraska', 'Northwestern', 'Ohio State', 'Oregon', 'Penn State', 'Purdue', 'Rutgers', 'UCLA', 'USC', 'Washington', 'Wisconsin'],
    ['Delaware', 'Florida International', 'Jacksonville State', 'Kennesaw State', 'Liberty', 'Louisiana Tech', 'Middle Tennessee', 'Missouri State', 'New Mexico State', 'Sam Houston', 'UTEP', 'Western Kentucky'],
    ['Notre Dame', 'UConn'],
    ['Akron', 'Ball State', 'Bowling Green', 'Buffalo', 'Central Michigan', 'Eastern Michigan', 'Kent State', 'Massachusetts', 'Miami (OH)', 'Northern Illinois', 'Ohio', 'Toledo', 'Western Michigan'],
    ['Air Force', 'Boise State', 'Colorado State', 'Fresno State', 'Hawai\'i', 'Nevada', 'New Mexico', 'San Diego State', 'San José State', 'UNLV', 'Utah State', 'Wyoming'],
    ['Oregon State', 'Washington State'],
    ['Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 'LSU', 'Mississippi State', 'Missouri', 'Oklahoma', 'Ole Miss', 'South Carolina', 'Tennessee', 'Texas', 'Texas A&M', 'Vanderbilt'],
    ['App State', 'Arkansas State', 'Coastal Carolina', 'Georgia Southern', 'Georgia State', 'James Madison', 'Louisiana', 'Marshall', 'Old Dominion', 'South Alabama', 'Southern Miss', 'Texas State', 'Troy', 'UL Monroe']
  ];

  for (const conference of conferences) {
    if (conference.includes(String(target)) && conference.includes(String(guess))) {
      return true;
    }
  }
  return false;
};

const sameNFLDivision: CloseFunction = (target: unknown, guess: unknown) => {
  const divisions = [
    ['BUF', 'MIA', 'NE', 'NYJ'],
    ['BAL', 'CIN', 'CLE', 'PIT'],
    ['HOU', 'IND', 'JAX', 'TEN'],
    ['DEN', 'KC', 'LV', 'LAC'],
    ['DAL', 'NYG', 'PHI', 'WSH'],
    ['CHI', 'DET', 'GB', 'MIN'],
    ['ATL', 'CAR', 'NO', 'TB'],
    ['ARI', 'LAR', 'SF', 'SEA']
  ];

  for (const division of divisions) {
    if (division.includes(String(target)) && division.includes(String(guess))) {
      return true;
    }
  }
  return false;
};

const within10: CloseFunction = (target: unknown, guess: unknown) => {
  return Math.abs(Number(target) - Number(guess)) <= 10;
};

const sameMarchMadnessConference: CloseFunction = (target: unknown, guess: unknown) => {
  const conferenceGroups = [
    ['SEC', 'Big Ten', 'ACC', 'Big 12', 'Big East'],
    ['WCC', 'Mountain West', 'Atlantic 10', 'Missouri Valley', 'American', 'MAC'],
    ['Big South', 'Southland', 'CAA', 'Sun Belt', 'Big West', 'C-USA', 'Horizon', 'Summit', 'WAC', 'Ivy'],
    ['MAAC', 'NEC', 'MEAC', 'America East', 'Patriot', 'SWAC', 'Big Sky', 'Southern', 'ASUN', 'Ohio Valley']
  ];

  for (const group of conferenceGroups) {
    if (group.includes(String(target)) && group.includes(String(guess))) {
      return true;
    }
  }
  return false;
};

const sameStateRegion: CloseFunction = (target: unknown, guess: unknown) => {
  const regions = [
    ['Alabama', 'Florida', 'Georgia', 'Kentucky', 'Louisiana', 'Mississippi', 'North Carolina', 'South Carolina', 'Tennessee', 'Virginia', 'Washington D.C.'],
    ['Connecticut', 'Maryland', 'New York', 'Pennsylvania'],
    ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'Wisconsin'],
    ['Arizona', 'Arkansas', 'Texas'],
    ['California', 'Hawaii', 'Idaho', 'Utah', 'Washington'],
  ];

  for (const region of regions) {
    if (region.includes(String(target)) && region.includes(String(guess))) {
      return true;
    }
  }
  return false;
};

export const closeFunctionRegistry: Record<CloseFunctionName, CloseFunction> = {
  within2,
  sameNbaDivision,
  adjacentNbaPosition,
  similarNbaPosition,
  sameCollegeConference,
  sameNFLDivision,
  within10,
  sameMarchMadnessConference,
  sameStateRegion,
};

export function getCloseFunction(name: string | null): CloseFunction | null {
  if (!name) return null;
  return closeFunctionRegistry[name as CloseFunctionName] || null;
}

export const closeHints: Record<CloseFunctionName, string> = {
  within2: 'Within 2',
  within10: 'Within 10',
  sameNbaDivision: 'Same NBA division',
  adjacentNbaPosition: 'Adjacent position',
  similarNbaPosition: 'Same position group',
  sameCollegeConference: 'Same conference',
  sameNFLDivision: 'Same NFL division',
  sameMarchMadnessConference: 'Same conference tier',
  sameStateRegion: 'Same region',
};

export function getCloseFunctionOptions(): Array<{ value: CloseFunctionName; description: string }> {
  return [
    { value: 'within2', description: 'Values within 2' },
    { value: 'sameNbaDivision', description: 'NBA teams in the same division' },
    { value: 'adjacentNbaPosition', description: 'Neighboring positions (e.g., PG/SG)' },
    { value: 'similarNbaPosition', description: 'Same position group (Guards/Forwards/Center)' },
    { value: 'sameCollegeConference', description: 'College teams in the same conference' },
    { value: 'sameNFLDivision', description: 'NFL teams in the same division' },
    { value: 'within10', description: 'Values within 10' },
    { value: 'sameMarchMadnessConference', description: 'NCAA conferences in the same tier (power/mid-major/low-major)' },
    { value: 'sameStateRegion', description: 'States in the same geographic region' },
  ];
}
