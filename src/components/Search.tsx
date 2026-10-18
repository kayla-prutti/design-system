import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import './Search.css'

export interface SearchProps {
  value: string
  onChange: (value: string) => void
  /** Called once the user pauses typing (see debounce), on Enter, and when cleared. */
  onSearch?: (value: string) => void
  /** Milliseconds to wait after the last keystroke before onSearch runs. */
  debounce?: number
  /** Accessible name; also the visible placeholder default. */
  label?: string
  placeholder?: string
}

export function Search({ value, onChange, onSearch, debounce = 300, label = 'Search', placeholder }: SearchProps) {
  const id = useId()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onSearchRef = useRef(onSearch)
  useEffect(() => { onSearchRef.current = onSearch })

  const run = (query: string) => {
    clearTimeout(timer.current)
    onSearchRef.current?.(query)
  }
  const change = (next: string) => {
    onChange(next)
    clearTimeout(timer.current)
    // Clearing the field searches right away; typing waits for a pause.
    if (next === '') run('')
    else timer.current = setTimeout(() => run(next), debounce)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') run(value)
    if (e.key === 'Escape' && value) { e.preventDefault(); change('') }
  }
  return (
    <div className="search" role="search">
      <svg className="search__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
      <input
        id={id}
        type="search"
        className="search__input"
        aria-label={label}
        placeholder={placeholder ?? `${label}…`}
        value={value}
        onChange={(e) => change(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {value && (
        <button type="button" className="search__clear" aria-label="Clear search" onClick={() => change('')}>
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      )}
    </div>
  )
}
