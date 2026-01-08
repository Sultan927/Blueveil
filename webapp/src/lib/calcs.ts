import type { AppData, GoalStatus, ISODate, TaskStatus } from './types';
import { addDaysISO, findWorkdayIndex, makeWorkdayDates, toISODate } from './date';

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function safeDiv(n: number, d: number): number {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return 0;
  return n / d;
}

export function getActualHoursByTaskId(data: AppData): Record<string, number> {
  const map: Record<string, number> = {};
  for (const entry of data.timeLog) {
    map[entry.taskId] = (map[entry.taskId] ?? 0) + entry.hours;
  }
  return map;
}

export function taskCompletionRatio(statuses: TaskStatus[]): number {
  const total = statuses.length;
  if (total === 0) return 0;
  const done = statuses.filter((s) => s === 'Done').length;
  return done / total;
}

export function avgTimeEfficiency(estimated: number[], actual: number[]): number {
  // average of per-task efficiency = min(1, est/actual) where actual>0 and est>0
  const effs: number[] = [];
  for (let i = 0; i < estimated.length; i += 1) {
    const est = estimated[i] ?? 0;
    const act = actual[i] ?? 0;
    if (est > 0 && act > 0) effs.push(clamp01(est / act));
  }
  if (effs.length === 0) return 0;
  return effs.reduce((a, b) => a + b, 0) / effs.length;
}

export function goalProgressRatio(kr1: number, kr2: number, kr3: number): number {
  const vals = [kr1, kr2, kr3].map((v) => clamp01(v / 100));
  return (vals[0] + vals[1] + vals[2]) / 3;
}

export function goalStatus(progressRatio: number): GoalStatus {
  if (progressRatio >= 1) return 'Completed';
  if (progressRatio >= 0.7) return 'On Track';
  return 'At Risk';
}

export function makeHabitDates(data: AppData): ISODate[] {
  return makeWorkdayDates(data.habitStartMonday, 30);
}

export function getTodayIndex(data: AppData, today: ISODate): number {
  const dates = makeHabitDates(data);
  const idx = findWorkdayIndex(dates, today);
  // If today isn't in the 30-workday window (or it's weekend), treat "today" as the latest day in the view.
  return idx === null ? 29 : idx;
}

export function habitDailyCompletionRatios(data: AppData): number[] {
  const habits = data.habitNames.length;
  const days = 30;
  const ratios: number[] = [];
  for (let day = 0; day < days; day += 1) {
    let done = 0;
    for (let h = 0; h < habits; h += 1) {
      if (data.habitChecks[h]?.[day]) done += 1;
    }
    ratios.push(habits === 0 ? 0 : done / habits);
  }
  return ratios;
}

export function habitWeeklyRatiosFromDaily(daily: number[]): number[] {
  // 6 weeks x 5 workdays
  const weeks: number[] = [];
  for (let w = 0; w < 6; w += 1) {
    const start = w * 5;
    const slice = daily.slice(start, start + 5);
    const avg = slice.reduce((a, b) => a + b, 0) / 5;
    weeks.push(avg);
  }
  return weeks;
}

export function habitCurrentStreak(data: AppData, todayIndex: number): number[] {
  // per-habit streak ending at todayIndex
  const days = 30;
  const idx = Math.max(0, Math.min(days - 1, todayIndex));
  return data.habitChecks.map((row) => {
    let streak = 0;
    for (let d = idx; d >= 0; d -= 1) {
      if (row?.[d]) streak += 1;
      else break;
    }
    return streak;
  });
}

export function totalsForWeek(data: AppData, weekStart: ISODate): {
  tasksPlanned: number;
  tasksDonePlanned: number;
  hours: number;
} {
  const weekEndExclusive = addDaysISO(weekStart, 5);

  const tasksPlanned = data.tasks.filter((t) => t.plannedWeekStart === weekStart).length;
  const tasksDonePlanned = data.tasks.filter((t) => t.plannedWeekStart === weekStart && t.status === 'Done').length;

  const hours = data.timeLog
    .filter((e) => e.date >= weekStart && e.date < weekEndExclusive)
    .reduce((sum, e) => sum + e.hours, 0);

  return { tasksPlanned, tasksDonePlanned, hours };
}

export function productivityScore(params: {
  habitConsistency: number; // 0..1
  taskCompletion: number; // 0..1
  timeEfficiency: number; // 0..1
  goalProgress: number; // 0..1
}): number {
  const score =
    0.4 * clamp01(params.habitConsistency) +
    0.3 * clamp01(params.taskCompletion) +
    0.2 * clamp01(params.timeEfficiency) +
    0.1 * clamp01(params.goalProgress);
  return Math.round(clamp01(score) * 100);
}

export function isoToday(): ISODate {
  return toISODate(new Date());
}

