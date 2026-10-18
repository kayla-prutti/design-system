import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import './Disclosure.css'

/** Show/hide button for secondary detail (payloads, sources, logs). Used inside the agentic components. */
export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="disclosure">
      <button type="button" className="disclosure__btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5" /></svg>
      </button>
      <div id={id} className="disclosure__panel" hidden={!open}>{children}</div>
    </div>
  )
}
