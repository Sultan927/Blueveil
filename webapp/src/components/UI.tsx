import type { ReactNode } from 'react';
import './ui.css';

export function Card(props: { title?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="card">
      {(props.title || props.right) && (
        <div className="row" style={{ marginBottom: 10 }}>
          {props.title && <div className="cardTitle">{props.title}</div>}
          <div className="spacer" />
          {props.right}
        </div>
      )}
      {props.children}
    </div>
  );
}

export function Pill(props: { tone?: 'blue' | 'green' | 'amber' | 'red'; children: ReactNode }) {
  const toneClass =
    props.tone === 'green'
      ? 'pillGreen'
      : props.tone === 'amber'
        ? 'pillAmber'
        : props.tone === 'red'
          ? 'pillRed'
          : 'pillBlue';
  return <span className={`pill ${toneClass}`}>{props.children}</span>;
}

export function Progress(props: { value: number }) {
  const pct = Math.max(0, Math.min(1, props.value)) * 100;
  return (
    <div className="progressWrap" aria-label={`Progress ${Math.round(pct)}%`}>
      <div className="progressBar" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Hint(props: { children: ReactNode }) {
  return <div className="muted">{props.children}</div>;
}

