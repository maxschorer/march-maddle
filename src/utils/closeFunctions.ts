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
  
  // Define position groups
  const guards = ['G', 'PG', 'SG'];
  const forwards = ['F', 'SF', 'PF'];
  const centers = ['C'];
  
  // Check if both positions are in the same group
  if (guards.includes(targetPos) && guards.includes(guessPos)) {
    return true;
  }
  if (forwards.includes(targetPos) && forwards.includes(guessPos)) {
    return true;
  }
  if (centers.includes(targetPos) && centers.includes(guessPos)) {
    return true;
  }
  
  return false;
};

// NFL close functions
const sameCollegeConference: CloseFunction = (target: unknown, guess: unknown) => {
  const conferences = [
    // ACC
    ['Boston College', 'California', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech', 'Louisville', 'Miami', 'NC State', 'North Carolina', 'Pittsburgh', 'SMU', 'Stanford', 'Syracuse', 'Virginia', 'Virginia Tech', 'Wake Forest'],
    // American Athletic
    ['Army', 'Charlotte', 'East Carolina', 'Florida Atlantic', 'Memphis', 'Navy', 'North Texas', 'Rice', 'South Florida', 'Temple', 'Tulane', 'Tulsa', 'UAB', 'UTSA'],
    // Big 12
    ['Arizona', 'Arizona State', 'Baylor', 'BYU', 'Cincinnati', 'Colorado', 'Houston', 'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State', 'TCU', 'Texas Tech', 'UCF', 'Utah', 'West Virginia'],
    // Big Ten
    ['Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State', 'Minnesota', 'Nebraska', 'Northwestern', 'Ohio State', 'Oregon', 'Penn State', 'Purdue', 'Rutgers', 'UCLA', 'USC', 'Washington', 'Wisconsin'],
    // Conference USA
    ['Delaware', 'Florida International', 'Jacksonville State', 'Kennesaw State', 'Liberty', 'Louisiana Tech', 'Middle Tennessee', 'Missouri State', 'New Mexico State', 'Sam Houston', 'UTEP', 'Western Kentucky'],
    // FBS Independents
    ['Notre Dame', 'UConn'],
    // Mid-American
    ['Akron', 'Ball State', 'Bowling Green', 'Buffalo', 'Central Michigan', 'Eastern Michigan', 'Kent State', 'Massachusetts', 'Miami (OH)', 'Northern Illinois', 'Ohio', 'Toledo', 'Western Michigan'],
    // Mountain West
    ['Air Force', 'Boise State', 'Colorado State', 'Fresno State', 'Hawai\'i', 'Nevada', 'New Mexico', 'San Diego State', 'San José State', 'UNLV', 'Utah State', 'Wyoming'],
    // Pac-12
    ['Oregon State', 'Washington State'],
    // SEC
    ['Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 'LSU', 'Mississippi State', 'Missouri', 'Oklahoma', 'Ole Miss', 'South Carolina', 'Tennessee', 'Texas', 'Texas A&M', 'Vanderbilt'],
    // Sun Belt
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
    // AFC East
    ['BUF', 'MIA', 'NE', 'NYJ'],
    // AFC North
    ['BAL', 'CIN', 'CLE', 'PIT'],
    // AFC South
    ['HOU', 'IND', 'JAX', 'TEN'],
    // AFC West
    ['DEN', 'KC', 'LV', 'LAC'],
    // NFC East
    ['DAL', 'NYG', 'PHI', 'WSH'],
    // NFC North
    ['CHI', 'DET', 'GB', 'MIN'],
    // NFC South
    ['ATL', 'CAR', 'NO', 'TB'],
    // NFC West
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

// March Madness conference close function - "close" if in the same power/mid-major tier
const sameMarchMadnessConference: CloseFunction = (target: unknown, guess: unknown) => {
  const conferenceGroups = [
    // Power conferences
    ['SEC', 'Big Ten', 'ACC', 'Big 12', 'Big East'],
    // Strong mid-majors
    ['WCC', 'Mountain West', 'Atlantic 10', 'Missouri Valley', 'American', 'MAC'],
    // Mid-majors
    ['Big South', 'Southland', 'CAA', 'Sun Belt', 'Big West', 'C-USA', 'Horizon', 'Summit', 'WAC', 'Ivy'],
    // Low-majors
    ['MAAC', 'NEC', 'MEAC', 'America East', 'Patriot', 'SWAC', 'Big Sky', 'Southern', 'ASUN', 'Ohio Valley']
  ];
  
  for (const group of conferenceGroups) {
    if (group.includes(String(target)) && group.includes(String(guess))) {
      return true;
    }
  }
  return false;
};


// State region close function - "close" if states are in the same geographic region
const sameStateRegion: CloseFunction = (target: unknown, guess: unknown) => {
  const regions = [
    // Southeast
    ['Alabama', 'Florida', 'Georgia', 'Kentucky', 'Louisiana', 'Mississippi', 'North Carolina', 'South Carolina', 'Tennessee', 'Virginia', 'Washington D.C.'],
    // Northeast
    ['Connecticut', 'Maryland', 'New York', 'Pennsylvania'],
    // Midwest
    ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'Wisconsin'],
    // Southwest
    ['Arizona', 'Arkansas', 'Texas'],
    // West
    ['California', 'Hawaii', 'Idaho', 'Utah', 'Washington'],
  ];

  for (const region of regions) {
    if (region.includes(String(target)) && region.includes(String(guess))) {
      return true;
    }
  }
  return false;
};

// Registry of all close functions
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

// Helper function to get a close function by name
export function getCloseFunction(name: string | null): CloseFunction | null {
  if (!name) return null;
  return closeFunctionRegistry[name as CloseFunctionName] || null;
}

// Tooltip hints shown to users when a "close" match is triggered
export const closeHints: Partial<Record<CloseFunctionName, string>> = {
  sameMarchMadnessConference: 'Same conference tier',
  sameStateRegion: 'Same region',
  within2: 'Within 2',
  within10: 'Within 10',
};

// Helper function to get all available close function names with descriptions
export function getCloseFunctionOptions(): Array<{ value: CloseFunctionName; description: string }> {
  return [
    { value: 'within2',  description: 'Values within 2' },
    { value: 'sameNbaDivision', description: 'NBA teams in the same division' },
    { value: 'adjacentNbaPosition',  description: 'Neighboring positions (e.g., PG/SG)' },
    { value: 'similarNbaPosition',  description: 'Same position group (Guards/Forwards/Center)' },
    { value: 'sameCollegeConference', description: 'College teams in the same conference' },
    { value: 'sameNFLDivision', description: 'NFL teams in the same division' },
    { value: 'within10', description: 'Values within 10' },
    { value: 'sameMarchMadnessConference', description: 'NCAA conferences in the same tier (power/mid-major/low-major)' },
    { value: 'sameStateRegion', description: 'States in the same geographic region' },
  ];
}