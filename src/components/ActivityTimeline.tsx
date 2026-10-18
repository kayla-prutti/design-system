import './ActivityTimeline.css'

export type ActivityKind = 'agent' | 'human' | 'integration' | 'system'

export interface ActivityEvent {
  id: string
  title: string
  /** Who or what did it, e.g. "Campaign agent". */
  actor: string
  kind: ActivityKind
  /** ISO date-time, used for the machine-readable <time> value. */
  time: string
  /** Display text for the time, e.g. "10:42 AM". */
  timeLabel: string
}

export interface ActivityTimelineProps {
  events: ActivityEvent[]
  /** Accessible name for the list. */
  label?: string
}

const KIND_TEXT: Record<ActivityKind, string> = { agent: 'Agent', human: 'Person', integration: 'Integration', system: 'System' }

/** Newest-first audit log of what agents, people and systems did. Each kind has its own icon and label. */
export function ActivityTimeline({ events, label = 'Activity' }: ActivityTimelineProps) {
  if (events.length === 0) return <p className="timeline__empty">No activity yet.</p>
  return (
    <ol className="timeline" aria-label={label}>
      {events.map((e) => (
        <li key={e.id} className={`timeline__item timeline__item--${e.kind}`}>
          <span className="timeline__marker" aria-hidden="true">{ICONS[e.kind]}</span>
          <div className="timeline__body">
            <span className="timeline__title">{e.title}</span>
            <span className="timeline__meta">
              <time dateTime={e.time}>{e.timeLabel}</time> · <span className="timeline__kind">{KIND_TEXT[e.kind]}</span> · {e.actor}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

const ICONS: Record<ActivityKind, React.ReactNode> = {
  agent: <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8l5.1-1.4Z" /></svg>,
  human: <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="5" r="3" /><path d="M2.5 14.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5Z" /></svg>,
  integration: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 10 10 6M4.5 7.5l-1 1a2.5 2.5 0 0 0 3.5 3.5l1-1M11.5 8.5l1-1A2.5 2.5 0 0 0 9 4l-1 1" /></svg>,
  system: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="2.5" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" strokeLinecap="round" /></svg>,
}
