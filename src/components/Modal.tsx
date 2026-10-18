import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { StatusIcon } from './icons'
import './Modal.css'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  /** Colors the header and picks its icon. Use danger for destructive actions. */
  variant?: 'default' | 'danger' | 'success' | 'warning'
  /** Body content. */
  children: ReactNode
  /** Footer buttons. Modal controls their layout: right-aligned, Cancel first, main action last. */
  actions?: ReactNode
}

/** Built on native <dialog>: gives focus trapping, Esc to close and inert background for free. */
export function Modal({ open, onClose, title, variant = 'default', children, actions }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`modal modal--${variant}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <header className={`modal__header modal__header--${variant}`}>
        {variant !== 'default' && <span className="modal__icon"><StatusIcon variant={variant} /></span>}
        <h2 id={titleId} className="modal__title">{title}</h2>
        <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </header>
      <div className="modal__body">{children}</div>
      {actions && <footer className="modal__actions">{actions}</footer>}
    </dialog>
  )
}
