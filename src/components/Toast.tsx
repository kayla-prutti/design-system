import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { StatusIcon } from './icons'
import './Toast.css'

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'danger' | 'success' | 'warning'
  /** Milliseconds before it closes. 0 keeps it until dismissed. */
  duration?: number
  /** A button inside the toast, e.g. Undo. Clicking it runs onClick and closes the toast. */
  action?: { label: string; onClick: () => void }
}
interface ToastItem extends ToastOptions { id: number }

const ToastContext = createContext<{ toast: (options: ToastOptions) => void } | null>(null)

/** Returns toast(); call it from any component inside <ToastProvider>. */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { variant = 'default' } = item
  // Toasts with a button get at least 10s so people have time to reach it (WCAG 2.2.1)
  const duration = item.duration === 0 ? 0 : Math.max(item.duration ?? 5000, item.action ? 10000 : 0)
  const [paused, setPaused] = useState(false)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })
  // Pause the timer while the pointer or focus is on the toast, so it never vanishes mid-read.
  useEffect(() => {
    if (paused || duration === 0) return
    const timer = setTimeout(() => closeRef.current(), duration)
    return () => clearTimeout(timer)
  }, [paused, duration])

  return (
    <div
      className={`toast toast--${variant}`}
      // The region announces politely; errors interrupt
      role={variant === 'danger' ? 'alert' : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {variant !== 'default' && <span className="toast__icon"><StatusIcon variant={variant} /></span>}
      <div className="toast__text">
        <strong>{item.title}</strong>
        {item.description && <span className="toast__desc">{item.description}</span>}
      </div>
      {item.action && (
        <button type="button" className="toast__action" onClick={() => { item.action?.onClick(); onClose() }}>{item.action.label}</button>
      )}
      <button type="button" className="toast__close" aria-label={`Dismiss: ${item.title}`} onClick={onClose}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const toast = useCallback((options: ToastOptions) => {
    setItems((prev) => [...prev, { ...options, id: nextId.current++ }].slice(-5))
  }, [])
  const close = useCallback((id: number) => setItems((prev) => prev.filter((t) => t.id !== id)), [])
  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="region" aria-label="Notifications" aria-live="polite">
        {items.map((item) => <ToastCard key={item.id} item={item} onClose={() => close(item.id)} />)}
      </div>
    </ToastContext.Provider>
  )
}
