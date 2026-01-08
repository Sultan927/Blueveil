import { useMemo, useState } from 'react';
import type { AppData, ISODate } from '../lib/types';
import { Card, Hint, Pill } from '../components/UI';
import { isMonday, makeWorkdayDates } from '../lib/date';
import { makeDefaultData } from '../lib/storage';
import { isoToday } from '../lib/calcs';

export function SettingsPage(props: { data: AppData; setData: (next: AppData) => void }) {
  const { data, setData } = props;
  const [importText, setImportText] = useState('');
  const [exportCopied, setExportCopied] = useState(false);

  const dates = useMemo(() => makeWorkdayDates(data.habitStartMonday, 30), [data.habitStartMonday]);

  function setStartMonday(value: ISODate) {
    setData({ ...data, habitStartMonday: value });
  }

  function doReset() {
    const ok = window.confirm('Reset all data? This cannot be undone.');
    if (!ok) return;
    setData(makeDefaultData(isoToday()));
  }

  function doExport() {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard
      .writeText(text)
      .then(() => setExportCopied(true))
      .catch(() => setExportCopied(false));
  }

  function doImport() {
    try {
      const parsed = JSON.parse(importText) as AppData;
      if (!parsed || parsed.version !== 1) throw new Error('Bad version');
      if (!Array.isArray(parsed.habitNames) || parsed.habitNames.length !== 15) throw new Error('Expected 15 habits');
      if (!Array.isArray(parsed.habitChecks) || parsed.habitChecks.length !== 15) throw new Error('Expected 15x30 habit checks');
      setData(parsed);
      setImportText('');
      alert('Imported!');
    } catch {
      alert('Import failed. Paste a valid export JSON.');
    }
  }

  const mondayOk = isMonday(data.habitStartMonday);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card title="Habit view settings" right={<Pill tone={mondayOk ? 'green' : 'amber'}>{mondayOk ? 'Monday OK' : 'Pick a Monday'}</Pill>}>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field">
            <div className="label">Habit Start Monday</div>
            <input
              className={`input ${mondayOk ? '' : 'danger'}`}
              type="date"
              value={data.habitStartMonday}
              onChange={(e) => setStartMonday(e.target.value as ISODate)}
            />
          </div>
          <div className="field" style={{ minWidth: 360, flex: 1 }}>
            <div className="label">This 30-workday view covers</div>
            <div className="input" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontWeight: 650 }}>{dates[0]}</span>
              <span className="muted">→</span>
              <span style={{ fontWeight: 650 }}>{dates[29]}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <Hint>
            Set this to a <b>Monday</b>. The habit grid shows 6 workweeks (Mon–Fri) and automatically skips weekends.
          </Hint>
        </div>
      </Card>

      <div className="grid2">
        <Card title="Export (backup)">
          <Hint>Copies your data as JSON to clipboard.</Hint>
          <div className="row" style={{ marginTop: 10 }}>
            <button onClick={doExport}>Copy export JSON</button>
            {exportCopied && <Pill tone="green">Copied</Pill>}
          </div>
        </Card>

        <Card title="Import (restore)">
          <Hint>Paste a previous export JSON to restore.</Hint>
          <textarea className="textarea" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="{ ... }" style={{ width: '100%', marginTop: 10 }} />
          <div className="row" style={{ marginTop: 10 }}>
            <button onClick={doImport}>Import</button>
          </div>
        </Card>
      </div>

      <Card title="Danger zone">
        <Hint>This clears habits, tasks, time logs, and goals.</Hint>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="danger" onClick={doReset}>
            Reset all data
          </button>
        </div>
      </Card>
    </div>
  );
}

