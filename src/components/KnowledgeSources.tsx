import { Badge } from './Badge'
import './KnowledgeSources.css'

export type SourceStatus = 'synced' | 'delayed' | 'failed'

export interface KnowledgeSource {
  id: string
  name: string
  type: 'file' | 'database' | 'spreadsheet'
  /** e.g. "Last synced 18 min ago · 2.4 MB". */
  meta: string
  status: SourceStatus
  /** Shown when this source is selected: access level, owner, what uses it. */
  provenance?: { label: string; value: string }[]
}

export interface KnowledgeSourcesProps {
  sources: KnowledgeSource[]
  selectedId?: string
  onSelect: (id: string) => void
}

const STATUS = { synced: { text: 'Synced', variant: 'success' }, delayed: { text: 'Delayed', variant: 'warning' }, failed: { text: 'Failed', variant: 'danger' } } as const
const ICON = {
  file: 'M4 1.5h5.5L12.5 4.5V14.5H4ZM9 1.5v3.5h3.5',
  database: 'M3 4c0 1.1 2.2 2 5 2s5-.9 5-2-2.2-2-5-2-5 .9-5 2Zm0 0v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2',
  spreadsheet: 'M2.5 2.5h11v11h-11ZM2.5 6.5h11M2.5 10h11M6.5 2.5v11',
}

/** The data an agent can draw on, with freshness and where each source came from. */
export function KnowledgeSources({ sources, selectedId, onSelect }: KnowledgeSourcesProps) {
  const selected = sources.find((s) => s.id === selectedId)
  if (sources.length === 0) return <p className="ks__empty">No sources match.</p>
  return (
    <div className="ks">
      <ul className="ks__list" aria-label="Connected sources">
        {sources.map((s) => (
          <li key={s.id}>
            <button type="button" className="ks__row" aria-current={s.id === selectedId ? 'true' : undefined} onClick={() => onSelect(s.id)}>
              <span className="ks__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d={ICON[s.type]} /></svg>
              </span>
              <span className="ks__text"><span className="ks__name">{s.name}</span><span className="ks__meta">{s.meta}</span></span>
              <Badge variant={STATUS[s.status].variant}>{STATUS[s.status].text}</Badge>
            </button>
          </li>
        ))}
      </ul>
      <section className="ks__detail" aria-live="polite" aria-label="Source provenance">
        {selected ? (
          <>
            <h4 className="ks__detail-title">{selected.name}</h4>
            <dl className="ks__facts">
              {selected.provenance?.map((p) => <div key={p.label}><dt>{p.label}</dt><dd>{p.value}</dd></div>)}
            </dl>
          </>
        ) : (
          <p className="ks__hint">Select a source to see its access level, owner and last sync.</p>
        )}
      </section>
    </div>
  )
}
