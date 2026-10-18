export type StatusVariant = 'danger' | 'success' | 'warning'

// Each variant has a different shape, so meaning never depends on color alone.
const PATHS = {
  danger: <><circle cx="8" cy="8" r="6.5" /><path d="M8 4.8v3.8M8 11v.1" /></>,
  warning: <path d="M8 3 14 13H2L8 3ZM8 7v3M8 11.6v.1" />,
  success: <path d="m4 8.5 2.8 2.8L12 5.5" />,
}

export function StatusIcon({ variant, size = 20 }: { variant: StatusVariant; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[variant]}
    </svg>
  )
}
