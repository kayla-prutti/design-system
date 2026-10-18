import { useId } from 'react'
import type { ReactNode } from 'react'
import './ProgressSteps.css'

export interface Step {
  label: string
  description?: string
  /** Shown below the steps while this step is current: a string or any UI. */
  content?: ReactNode
}

export interface ProgressStepsProps {
  steps: Step[]
  /** Zero-based index of the step in progress. Steps before it are complete. */
  current: number
  /** Makes each step clickable (rendered as a button). Omit for a read-only indicator. */
  onStepClick?: (index: number) => void
}

/** Ordered list of steps. State is shown with an icon and hidden text, not color alone. */
export function ProgressSteps({ steps, current, onStepClick }: ProgressStepsProps) {
  const uid = useId()
  const currentStep = steps[current]
  return (
    <div className="steps-wrap">
    <ol className="steps">
      {steps.map((step, i) => {
        const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming'
        const content = (
          <>
            <span className="steps__marker" aria-hidden="true">
              {state === 'complete'
                ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
                : i + 1}
            </span>
            <span className="steps__text">
              <span id={`${uid}-label-${i}`} className="steps__label">{step.label}<span className="sr-only"> ({state})</span></span>
              {step.description && <span className="steps__desc">{step.description}</span>}
            </span>
          </>
        )
        return (
          <li key={step.label} className={`steps__item steps__item--${state}`} aria-current={!onStepClick && state === 'current' ? 'step' : undefined}>
            {onStepClick ? (
              <button type="button" className="steps__btn" aria-current={state === 'current' ? 'step' : undefined} onClick={() => onStepClick(i)}>{content}</button>
            ) : content}
          </li>
        )
      })}
    </ol>
    {currentStep?.content && (
      <div className="steps__panel" role="region" aria-labelledby={`${uid}-label-${current}`}>
        {currentStep.content}
      </div>
    )}
    </div>
  )
}
