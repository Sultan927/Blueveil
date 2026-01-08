export type ISODate = `${number}-${number}-${number}`; // e.g. 2026-01-08

export type Category = 'Work' | 'Personal' | 'Learning';
export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export type GoalStatus = 'On Track' | 'At Risk' | 'Completed';

export type Habit = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  name: string;
  category: Category;
  priority: Priority;
  status: TaskStatus;
  plannedWeekStart: ISODate; // Monday
  estimatedHours: number;
};

export type TimeLogEntry = {
  id: string;
  date: ISODate;
  taskId: string;
  hours: number;
};

export type Goal = {
  id: string;
  name: string;
  objective: string;
  kr1: number; // 0..100
  kr2: number; // 0..100
  kr3: number; // 0..100
};

export type AppData = {
  version: 1;
  habitStartMonday: ISODate;
  habitNames: Habit[]; // 15 habits
  habitChecks: boolean[][]; // [habitIndex][dayIndex] dayIndex 0..29 (Mon-Fri only)
  tasks: Task[];
  timeLog: TimeLogEntry[];
  goals: Goal[];
};

