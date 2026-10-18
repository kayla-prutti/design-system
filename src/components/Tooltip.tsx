import { useEffect, useId, useState } from 'react'
import type { ReactElement } from 'react'
import './Tooltip.css'

export interface TooltipProps {
  content: string
  /** A single focusable element (button, link, input). */
  children: ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

/** Shows on hover and keyboard focus, dismisses with Esc. Linked to the trigger via aria-describedby. */
export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  // Esc closes it even when it was opened by hover and focus is elsewhere (WCAG 1.4.13)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <span
      className="tooltip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={id} className="tooltip__trigger">{children}</span>
      <span role="tooltip" id={id} className={`tooltip__bubble tooltip__bubble--${placement}`} hidden={!open}>{content}</span>
    </span>
  )
}
