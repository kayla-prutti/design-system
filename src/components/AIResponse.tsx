import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Disclosure } from './Disclosure'
import './AIResponse.css'

export interface Source { title: string; excerpt: string }

export interface AIResponseProps {
  title: string
  /** The answer itself. */
  children: ReactNode
  /** Plain text copied by the Copy button. */
  copyText: string
  /** Where the answer came from. Shown as a list and as excerpts on demand. */
  sources?: Source[]
  status?: 'draft' | 'final'
  /** Shows a Regenerate button. */
  onRegenerate?: () => void
  /** Called when the user rates the answer. */
  onFeedback?: (value: 'helpful' | 'not-helpful') => void
}

/** An AI-generated answer that is labeled as AI, cites its sources, and can be copied, regenerated or rated. */
export function AIResponse({ title, children, copyText, sources, status = 'draft', onRegenerate, onFeedback }: AIResponseProps) {
  const titleId = useId()
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<'helpful' | 'not-helpful' | null>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }
  const rate = (value: 'helpful' | 'not-helpful') => {
    setRating(value)
    onFeedback?.(value)
  }

  return (
    <article className="ai-response" aria-labelledby={titleId}>
      <header className="ai-response__head">
        <span className="ai-response__spark" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8l5.1-1.4Z" /></svg>
        </span>
        <h3 id={titleId} className="ai-response__title">{title}</h3>
        <span className="ai-response__tag">AI-generated</span>
        <Badge variant={status === 'final' ? 'success' : 'neutral'}>{status === 'final' ? 'Final' : 'Draft'}</Badge>
      </header>
      <div className="ai-response__body">{children}</div>
      {sources && sources.length > 0 && (
        <p className="ai-response__sources">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 1.5h5.5L12.5 4.5V14.5H4Z" /><path d="M9 1.5v3.5h3.5" /></svg>
          Sources: {sources.map((s) => s.title).join(', ')}
        </p>
      )}
      <div className="ai-response__actions">
        <Button size="sm" variant="secondary" onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
        {onRegenerate && <Button size="sm" variant="secondary" onClick={onRegenerate}>Regenerate</Button>}
        <span className="ai-response__rate" role="group" aria-label="Rate this answer">
          <Button size="sm" variant={rating === 'helpful' ? 'soft' : 'text'} aria-pressed={rating === 'helpful'} onClick={() => rate('helpful')}>Helpful</Button>
          <Button size="sm" variant={rating === 'not-helpful' ? 'soft' : 'text'} aria-pressed={rating === 'not-helpful'} onClick={() => rate('not-helpful')}>Not helpful</Button>
        </span>
        <span className="sr-only" role="status">{copied ? 'Answer copied to clipboard' : rating ? 'Thanks for the feedback' : ''}</span>
      </div>
      {sources && sources.length > 0 && (
        <Disclosure label={`View ${sources.length} source excerpt${sources.length === 1 ? '' : 's'}`}>
          <ul className="ai-response__excerpts">
            {sources.map((s) => (
              <li key={s.title}><strong>{s.title}</strong><blockquote>{s.excerpt}</blockquote></li>
            ))}
          </ul>
        </Disclosure>
      )}
    </article>
  )
}
