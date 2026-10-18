import type { ReactNode } from 'react'
import './Badge.css'

export function Badge({ variant = 'neutral', children }: { variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; children: ReactNode }) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}
