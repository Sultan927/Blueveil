import type { AppData, ISODate } from './types';
import { makeId } from './id';
import { addDaysISO, fromISODate } from './date';

const STORAGE_KEY = 'beginner_productivity_app_v1';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function makeDefaultHabitNames(): { id: string; name: string }[] {
  const defaults = [
    'Wake up on time',
    'Plan the day (5 min)',
    'Deep work (30+ min)',
    'Exercise',
    'Healthy meal',
    'Drink water',
    'Read (10 min)',
    'Learn (15 min)',
    'Clean/tidy (5 min)',
    'Walk outside',
    'No social media before noon',
    'Journal (3 lines)',
    'Connect with someone',
    'Sleep routine',
    'Gratitude',
  ];
  return defaults.map((name) => ({ id: makeId('habit'), name }));
}

function makeEmptyChecks(habits = 15, days = 30): boolean[][] {
  return Array.from({ length: habits }, () => Array.from({ length: days }, () => false));
}

export function makeDefaultData(today: ISODate): AppData {
  // Pick the Monday of "this week" as a sane default start.
  const d = fromISODate(today);
  const day = d.getDay(); // Sun 0 .. Sat 6
  const diffToMonday = ((day + 6) % 7); // Mon->0, Tue->1, ... Sun->6
  const monday = addDaysISO(today, -diffToMonday);

  return {
    version: 1,
    habitStartMonday: monday,
    habitNames: makeDefaultHabitNames(),
    habitChecks: makeEmptyChecks(15, 30),
    tasks: [],
    timeLog: [],
    goals: [],
  };
}

export function loadData(today: ISODate): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefaultData(today);
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed || parsed.version !== 1) return makeDefaultData(today);
    // Light sanity: ensure 15x30 checks exist
    const habits = parsed.habitNames?.length ?? 0;
    const days = parsed.habitChecks?.[0]?.length ?? 0;
    if (habits !== 15 || days !== 30) {
      return {
        ...parsed,
        habitNames: parsed.habitNames?.slice(0, 15) ?? makeDefaultHabitNames(),
        habitChecks: makeEmptyChecks(15, 30),
      };
    }
    return parsed;
  } catch {
    return makeDefaultData(today);
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function parseHours(input: string): number {
  const n = Number(input);
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return clamp(n, 0, 24);
}

