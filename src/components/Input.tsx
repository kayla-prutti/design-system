import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Tooltip } from './Tooltip'
import './Input.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  /** Short help text shown in a tooltip on an info icon next to the label. */
  tooltip?: string
  error?: string
}

export function Input({ label, tooltip, error, id, ...rest }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const descId = `${inputId}-desc`
  return (
    <div className="field">
      <div className="field__head">
        <label htmlFor={inputId} className="field__label">{label}</label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <button type="button" className="field__info" aria-label={`More info about ${label}`}>i</button>
          </Tooltip>
        )}
      </div>
      <input
        {...rest}
        id={inputId}
        className="field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? descId : undefined}
      />
      {error && (
        <p id={descId} className="field__msg field__msg--error" role="alert">
          <svg className="field__msg-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 3.8v3.9M7 9.4v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
