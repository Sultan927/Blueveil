import type { AppData } from '../lib/types';
import { avgTimeEfficiency, getActualHoursByTaskId, habitDailyCompletionRatios, habitWeeklyRatiosFromDaily, productivityScore, totalsForWeek } from '../lib/calcs';
import { addDaysISO, formatShort } from '../lib/date';
import { Card, Hint, Pill, Progress } from '../components/UI';

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function DashboardPage(props: { data: AppData; asOfIndex: number }) {
  const { data, asOfIndex } = props;

  const actualByTask = getActualHoursByTaskId(data);
  const taskStatuses = data.tasks.map((t) => t.status);
  const taskCompletion = data.tasks.length === 0 ? 0 : taskStatuses.filter((s) => s === 'Done').length / data.tasks.length;
  const timeEfficiency = avgTimeEfficiency(
    data.tasks.map((t) => t.estimatedHours),
    data.tasks.map((t) => actualByTask[t.id] ?? 0),
  );

  const goalProgress =
    data.goals.length === 0
      ? 0
      : data.goals.reduce((sum, g) => sum + (g.kr1 + g.kr2 + g.kr3) / 3 / 100, 0) / data.goals.length;

  const daily = habitDailyCompletionRatios(data);
  const weeklyHabit = habitWeeklyRatiosFromDaily(daily);

  const habitToDate = daily.slice(0, asOfIndex + 1).reduce((a, b) => a + b, 0) / Math.max(1, asOfIndex + 1);
  const habitThisWeek = weeklyHabit[Math.floor(asOfIndex / 5)] ?? 0;

  const score = productivityScore({
    habitConsistency: habitThisWeek,
    taskCompletion,
    timeEfficiency,
    goalProgress,
  });

  const weekStarts = Array.from({ length: 6 }, (_, w) => addDaysISO(data.habitStartMonday, w * 7));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="grid3">
        <Card
          title="Productivity Score"
          right={<Pill tone={score >= 80 ? 'green' : score >= 60 ? 'blue' : score >= 40 ? 'amber' : 'red'}>{score}/100</Pill>}
        >
          <Hint>Weighted: 40% habits, 30% tasks, 20% time efficiency, 10% goals.</Hint>
          <div style={{ marginTop: 10 }}>
            <Progress value={score / 100} />
          </div>
        </Card>

        <Card title="Habits (workdays)">
          <div className="row" style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 650 }}>This week:</div>
            <div className="spacer" />
            <Pill tone={habitThisWeek >= 0.8 ? 'green' : habitThisWeek >= 0.6 ? 'blue' : habitThisWeek >= 0.4 ? 'amber' : 'red'}>
              {pct(habitThisWeek)}
            </Pill>
          </div>
          <div className="row">
            <div className="muted">30-day view (to-date):</div>
            <div className="spacer" />
            <div style={{ fontWeight: 650 }}>{pct(habitToDate)}</div>
          </div>
        </Card>

        <Card title="Tasks + Time">
          <div className="row" style={{ marginBottom: 8 }}>
            <div className="muted">Task completion:</div>
            <div className="spacer" />
            <div style={{ fontWeight: 650 }}>{pct(taskCompletion)}</div>
          </div>
          <div className="row">
            <div className="muted">Avg time efficiency:</div>
            <div className="spacer" />
            <div style={{ fontWeight: 650 }}>{pct(timeEfficiency)}</div>
          </div>
        </Card>
      </div>

      <Card title="Weekly snapshot (Mon–Fri)">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Habits</th>
                <th>Tasks planned</th>
                <th>Tasks done</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {weekStarts.map((ws, idx) => {
                const totals = totalsForWeek(data, ws);
                const habit = weeklyHabit[idx] ?? 0;
                return (
                  <tr key={ws}>
                    <td>
                      <div style={{ fontWeight: 650 }}>{formatShort(ws)}</div>
                      <div className="muted">Week {idx + 1}</div>
                    </td>
                    <td>{pct(habit)}</td>
                    <td>{totals.tasksPlanned}</td>
                    <td>{totals.tasksDonePlanned}</td>
                    <td>{Math.round(totals.hours * 10) / 10}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10 }} className="muted">
          Tip: set your “Habit Start Monday” to the Monday of your current workweek so “as-of” calculations feel natural.
        </div>
      </Card>
    </div>
  );
}

