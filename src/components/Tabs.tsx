import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import './Tabs.css'

export interface TabItem { id: string; label: string; content: ReactNode }

export interface TabsProps {
  items: TabItem[]
  /** Tab open first when uncontrolled. Defaults to the first item. */
  defaultValue?: string
  /** Controlled: id of the open tab. Pair with onChange. */
  value?: string
  /** Called with the tab id whenever the user opens a different tab. */
  onChange?: (id: string) => void
}

/** WAI-ARIA tabs pattern: roving tabindex, arrow/Home/End keys. Only the open panel's content is rendered. */
export function Tabs({ items, defaultValue, value, onChange }: TabsProps) {
  const uid = useId()
  const [inner, setInner] = useState(defaultValue ?? items[0].id)
  const active = value ?? inner
  const setActive = (id: string) => {
    if (id === active) return
    if (value === undefined) setInner(id)
    onChange?.(id)
  }
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})
  const listRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  // Collapse into a menu when the tabs no longer fit; the list stays mounted (hidden) so we can re-measure.
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const check = () => setCollapsed(list.scrollWidth > list.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(list)
    return () => ro.disconnect()
  }, [items])

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false) }
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const last = items.length - 1
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1) :
      e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) :
      e.key === 'Home' ? 0 :
      e.key === 'End' ? last : null
    if (next === null) return
    e.preventDefault()
    const id = items[next].id
    setActive(id)
    refs.current[id]?.focus()
  }

  return (
    <div className="tabs" ref={rootRef}>
      {collapsed && (
        <div className="tabs__menu">
          <button ref={menuBtnRef} type="button" className="tabs__menu-btn" aria-expanded={menuOpen} aria-haspopup="true" aria-label="Sections" onClick={() => setMenuOpen((o) => !o)}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            {items.find((t) => t.id === active)?.label}
          </button>
          {menuOpen && (
            <ul className="tabs__dropdown">
              {items.map((t) => (
                <li key={t.id}>
                  <button type="button" aria-current={active === t.id ? 'true' : undefined} onClick={() => { setActive(t.id); setMenuOpen(false); menuBtnRef.current?.focus() }}>{t.label}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div role="tablist" ref={listRef} className={`tabs__list${collapsed ? ' tabs__list--hidden' : ''}`}>
        {items.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el }}
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className="tabs__tab"
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t) => (
        <div key={t.id} role="tabpanel" id={`${uid}-panel-${t.id}`} aria-labelledby={`${uid}-tab-${t.id}`} hidden={active !== t.id} tabIndex={0} className="tabs__panel">
          {active === t.id && t.content}
        </div>
      ))}
    </div>
  )
}
