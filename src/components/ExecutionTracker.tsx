import { useId } from 'react'
import { Badge } from './Badge'
import './ExecutionTracker.css'

export type StepStatus = 'done' | 'running' | 'waiting' | 'failed' | 'pending'

export interface TrackerStep {
  id: string
  label: string
  status: StepStatus
  /** Extra context, e.g. "240 contacts" or the error message. */
  detail?: string
}

export interface ExecutionTrackerProps {
  /** What the agent is working on. */
  title: string
  steps: TrackerStep[]
  /** One line under the steps, e.g. why the run is paused. Announced when it changes. */
  note?: string
}

const STATUS_TEXT: Record<StepStatus, string> = {
  done: 'Done', running: 'Running', waiting: 'Waiting for approval', failed: 'Failed', pending: 'Not started',
}

function StepIcon({ status, index }: { status: StepStatus; index: number }) {
  if (status === 'done') return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
  if (status === 'failed') return <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m3 3 8 8M11 3l-8 8" /></svg>
  if (status === 'waiting') return <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2.5" y="2" width="2.5" height="8" rx="1" /><rect x="7" y="2" width="2.5" height="8" rx="1" /></svg>
  if (status === 'running') return <span className="tracker__spinner" />
  return <span>{index + 1}</span>
}

/** Shows each step an agent takes, so people can see what it is doing and where it stopped. */
export function ExecutionTracker({ title, steps, note }: ExecutionTrackerProps) {
  const titleId = useId()
  const done = steps.filter((s) => s.status === 'done').length
  const percent = steps.length ? Math.round((done / steps.length) * 100) : 0
  const overall =
    steps.some((s) => s.status === 'failed') ? { text: 'Failed', variant: 'danger' as const } :
    steps.some((s) => s.status === 'waiting') ? { text: 'Needs review', variant: 'warning' as const } :
    done === steps.length ? { text: 'Complete', variant: 'success' as const } :
    steps.some((s) => s.status === 'running') ? { text: 'Running', variant: 'info' as const } :
    { text: 'Not started', variant: 'neutral' as const }

  return (
    <section className="tracker" aria-labelledby={titleId}>
      <header className="tracker__head">
        <h3 id={titleId} className="tracker__title">{title}</h3>
        <Badge variant={overall.variant}>{overall.text}</Badge>
      </header>
      <div className="tracker__bar" role="progressbar" aria-labelledby={titleId} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${done} of ${steps.length} steps done`}>
        <span style={{ width: `${percent}%` }} className={`tracker__fill tracker__fill--${overall.variant}`} />
      </div>
      <ol className="tracker__steps">
        {steps.map((s, i) => (
          <li key={s.id} className={`tracker__step tracker__step--${s.status}`} aria-current={s.status === 'running' || s.status === 'waiting' ? 'step' : undefined}>
            <span className="tracker__icon" aria-hidden="true"><StepIcon status={s.status} index={i} /></span>
            <span className="tracker__label">
              {s.label}
              {s.detail && <span className="tracker__detail">{s.detail}</span>}
            </span>
            <span className="tracker__status">{STATUS_TEXT[s.status]}</span>
          </li>
        ))}
      </ol>
      {note && <p className="tracker__note" role="status">{note}</p>}
    </section>
  )
}
