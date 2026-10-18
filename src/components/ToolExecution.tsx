import { useId } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Disclosure } from './Disclosure'
import './ToolExecution.css'

export interface ToolExecutionProps {
  /** System the agent called, e.g. "CRM". */
  tool: string
  /** What it did there, e.g. "Query contacts". */
  operation: string
  status: 'running' | 'success' | 'error'
  /** Permission the call ran with, e.g. "Read-only". */
  access?: string
  duration?: string
  callId?: string
  /** One-line outcome, e.g. "240 results returned". */
  summary?: string
  /** Raw request and response, shown behind "Show details". */
  request?: string
  response?: string
  /** Shown instead of the summary when status is error. */
  error?: string
  /** Shows a Retry button when the call failed. */
  onRetry?: () => void
}

const STATUS = {
  running: { text: 'Running', variant: 'info' },
  success: { text: 'Success', variant: 'success' },
  error: { text: 'Failed', variant: 'danger' },
} as const

/** One call an agent made to an outside system: what, with which permission, and what came back. */
export function ToolExecution({ tool, operation, status, access, duration, callId, summary, request, response, error, onRetry }: ToolExecutionProps) {
  const titleId = useId()
  const meta = [access, status !== 'running' && duration, callId && `Call ${callId}`].filter(Boolean).join(' · ')
  return (
    <article className="tool" aria-labelledby={titleId} aria-busy={status === 'running' || undefined}>
      <header className="tool__head">
        <span className="tool__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><ellipse cx="8" cy="4" rx="5" ry="2" /><path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" /></svg>
        </span>
        <div className="tool__who">
          <h3 id={titleId} className="tool__title">{tool} · {operation}</h3>
          {meta && <span className="tool__meta">{meta}</span>}
        </div>
        <Badge variant={STATUS[status].variant}>{STATUS[status].text}</Badge>
      </header>
      {status === 'error' ? (
        <p className="tool__error" role="alert">{error ?? 'The call failed.'}</p>
      ) : (
        <p className="tool__summary" role="status">{status === 'running' ? 'Waiting for a response…' : summary}</p>
      )}
      {(request || response) && status !== 'running' && (
        <Disclosure label="Show details">
          {request && <><p className="tool__label">Request</p><pre tabIndex={0}>{request}</pre></>}
          {response && <><p className="tool__label">Response</p><pre tabIndex={0}>{response}</pre></>}
        </Disclosure>
      )}
      {status === 'error' && onRetry && (
        <div><Button size="sm" variant="secondary" onClick={onRetry}>Retry call</Button></div>
      )}
    </article>
  )
}
