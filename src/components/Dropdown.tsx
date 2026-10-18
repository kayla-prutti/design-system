import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import './Dropdown.css'

export interface DropdownOption { value: string; label: string; disabled?: boolean }

export interface DropdownProps {
  label: string
  options: DropdownOption[]
  /** Selected option value, or '' for none. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Adds a search box at the top of the list that filters options as you type. */
  searchable?: boolean
  searchPlaceholder?: string
  /**
   * For options loaded from a server: called with the search text after the user pauses typing (see debounce),
   * and with "" when the list closes. When set, the Dropdown does not filter locally; you update options.
   */
  onSearch?: (query: string) => void
  /** Milliseconds to wait after the last keystroke before filtering (and calling onSearch). 0 is instant. */
  debounce?: number
}

const CHECK = <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>

/**
 * Select-only combobox (WAI-ARIA): Arrow keys, Home/End, type-ahead, Enter/Space to pick, Esc to close.
 * With searchable, focus moves to a search box inside the list (editable combobox) and options filter as you type.
 */
export function Dropdown({ label, options, value, onChange, placeholder = 'Select…', searchable = false, searchPlaceholder = 'Search…', onSearch, debounce = 300 }: DropdownProps) {
  const uid = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState('')      // what the search box shows
  const [applied, setApplied] = useState('')  // the debounced text used for filtering
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const queryRef = useRef('')
  const onSearchRef = useRef(onSearch)
  useEffect(() => { onSearchRef.current = onSearch })
  useEffect(() => () => clearTimeout(timer.current), [])

  const visible = searchable && applied && !onSearch ? options.filter((o) => o.label.toLowerCase().includes(applied.trim().toLowerCase())) : options
  const selected = options.find((o) => o.value === value)
  const optionId = (i: number) => `${uid}-opt-${i}`
  const searching = searchable && open

  useEffect(() => { if (open && searchable) searchRef.current?.focus() }, [open, searchable])
  // Keep the highlighted option visible while arrowing through a long list
  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
  }, [open, active]) // eslint-disable-line react-hooks/exhaustive-deps

  const enabled = (i: number) => !visible[i]?.disabled
  const move = (from: number, step: 1 | -1) => {
    let i = from
    for (let n = 0; n < visible.length; n++) {
      i = (i + step + visible.length) % visible.length
      if (enabled(i)) return i
    }
    return from
  }
  const selectedIndex = () => Math.max(0, visible.findIndex((o) => o.value === value))
  const openList = () => { setQuery(''); setApplied(''); setActive(Math.max(0, options.findIndex((o) => o.value === value))); setOpen(true) }
  const close = (refocus = false) => {
    setOpen(false)
    if (queryRef.current) { queryRef.current = ''; setQuery(''); setApplied(''); clearTimeout(timer.current); onSearchRef.current?.('') }
    if (refocus) buttonRef.current?.focus()
  }
  const search = (text: string) => {
    queryRef.current = text
    setQuery(text)
    clearTimeout(timer.current)
    const apply = () => { setApplied(text); setActive(0); onSearchRef.current?.(text) }
    if (debounce > 0 && text !== '') timer.current = setTimeout(apply, debounce)
    else apply()
  }
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) close() }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const choose = (i: number) => {
    if (!visible[i] || !enabled(i)) return
    onChange(visible[i].value)
    close(searchable)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (open) setActive(move(active, 1)); else openList(); break
      case 'ArrowUp': e.preventDefault(); if (open) setActive(move(active, -1)); else openList(); break
      case 'Home': if (open && !searching) { e.preventDefault(); setActive(move(-1, 1)) } break
      case 'End': if (open && !searching) { e.preventDefault(); setActive(move(visible.length, -1)) } break
      case 'Enter': e.preventDefault(); if (open) choose(active); else openList(); break
      case ' ': if (!searching) { e.preventDefault(); if (open) choose(active); else openList() } break
      case 'Escape': if (open) { e.preventDefault(); close(searchable) } break
      case 'Tab': close(); break
      default:
        // Type-ahead for plain dropdowns; searchable ones type into the search box instead.
        if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          const start = (open ? active : selectedIndex()) + 1
          const order = visible.map((_, n) => (start + n) % visible.length)
          const hit = order.find((i) => enabled(i) && visible[i].label.toLowerCase().startsWith(e.key.toLowerCase()))
          if (hit !== undefined) { if (open) setActive(hit); else { openList(); setActive(hit) } }
        }
    }
  }

  const list = (
    <ul id={`${uid}-list`} role="listbox" aria-labelledby={`${uid}-label`} className="dropdown__list">
      {visible.map((o, i) => (
        <li
          key={o.value}
          id={optionId(i)}
          role="option"
          aria-selected={o.value === value}
          aria-disabled={o.disabled || undefined}
          className={`dropdown__option${i === active ? ' is-active' : ''}`}
          onMouseEnter={() => enabled(i) && setActive(i)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => choose(i)}
        >
          {o.label}
          {o.value === value && CHECK}
        </li>
      ))}
    </ul>
  )

  return (
    <div className="dropdown" ref={rootRef}>
      <span id={`${uid}-label`} className="dropdown__label" onClick={() => buttonRef.current?.focus()}>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        // Plain: the button is the combobox. Searchable: the search box inside the list is.
        role={searchable ? undefined : 'combobox'}
        className="dropdown__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${uid}-panel` : undefined}
        aria-labelledby={`${uid}-label ${uid}-value`}
        aria-activedescendant={open && !searchable && visible.length ? optionId(active) : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <span id={`${uid}-value`} className={selected ? undefined : 'dropdown__placeholder'}>{selected?.label ?? placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5" /></svg>
      </button>
      {open && (
        <div id={`${uid}-panel`} className="dropdown__panel">
          {searchable && (
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              className="dropdown__search"
              aria-label={`Search ${label}`}
              aria-expanded="true"
              aria-controls={`${uid}-list`}
              aria-autocomplete="list"
              aria-activedescendant={visible.length ? optionId(active) : undefined}
              placeholder={searchPlaceholder}
              value={query}
              autoComplete="off"
              onChange={(e) => search(e.target.value)}
              onKeyDown={onKeyDown}
            />
          )}
          {visible.length > 0 ? list : <p className="dropdown__empty" role="status">No results</p>}
          {searchable && visible.length > 0 && <span className="sr-only" role="status">{visible.length} results</span>}
        </div>
      )}
    </div>
  )
}
