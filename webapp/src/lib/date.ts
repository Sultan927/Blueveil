import type { ISODate } from './types';

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toISODate(d: Date): ISODate {
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${year}-${month}-${day}` as ISODate;
}

export function fromISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map((x) => Number(x));
  return new Date(y, m - 1, d);
}

export function addDaysISO(date: ISODate, days: number): ISODate {
  const d = fromISODate(date);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function formatShort(date: ISODate): string {
  // YYYY-MM-DD -> Mon 1/8
  const d = fromISODate(date);
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  return `${dow} ${d.getMonth() + 1}/${d.getDate()}`;
}

export function isMonday(date: ISODate): boolean {
  return fromISODate(date).getDay() === 1;
}

export function makeWorkdayDates(startMonday: ISODate, workdays = 30): ISODate[] {
  // 6 workweeks x 5 days; skips weekends by jumping +7 each week.
  const dates: ISODate[] = [];
  const weeks = Math.ceil(workdays / 5);
  for (let w = 0; w < weeks; w += 1) {
    for (let d = 0; d < 5; d += 1) {
      if (dates.length >= workdays) return dates;
      dates.push(addDaysISO(startMonday, w * 7 + d));
    }
  }
  return dates;
}

export function findWorkdayIndex(dates: ISODate[], target: ISODate): number | null {
  const idx = dates.indexOf(target);
  return idx === -1 ? null : idx;
}

