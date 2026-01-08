import { useMemo, useState } from 'react';
import type { AppData, ISODate, TimeLogEntry } from '../lib/types';
import { makeId } from '../lib/id';
import { parseHours } from '../lib/storage';
import { Card, Hint, Pill } from '../components/UI';
import { isoToday } from '../lib/calcs';

export function TimeLogPage(props: { data: AppData; setData: (next: AppData) => void }) {
  const { data, setData } = props;

  const tasksById = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of data.tasks) m.set(t.id, t.name);
    return m;
  }, [data.tasks]);

  const [draft, setDraft] = useState<{ date: ISODate; taskId: string; hours: string }>({
    date: isoToday(),
    taskId: data.tasks[0]?.id ?? '',
    hours: '0.5',
  });

  function addEntry() {
    if (!draft.taskId) return;
    const hours = parseHours(draft.hours);
    if (hours <= 0) return;
    const entry: TimeLogEntry = {
      id: makeId('log'),
      date: draft.date,
      taskId: draft.taskId,
      hours,
    };
    setData({ ...data, timeLog: [entry, ...data.timeLog] });
  }

  function deleteEntry(id: string) {
    setData({ ...data, timeLog: data.timeLog.filter((e) => e.id !== id) });
  }

  const totalHours = data.timeLog.reduce((s, e) => s + e.hours, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card title="Add time (simple)">
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field">
            <div className="label">Date</div>
            <input className="input" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value as ISODate })} />
          </div>
          <div className="field" style={{ minWidth: 280, flex: 1 }}>
            <div className="label">Task</div>
            <select className="select" value={draft.taskId} onChange={(e) => setDraft({ ...draft, taskId: e.target.value })}>
              <option value="" disabled>
                Select a task…
              </option>
              {data.tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <div className="label">Hours</div>
            <input className="input" value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} inputMode="decimal" />
          </div>
          <button onClick={addEntry}>Add</button>
          <div className="spacer" />
          <Pill tone="blue">Total logged: {Math.round(totalHours * 10) / 10} hrs</Pill>
        </div>
        <div style={{ marginTop: 10 }}>
          <Hint>
            You only log time here. Task “Actual hours” updates automatically in the Tasks page (and Dashboard).
          </Hint>
        </div>
      </Card>

      <Card title="Time log entries">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Task</th>
                <th>Hours</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.timeLog.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 650 }}>{e.date}</td>
                  <td>{tasksById.get(e.taskId) ?? '(deleted task)'}</td>
                  <td style={{ fontWeight: 650 }}>{Math.round(e.hours * 10) / 10}</td>
                  <td>
                    <button className="danger" onClick={() => deleteEntry(e.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {data.timeLog.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    No time logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

