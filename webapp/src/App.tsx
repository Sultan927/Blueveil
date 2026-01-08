import './App.css'
import { useEffect, useMemo, useState } from 'react'
import type { AppData } from './lib/types'
import { isoToday, getTodayIndex } from './lib/calcs'
import { loadData, saveData } from './lib/storage'
import { DashboardPage } from './pages/DashboardPage'
import { HabitsPage } from './pages/HabitsPage'
import { TasksPage } from './pages/TasksPage'
import { TimeLogPage } from './pages/TimeLogPage'
import { GoalsPage } from './pages/GoalsPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const today = isoToday()
  const [data, setData] = useState<AppData>(() => loadData(today))
  const [tab, setTab] = useState<'Dashboard' | 'Habits' | 'Tasks' | 'Time Log' | 'Goals' | 'Settings'>('Dashboard')

  useEffect(() => {
    saveData(data)
  }, [data])

  const asOfIndex = useMemo(() => getTodayIndex(data, today), [data, today])

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbarInner">
          <div className="brand">
            <div className="brandTitle">Beginner Productivity System</div>
            <div className="brandSubtitle">Habits (Mon–Fri) · Tasks · Time Log · Goals · Dashboard</div>
          </div>

          <div className="spacer" />

          <div className="nav" role="tablist" aria-label="Pages">
            {(['Dashboard', 'Habits', 'Tasks', 'Time Log', 'Goals', 'Settings'] as const).map((t) => (
              <button key={t} className={`tab ${tab === t ? 'tabActive' : ''}`} onClick={() => setTab(t)} role="tab" aria-selected={tab === t}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="content">
        {tab === 'Dashboard' && <DashboardPage data={data} asOfIndex={asOfIndex} />}
        {tab === 'Habits' && <HabitsPage data={data} setData={setData} asOfIndex={asOfIndex} />}
        {tab === 'Tasks' && <TasksPage data={data} setData={setData} />}
        {tab === 'Time Log' && <TimeLogPage data={data} setData={setData} />}
        {tab === 'Goals' && <GoalsPage data={data} setData={setData} />}
        {tab === 'Settings' && <SettingsPage data={data} setData={setData} />}
      </div>
    </div>
  )
}

export default App
