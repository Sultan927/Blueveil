# Beginner Productivity Web App (local-first)

A simple, beginner-friendly productivity tool that mirrors the Google Sheets system you designed:

- **Habits**: 15 habits tracked across **30 workdays** (6 weeks × Mon–Fri)
- **Tasks**: category, priority, status, planned week, estimated hours
- **Time Log**: date + task + hours (auto-rolls up into Tasks + Dashboard)
- **Goals / OKRs**: 3 key results (0–100) with auto progress + status
- **Dashboard**: weekly snapshot + automated **0–100 productivity score**

All data is stored in **your browser local storage** (no backend).

## Run it locally

```bash
cd webapp
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## How it matches the Sheets system

- **Habits**: checkboxes in a Mon–Fri grid; streaks and completion auto-calc
- **Tasks**: completion % and time efficiency auto-calc
- **Time Log**: single source of truth for actual time spent
- **Goals**: progress and “On Track / At Risk / Completed” auto-calc
- **Score**: **40% habits, 30% tasks, 20% time efficiency, 10% goals**

## Tips

- Set **Settings → Habit Start Monday** to the Monday of your current workweek.
- Log time in small chunks (e.g., 0.5h). Tasks update automatically.
- Use Export/Import in Settings as a simple backup.
