import { useId } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import './ReleaseControls.css'

export interface ReleaseGate { label: string; passed: boolean }

export interface ReleaseControlsProps {
  environments: string[]
  environment: string
  onEnvironmentChange: (env: string) => void
  /** e.g. "v2.5 candidate". */
  version: string
  /** Percent of users who get the new version, 0–100. */
  rollout: number
  onRolloutChange: (percent: number) => void
  /** Checks that must pass before promoting. */
  gates: ReleaseGate[]
  onPromote: () => void
  onRollback: () => void
  /** True once this version is released in the selected environment. Shows Roll back. */
  live?: boolean
}

/** Choose an environment, set how many users get a new agent version, and promote it only when its gates pass. */
export function ReleaseControls({ environments, environment, onEnvironmentChange, version, rollout, onRolloutChange, gates, onPromote, onRollback, live = false }: ReleaseControlsProps) {
  const uid = useId()
  const blocked = gates.filter((g) => !g.passed)
  return (
    <div className="release">
      <fieldset className="release__envs">
        <legend className="sr-only">Environment</legend>
        {environments.map((env) => (
          <label key={env} className="release__env">
            <input type="radio" name={`${uid}-env`} value={env} checked={env === environment} onChange={() => onEnvironmentChange(env)} />
            <span>{env}</span>
          </label>
        ))}
      </fieldset>

      <div className="release__version">
        <div><span className="release__eyebrow">{environment}</span><h4 className="release__name">{version}</h4></div>
        <Badge variant={live ? 'success' : 'neutral'}>{live ? `Live for ${rollout}%` : 'Not released'}</Badge>
      </div>

      <div className="release__rollout">
        <label htmlFor={`${uid}-range`} className="release__label">Rollout exposure <output htmlFor={`${uid}-range`}>{rollout}%</output></label>
        <input id={`${uid}-range`} type="range" min={0} max={100} step={5} value={rollout} aria-valuetext={`${rollout}% of users`} onChange={(e) => onRolloutChange(Number(e.target.value))} />
        <div className="release__scale" aria-hidden="true"><span>0% of users</span><span>100% of users</span></div>
      </div>

      <ul className="release__gates" aria-label="Release gates">
        {gates.map((g) => (
          <li key={g.label} className={g.passed ? 'is-passed' : 'is-blocked'}>
            <span aria-hidden="true">{g.passed ? '✓' : '○'}</span>{g.label}: <strong>{g.passed ? 'passed' : 'not passed'}</strong>
          </li>
        ))}
      </ul>

      <div className="release__actions">
        <Button disabled={blocked.length > 0} aria-describedby={blocked.length ? `${uid}-why` : undefined} onClick={onPromote}>Promote to {environment}</Button>
        {live && <Button variant="secondary" onClick={onRollback}>Roll back</Button>}
      </div>
      {/* Say why the button is disabled, instead of leaving people guessing */}
      {blocked.length > 0 && <p id={`${uid}-why`} className="release__why">Pass {blocked.map((g) => g.label.toLowerCase()).join(' and ')} to promote.</p>}
    </div>
  )
}
