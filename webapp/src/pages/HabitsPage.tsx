import type { AppData } from '../lib/types';
import { habitCurrentStreak, habitDailyCompletionRatios, habitWeeklyRatiosFromDaily } from '../lib/calcs';
import { formatShort, makeWorkdayDates } from '../lib/date';
import { Card, Hint, Pill, Progress } from '../components/UI';

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

export function HabitsPage(props: { data: AppData; setData: (next: AppData) => void; asOfIndex: number }) {
  const { data, setData, asOfIndex } = props;
  const dates = makeWorkdayDates(data.habitStartMonday, 30);

  const daily = habitDailyCompletionRatios(data);
  const weekly = habitWeeklyRatiosFromDaily(daily);
  const streaks = habitCurrentStreak(data, asOfIndex);

  const toDate = avg(daily.slice(0, asOfIndex + 1));
  const last5 = avg(daily.slice(Math.max(0, asOfIndex - 4), asOfIndex + 1));

  function setHabitName(idx: number, name: string) {
    const next = { ...data, habitNames: data.habitNames.map((h, i) => (i === idx ? { ...h, name } : h)) };
    setData(next);
  }

  function toggleCheck(habitIdx: number, dayIdx: number) {
    const nextChecks = data.habitChecks.map((row, rIdx) =>
      rIdx === habitIdx ? row.map((v, cIdx) => (cIdx === dayIdx ? !v : v)) : row,
    );
    setData({ ...data, habitChecks: nextChecks });
  }

  const weeks = Array.from({ length: 6 }, (_, w) => ({
    weekNumber: w + 1,
    startDayIndex: w * 5,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="grid3">
        <Card title="Habit consistency (workdays)">
          <div className="row" style={{ marginBottom: 8 }}>
            <div className="muted">This week (Mon–Fri):</div>
            <div className="spacer" />
            <Pill tone={weekly[Math.floor(asOfIndex / 5)] >= 0.8 ? 'green' : weekly[Math.floor(asOfIndex / 5)] >= 0.6 ? 'blue' : 'amber'}>
              {pct(weekly[Math.floor(asOfIndex / 5)] ?? 0)}
            </Pill>
          </div>
          <div className="row">
            <div className="muted">To-date (in this 30-day view):</div>
            <div className="spacer" />
            <div style={{ fontWeight: 650 }}>{pct(toDate)}</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <Progress value={toDate} />
          </div>
        </Card>

        <Card title="Last 5 workdays">
          <div className="row" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 750, fontSize: '1.1rem' }}>{pct(last5)}</div>
            <div className="spacer" />
            <Pill tone={last5 >= 0.8 ? 'green' : last5 >= 0.6 ? 'blue' : last5 >= 0.4 ? 'amber' : 'red'}>
              {last5 >= 0.8 ? 'Strong' : last5 >= 0.6 ? 'Good' : last5 >= 0.4 ? 'Improving' : 'Needs attention'}
            </Pill>
          </div>
          <Hint>Great for a quick “how was my week?” check-in.</Hint>
        </Card>

        <Card title="How to use">
          <Hint>
            Click checkboxes for each habit. Rename habits any time. This grid is built as <b>6 workweeks × 5 days</b>{' '}
            to keep it simple.
          </Hint>
        </Card>
      </div>

      <Card
        title="Habit grid (15 habits × 30 workdays)"
        right={
          <Pill tone="blue">
            Start Monday: {formatShort(data.habitStartMonday)} · As-of day: {asOfIndex + 1}/30
          </Pill>
        }
      >
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th className="stickyFirst">Habit</th>
                {weeks.map((w) => (
                  <th key={w.weekNumber} colSpan={5} style={{ textAlign: 'center' }}>
                    Week {w.weekNumber}
                  </th>
                ))}
                <th>Streak</th>
              </tr>
              <tr>
                <th className="stickyFirst" />
                {Array.from({ length: 30 }, (_, i) => (
                  <th key={i} style={{ textAlign: 'center' }}>
                    {DAY_LABELS[i % 5]}
                  </th>
                ))}
                <th />
              </tr>
              <tr>
                <th className="stickyFirst" />
                {dates.map((d, i) => (
                  <th key={d} style={{ textAlign: 'center' }}>
                    {d.slice(5)}
                    {i === asOfIndex ? <div className="muted">as-of</div> : null}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {data.habitNames.map((habit, hIdx) => (
                <tr key={habit.id}>
                  <td className="stickyFirst">
                    <input className="input" value={habit.name} onChange={(e) => setHabitName(hIdx, e.target.value)} />
                  </td>
                  {Array.from({ length: 30 }, (_, dIdx) => (
                    <td key={dIdx} style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(data.habitChecks[hIdx]?.[dIdx])}
                        onChange={() => toggleCheck(hIdx, dIdx)}
                        aria-label={`${habit.name} day ${dIdx + 1}`}
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    <Pill tone={streaks[hIdx] >= 5 ? 'green' : streaks[hIdx] >= 3 ? 'blue' : 'amber'}>{streaks[hIdx] ?? 0}</Pill>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="stickyFirst" style={{ fontWeight: 750 }}>
                  Daily completion %
                </td>
                {daily.map((r, i) => (
                  <td key={i} style={{ textAlign: 'center', fontWeight: 650 }}>
                    {pct(r)}
                  </td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

