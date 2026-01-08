import { useState } from 'react';
import type { AppData, Goal } from '../lib/types';
import { makeId } from '../lib/id';
import { goalProgressRatio, goalStatus } from '../lib/calcs';
import { Card, Hint, Pill, Progress } from '../components/UI';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function GoalsPage(props: { data: AppData; setData: (next: AppData) => void }) {
  const { data, setData } = props;
  const [draft, setDraft] = useState<{ name: string; objective: string }>({ name: '', objective: '' });

  function addGoal() {
    const name = draft.name.trim();
    if (!name) return;
    const goal: Goal = {
      id: makeId('goal'),
      name,
      objective: draft.objective.trim(),
      kr1: 0,
      kr2: 0,
      kr3: 0,
    };
    setData({ ...data, goals: [goal, ...data.goals] });
    setDraft({ name: '', objective: '' });
  }

  function updateGoal(id: string, patch: Partial<Goal>) {
    setData({ ...data, goals: data.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) });
  }

  function deleteGoal(id: string) {
    setData({ ...data, goals: data.goals.filter((g) => g.id !== id) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card title="Add a goal / OKR">
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ minWidth: 240 }}>
            <div className="label">Goal name</div>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g., Get fit" />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 300 }}>
            <div className="label">Objective (1 sentence)</div>
            <input
              className="input"
              value={draft.objective}
              onChange={(e) => setDraft({ ...draft, objective: e.target.value })}
              placeholder="e.g., Build a sustainable fitness routine."
            />
          </div>
          <button onClick={addGoal}>Add</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <Hint>Key Results are simple % fields (0–100). Progress and status auto-calculate.</Hint>
        </div>
      </Card>

      <Card title="Goals / OKRs">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Goal</th>
                <th>Objective</th>
                <th>KR1 %</th>
                <th>KR2 %</th>
                <th>KR3 %</th>
                <th>Progress</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.goals.map((g) => {
                const progress = goalProgressRatio(g.kr1, g.kr2, g.kr3);
                const status = goalStatus(progress);
                const tone: 'green' | 'blue' | 'amber' = status === 'Completed' ? 'green' : status === 'On Track' ? 'blue' : 'amber';
                return (
                  <tr key={g.id}>
                    <td>
                      <input className="input" value={g.name} onChange={(e) => updateGoal(g.id, { name: e.target.value })} />
                    </td>
                    <td>
                      <input className="input" value={g.objective} onChange={(e) => updateGoal(g.id, { objective: e.target.value })} />
                    </td>
                    <td>
                      <input
                        className="input"
                        value={String(g.kr1)}
                        onChange={(e) => updateGoal(g.id, { kr1: clamp(Number(e.target.value) || 0, 0, 100) })}
                        inputMode="numeric"
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        value={String(g.kr2)}
                        onChange={(e) => updateGoal(g.id, { kr2: clamp(Number(e.target.value) || 0, 0, 100) })}
                        inputMode="numeric"
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        value={String(g.kr3)}
                        onChange={(e) => updateGoal(g.id, { kr3: clamp(Number(e.target.value) || 0, 0, 100) })}
                        inputMode="numeric"
                      />
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div className="row" style={{ marginBottom: 6 }}>
                        <div style={{ fontWeight: 650 }}>{pct(progress)}</div>
                      </div>
                      <Progress value={progress} />
                    </td>
                    <td>
                      <Pill tone={tone}>{status}</Pill>
                    </td>
                    <td>
                      <button className="danger" onClick={() => deleteGoal(g.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {data.goals.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    No goals yet.
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

