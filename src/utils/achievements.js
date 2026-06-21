/**
 * Achievement badge definitions and unlock logic for EcoMetrics.
 * Each badge has an id, title, description, and an unlock predicate.
 */

export const ACHIEVEMENT_BADGES = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Logged your first carbon footprint calculation.',
    icon: 'seedling',
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintained a 7-day logging streak.',
    icon: 'flame',
  },
  {
    id: 'carbon_goal',
    title: 'Carbon Goal',
    description: 'Achieved a footprint below 2.0 tonnes CO2e per year.',
    icon: 'shield',
  },
  {
    id: 'green_commuter',
    title: 'Green Commuter',
    description: 'Completed the bus commute action 10 or more times.',
    icon: 'bus',
  },
  {
    id: 'plant_pioneer',
    title: 'Plant Pioneer',
    description: 'Logged a vegan diet in at least one calculation.',
    icon: 'leaf',
  },
  {
    id: 'calendar_champion',
    title: 'Calendar Champion',
    description: 'Synced at least one sustainability challenge to Google Calendar.',
    icon: 'calendar',
  },
];

/**
 * Evaluates which badges are unlocked based on current user state.
 * @param {Object} params
 * @param {Array} params.history - Array of saved calculation records
 * @param {number} params.streakDays - Current daily streak count
 * @param {number} params.busActionCount - Number of times bus action was completed
 * @param {boolean} params.calendarSynced - Whether a calendar challenge was ever synced
 * @returns {Set<string>} Set of unlocked badge IDs
 */
export function computeUnlockedBadges({ history = [], streakDays = 0, busActionCount = 0, calendarSynced = false }) {
  const unlocked = new Set();

  if (history.length >= 1) {
    unlocked.add('first_step');
  }

  if (streakDays >= 7) {
    unlocked.add('streak_master');
  }

  const hasCarbonGoal = history.some(entry => typeof entry.total === 'number' && entry.total < 2.0);
  if (hasCarbonGoal) {
    unlocked.add('carbon_goal');
  }

  if (busActionCount >= 10) {
    unlocked.add('green_commuter');
  }

  const hasVegan = history.some(
    entry => entry.inputs?.food?.dietType === 'vegan'
  );
  if (hasVegan) {
    unlocked.add('plant_pioneer');
  }

  if (calendarSynced) {
    unlocked.add('calendar_champion');
  }

  return unlocked;
}
