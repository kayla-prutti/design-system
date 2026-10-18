import { Badge } from './Badge'
import './PolicyGuardrails.css'

export type CheckResult = 'pass' | 'warn' | 'fail'

export interface PolicyCheck {
  id: string
  label: string
  result: CheckResult
  /** Why it passed or failed, and what to change. */
  detail: string
}

export interface PolicyGuardrailsProps {
  /** e.g. "Enterprise standard". */
  policy: string
  /** null until the action has been evaluated. */
  checks: PolicyCheck[] | null
}

const RESULT_TEXT: Record<CheckResult, string> = { pass: 'Passed', warn: 'Warning', fail: 'Blocked' }

/** Shows whether a proposed agent action meets the organization's rules, rule by rule. */
export function PolicyGuardrails({ policy, checks }: PolicyGuardrailsProps) {
  const blocked = checks?.some((c) => c.result === 'fail')
  const warned = checks?.some((c) => c.result === 'warn')
  const overall = !checks ? { text: 'Not evaluated', variant: 'neutral' as const }
    : blocked ? { text: 'Blocked', variant: 'danger' as const }
    : warned ? { text: 'Allowed with warnings', variant: 'warning' as const }
    : { text: 'Allowed', variant: 'success' as const }

  return (
    <section className="policy" aria-label={`Policy: ${policy}`}>
      <header className="policy__head">
        <div><span className="policy__eyebrow">Policy set</span><h4 className="policy__name">{policy}</h4></div>
        <Badge variant={overall.variant}>{overall.text}</Badge>
      </header>
      <div role="status" aria-live="polite">
        {checks ? (
          <ul className="policy__checks">
            {checks.map((c) => (
              <li key={c.id} className={`policy__check policy__check--${c.result}`}>
                <span className="policy__icon" aria-hidden="true">{c.result === 'pass' ? '✓' : c.result === 'warn' ? '!' : '✕'}</span>
                <span><strong>{c.label}</strong> <span className="policy__result">{RESULT_TEXT[c.result]}</span><span className="policy__detail">{c.detail}</span></span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="policy__empty">Choose the options above, then evaluate the action.</p>
        )}
      </div>
    </section>
  )
}
