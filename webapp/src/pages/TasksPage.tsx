import { useMemo, useState } from 'react';
import type { AppData, Category, ISODate, Priority, Task, TaskStatus } from '../lib/types';
import { makeId } from '../lib/id';
import { addDaysISO, formatShort } from '../lib/date';
import { getActualHoursByTaskId } from '../lib/calcs';
import { Card, Hint, Pill, Progress } from '../components/UI';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Learning'];
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

export function TasksPage(props: { data: AppData; setData: (next: AppData) => void }) {
  const { data, setData } = props;

  const weekStarts = useMemo(() => Array.from({ length: 6 }, (_, w) => addDaysISO(data.habitStartMonday, w * 7)), [data.habitStartMonday]);

  const actualByTask = useMemo(() => getActualHoursByTaskId(data), [data]);
  const taskCompletion = data.tasks.length === 0 ? 0 : data.tasks.filter((t) => t.status === 'Done').length / data.tasks.length;

  const [draft, setDraft] = useState<{
    name: string;
    category: Category;
    priority: Priority;
    status: TaskStatus;
    plannedWeekStart: ISODate;
    estimatedHours: string;
  }>({
    name: '',
    category: 'Work',
    priority: 'Medium',
    status: 'To Do',
    plannedWeekStart: weekStarts[0] ?? data.habitStartMonday,
    estimatedHours: '1',
  });

  function addTask() {
    const name = draft.name.trim();
    if (!name) return;
    const est = clamp(Number(draft.estimatedHours) || 0, 0, 999);
    const task: Task = {
      id: makeId('task'),
      name,
      category: draft.category,
      priority: draft.priority,
      status: draft.status,
      plannedWeekStart: draft.plannedWeekStart,
      estimatedHours: est,
    };
    setData({ ...data, tasks: [task, ...data.tasks] });
    setDraft((d) => ({ ...d, name: '' }));
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setData({ ...data, tasks: data.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  }

  function deleteTask(id: string) {
    setData({
      ...data,
      tasks: data.tasks.filter((t) => t.id !== id),
      timeLog: data.timeLog.filter((e) => e.taskId !== id),
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="grid2">
        <Card title="Add a task">
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <div className="field" style={{ minWidth: 260, flex: 1 }}>
              <div className="label">Task name</div>
              <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g., Write report" />
            </div>
            <div className="field">
              <div className="label">Category</div>
              <select className="select" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="label">Priority</div>
              <select className="select" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="label">Status</div>
              <select className="select" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as TaskStatus })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="label">Planned week (Mon)</div>
              <select className="select" value={draft.plannedWeekStart} onChange={(e) => setDraft({ ...draft, plannedWeekStart: e.target.value as ISODate })}>
                {weekStarts.map((ws) => (
                  <option key={ws} value={ws}>
                    {formatShort(ws)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="label">Est. hours</div>
              <input className="input" value={draft.estimatedHours} onChange={(e) => setDraft({ ...draft, estimatedHours: e.target.value })} inputMode="decimal" />
            </div>
            <button onClick={addTask}>Add</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <Hint>Actual hours auto-fill from the Time Log. Keep task names simple and specific.</Hint>
          </div>
        </Card>

        <Card title="Quick stats" right={<Pill tone={taskCompletion >= 0.8 ? 'green' : taskCompletion >= 0.6 ? 'blue' : taskCompletion >= 0.4 ? 'amber' : 'red'}>{pct(taskCompletion)}</Pill>}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Task completion
          </div>
          <Progress value={taskCompletion} />
          <div className="row" style={{ marginTop: 10 }}>
            <div className="muted">Total tasks:</div>
            <div className="spacer" />
            <div style={{ fontWeight: 650 }}>{data.tasks.length}</div>
          </div>
        </Card>
      </div>

      <Card title="Task list">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Planned week</th>
                <th>Est (hrs)</th>
                <th>Actual (hrs)</th>
                <th>Efficiency</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.tasks.map((t) => {
                const actual = actualByTask[t.id] ?? 0;
                const eff = t.estimatedHours > 0 && actual > 0 ? Math.min(1, t.estimatedHours / actual) : 0;
                const prTone: 'red' | 'amber' | 'green' = t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'amber' : 'green';
                const stTone: 'green' | 'blue' | 'amber' = t.status === 'Done' ? 'green' : t.status === 'In Progress' ? 'blue' : 'amber';
                return (
                  <tr key={t.id}>
                    <td>
                      <input className="input" value={t.name} onChange={(e) => updateTask(t.id, { name: e.target.value })} />
                    </td>
                    <td>
                      <select className="select" value={t.category} onChange={(e) => updateTask(t.id, { category: e.target.value as Category })}>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Pill tone={prTone}>{t.priority}</Pill>
                    </td>
                    <td>
                      <select className="select" value={t.status} onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <div style={{ marginTop: 6 }}>
                        <Pill tone={stTone}>{t.status}</Pill>
                      </div>
                    </td>
                    <td>
                      <select className="select" value={t.plannedWeekStart} onChange={(e) => updateTask(t.id, { plannedWeekStart: e.target.value as ISODate })}>
                        {weekStarts.map((ws) => (
                          <option key={ws} value={ws}>
                            {formatShort(ws)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="input"
                        value={String(t.estimatedHours)}
                        onChange={(e) => updateTask(t.id, { estimatedHours: clamp(Number(e.target.value) || 0, 0, 999) })}
                        inputMode="decimal"
                      />
                    </td>
                    <td style={{ fontWeight: 650 }}>{Math.round(actual * 10) / 10}</td>
                    <td style={{ minWidth: 160 }}>
                      <div className="row" style={{ marginBottom: 6 }}>
                        <div style={{ fontWeight: 650 }}>{pct(eff)}</div>
                        <div className="spacer" />
                        <Pill tone={eff >= 0.9 ? 'green' : eff >= 0.7 ? 'blue' : eff >= 0.4 ? 'amber' : 'red'}>
                          {eff >= 0.9 ? 'Great' : eff >= 0.7 ? 'Good' : eff >= 0.4 ? 'Ok' : 'Off'}
                        </Pill>
                      </div>
                      <Progress value={eff} />
                    </td>
                    <td>
                      <button className="danger" onClick={() => deleteTask(t.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {data.tasks.length === 0 && (
                <tr>
                  <td colSpan={9} className="muted">
                    No tasks yet. Add one above.
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

