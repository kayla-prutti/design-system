import { Badge } from './Badge'
import './EvaluationSuite.css'

export type TestStatus = 'not-run' | 'running' | 'pass' | 'fail'

export interface EvalTest {
  id: string
  name: string
  description: string
  status: TestStatus
  /** A failing critical test blocks release. */
  critical?: boolean
}

export interface EvaluationSuiteProps {
  /** e.g. "Quality gate · Campaign agent". */
  title: string
  tests: EvalTest[]
}

const STATUS = {
  'not-run': { text: 'Not run', variant: 'neutral' },
  running: { text: 'Running', variant: 'info' },
  pass: { text: 'Passed', variant: 'success' },
  fail: { text: 'Failed', variant: 'danger' },
} as const

/** Test results for an agent version: pass rate, critical failures, and each test with its status. */
export function EvaluationSuite({ title, tests }: EvaluationSuiteProps) {
  const ran = tests.filter((t) => t.status === 'pass' || t.status === 'fail')
  const passed = tests.filter((t) => t.status === 'pass').length
  const critical = tests.filter((t) => t.critical && t.status === 'fail').length
  const running = tests.some((t) => t.status === 'running')
  const overall = running ? STATUS.running : ran.length === 0 ? STATUS['not-run']
    : critical > 0 ? { text: 'Blocked', variant: 'danger' as const }
    : passed === tests.length ? { text: 'Ready to release', variant: 'success' as const }
    : { text: 'Needs review', variant: 'warning' as const }

  return (
    <section className="evals" aria-label={title} aria-busy={running || undefined}>
      <header className="evals__head">
        <h4 className="evals__title">{title}</h4>
        <Badge variant={overall.variant}>{overall.text}</Badge>
      </header>
      <dl className="evals__stats">
        <div><dt>Pass rate</dt><dd>{ran.length ? `${Math.round((passed / ran.length) * 100)}%` : '—'}</dd></div>
        <div><dt>Tests passed</dt><dd>{ran.length ? `${passed} / ${tests.length}` : '—'}</dd></div>
        <div><dt>Critical failures</dt><dd className={critical ? 'evals__bad' : undefined}>{ran.length ? critical : '—'}</dd></div>
      </dl>
      <ul className="evals__list">
        {tests.map((t) => (
          <li key={t.id} className="evals__test">
            <span className="evals__name">{t.name}{t.critical && <span className="evals__critical">Critical</span>}<span className="evals__desc">{t.description}</span></span>
            <Badge variant={STATUS[t.status].variant}>{STATUS[t.status].text}</Badge>
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status">{running ? 'Running tests' : ran.length ? `${passed} of ${tests.length} tests passed, ${critical} critical failures` : ''}</p>
    </section>
  )
}
