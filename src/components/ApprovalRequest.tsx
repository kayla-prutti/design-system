import { useId } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Disclosure } from './Disclosure'
import './ApprovalRequest.css'

export type Risk = 'low' | 'medium' | 'high'

export interface ApprovalRequestProps {
  /** What is being asked for, e.g. "Authorization requested". */
  title: string
  /** Plain-language summary of what the agent wants to do. */
  description: string
  /** Key facts a reviewer needs, shown as label/value pairs. */
  details?: { label: string; value: string }[]
  risk: Risk
  /** Who or what asked, and when. */
  requestedBy: string
  requestedAt: string
  /** Raw request the agent will run, for reviewers who want to inspect it. */
  payload?: string
  status?: 'pending' | 'approved' | 'rejected'
  onApprove: () => void
  onReject: () => void
}

const RISK_TEXT: Record<Risk, string> = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' }
const STATUS = {
  pending: { text: 'Pending', variant: 'warning' },
  approved: { text: 'Approved', variant: 'success' },
  rejected: { text: 'Rejected', variant: 'danger' },
} as const

/** A human checkpoint before an agent takes a high-impact action. */
export function ApprovalRequest({ title, description, details, risk, requestedBy, requestedAt, payload, status = 'pending', onApprove, onReject }: ApprovalRequestProps) {
  const titleId = useId()
  return (
    <article className="approval" aria-labelledby={titleId}>
      <header className="approval__head">
        <svg className="approval__shield" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="M8 1.8 13 3.8v4c0 3-2.2 5.3-5 6.4-2.8-1.1-5-3.4-5-6.4v-4Z" /><path d="m5.8 8 1.6 1.6L10.4 6.5" strokeLinecap="round" /></svg>
        <h3 id={titleId} className="approval__title">{title}</h3>
        <Badge variant={STATUS[status].variant}>{STATUS[status].text}</Badge>
      </header>
      <p className="approval__desc">{description}</p>
      <dl className="approval__facts">
        {details?.map((d) => (
          <div key={d.label}><dt>{d.label}</dt><dd>{d.value}</dd></div>
        ))}
        <div>
          <dt>Risk level</dt>
          <dd className={`approval__risk approval__risk--${risk}`}><span className="approval__risk-mark" aria-hidden="true" />{RISK_TEXT[risk]}</dd>
        </div>
      </dl>
      {payload && <Disclosure label="View payload"><pre tabIndex={0}>{payload}</pre></Disclosure>}
      <p className="approval__meta">Requested by {requestedBy} · {requestedAt}</p>
      {status === 'pending' ? (
        <div className="approval__actions">
          <Button variant="secondary" onClick={onReject}>Reject</Button>
          <Button onClick={onApprove}>Approve request</Button>
        </div>
      ) : (
        <p className="approval__result" role="status">
          {status === 'approved' ? 'Approved. The agent will continue.' : 'Rejected. The agent will not run this action.'}
        </p>
      )}
    </article>
  )
}
