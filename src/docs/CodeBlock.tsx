import { useState } from 'react'

/** Code snippet with a copy button, for pasting into a codebase. */
export function CodeBlock({ code, label = 'tsx' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <div className="codeblock">
      <div className="codeblock__bar">
        <span>{label}</span>
        <button type="button" onClick={copy}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            {copied ? <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" /> : <><rect x="5" y="5" width="8" height="9" rx="1.5" /><path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H10" /></>}
          </svg>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <span className="sr-only" role="status">{copied ? 'Code copied to clipboard' : ''}</span>
      </div>
      {/* tabIndex lets keyboard users scroll long lines (WCAG 2.1.1) */}
      <pre className="code" tabIndex={0} aria-label={`${label} code example`}><code>{code}</code></pre>
    </div>
  )
}
