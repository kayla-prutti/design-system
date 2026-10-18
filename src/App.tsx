import { useEffect, useRef, useState } from 'react'
import { Badge, ToastProvider } from './components'
import { CodeBlock } from './docs/CodeBlock'
import { PAGES } from './docs/pages'
import './App.css'

const idFromHash = () => {
  const id = location.hash.slice(1)
  return PAGES.some((p) => p.id === id) ? id : PAGES[0].id
}

// Sidebar sections, in reading order
const GROUPS = [
  { title: 'Foundations', ids: ['tokens'] },
  { title: 'Components', ids: ['button', 'input', 'search', 'dropdown', 'switch', 'tabs', 'progress-steps', 'modal', 'toast', 'tooltip', 'badge'] },
  { title: 'AI interaction', ids: ['chat-input', 'ai-response', 'structured-output', 'dynamic-form'] },
  { title: 'Orchestration', ids: ['execution-tracker', 'workflow-nodes', 'agent-directory', 'agent-handoff'] },
  { title: 'Data & trust', ids: ['approval-request', 'knowledge-sources', 'tool-execution', 'activity-timeline'] },
  { title: 'Governance', ids: ['policy-guardrails', 'evaluation-suite', 'release-controls'] },
  { title: 'Learn', ids: ['agentic-principles'] },
]

// 16px line icons, one per page, so every link reads as a clickable item
const ICONS: Record<string, string> = {
  tokens: 'M8 2a6 6 0 1 0 0 12c1 0 1.3-.7 1-1.4-.4-.8.2-1.6 1-1.6h1.5A2.5 2.5 0 0 0 14 8.5 6 6 0 0 0 8 2ZM5 7.5h.01M8 5h.01M11 7.5h.01',
  button: 'M2.5 5.5h11a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1ZM5.5 8h5',
  input: 'M2 4.5h12v7H2zM5 6.5v3',
  search: 'M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM10.5 10.5 14 14',
  dropdown: 'M2 4.5h12v7H2zM9.5 7l1.5 1.5L12.5 7',
  switch: 'M5.5 4.5h5a3.5 3.5 0 1 1 0 7h-5a3.5 3.5 0 1 1 0-7ZM10.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  tabs: 'M1.5 13.5V5.5h4v-2h4v2h5v8z M5.5 5.5h4',
  'progress-steps': 'M3 8a1.5 1.5 0 1 0 0 .01M8 8a1.5 1.5 0 1 0 0 .01M13 8a1.5 1.5 0 1 0 0 .01M4.5 8h2M9.5 8h2',
  modal: 'M2.5 3.5h11v9h-11zM2.5 6h11',
  toast: 'M3 3.5h10a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H6l-3 2.5v-2.5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z',
  tooltip: 'M2.5 2.5h11v7h-4L8 12l-1.5-2.5h-4zM8 5v2.5',
  badge: 'M2 5.5h7l4 2.5-4 2.5H2zM5 8h.01',
  'chat-input': 'M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7l-3 3v-3a2 2 0 0 1-2-2zM5.5 6.5h5',
  'execution-tracker': 'M2 13.5h12M4 11V8M8 11V5M12 11V2.5',
  'approval-request': 'M8 1.8 13 3.8v4c0 3-2.2 5.3-5 6.4-2.8-1.1-5-3.4-5-6.4v-4ZM5.8 8l1.6 1.6L10.4 6.5',
  'tool-execution': 'M9.5 2.5a3 3 0 0 0 3.5 4l-6 6a1.5 1.5 0 0 1-2-2l6-6a3 3 0 0 0-1.5-2Z',
  'ai-response': 'M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8l5.1-1.4Z',
  'activity-timeline': 'M4 2.5v11M4 4.5h.01M4 8h.01M4 11.5h.01M7 4.5h6M7 8h6M7 11.5h4',
  'workflow-nodes': 'M3 2.5h4v3H3zM9 10.5h4v3H9zM5 5.5v3a2 2 0 0 0 2 2h2',
  'knowledge-sources': 'M3 4c0 1.1 2.2 2 5 2s5-.9 5-2-2.2-2-5-2-5 .9-5 2Zm0 0v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2',
  'agent-directory': 'M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h4v4h-4z',
  'dynamic-form': 'M2.5 2.5h11v11h-11zM5 5.5h6M5 8h6M5 10.5h3',
  'agent-handoff': 'M2 5.5h10M9 2.5l3 3-3 3M14 10.5H4M7 7.5l-3 3 3 3',
  'policy-guardrails': 'M2.5 2.5h11v11h-11zM5.5 8l1.8 1.8L10.5 6.5',
  'evaluation-suite': 'M6 1.5h4M7 1.5v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9 5.5v-4M5 10h6',
  'release-controls': 'M8 1.5c2.5 1.5 4 4 4 7l-2 2H6l-2-2c0-3 1.5-5.5 4-7ZM6 10.5l-1.5 3M10 10.5l1.5 3M8 6.5h.01',
  'structured-output': 'M5.5 2.5c-1.5 0-2 .7-2 2v1.5c0 1-.5 2-1.5 2 1 0 1.5 1 1.5 2v1.5c0 1.3.5 2 2 2M10.5 2.5c1.5 0 2 .7 2 2v1.5c0 1 .5 2 1.5 2-1 0-1.5 1-1.5 2v1.5c0 1.3-.5 2-2 2',
  'agentic-principles': 'M2.5 3h4a2 2 0 0 1 1.5.7A2 2 0 0 1 9.5 3h4v10h-4a1.5 1.5 0 0 0-1.5 1 1.5 1.5 0 0 0-1.5-1h-4Z',
}

export default function App() {
  const [activeId, setActiveId] = useState(idFromHash)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const shownPage = useRef(activeId)

  useEffect(() => {
    const onHash = () => { setActiveId(idFromHash()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const page = PAGES.find((p) => p.id === activeId)!
  const groupIndex = GROUPS.findIndex((g) => g.ids.includes(page.id))

  // Each page gets its own title (WCAG 2.4.2), and focus moves to its heading
  // so screen reader and keyboard users land on the new content.
  useEffect(() => {
    document.title = `${page.title} · Design System`
    // Only move focus when the user navigates, not on first load
    if (shownPage.current === page.id) return
    shownPage.current = page.id
    headingRef.current?.focus()
  }, [page])

  const link = (id: string) => {
    const p = PAGES.find((x) => x.id === id)
    return p && (
      <li key={id}>
        <a href={`#${id}`} aria-current={id === activeId ? 'page' : undefined}>
          <svg className="sidebar__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[id]} /></svg>
          {p.title}
        </a>
      </li>
    )
  }

  return (
    <ToastProvider>
    <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); headingRef.current?.focus() }}>Skip to content</a>
    <div className="layout">
      <aside className="sidebar">
        <a href="#tokens" className="sidebar__brand"><span className="sidebar__logo" aria-hidden="true" />Design System <Badge variant="success">v0.1</Badge></a>
        <nav aria-label="Design system" className="sidebar__nav">
          {GROUPS.map((g) => (
            <div key={g.title} className="sidebar__group">
              <h2 className="sidebar__heading">{g.title}</h2>
              <ul>{g.ids.map(link)}</ul>
            </div>
          ))}
        </nav>
      </aside>

      <main id="main" className="page" key={page.id}>
        <div>
          {groupIndex >= 0 && <p className="page__eyebrow">{String(groupIndex + 1).padStart(2, '0')} / {GROUPS[groupIndex].title}</p>}
          <h1 ref={headingRef} tabIndex={-1}>{page.title}</h1>
          <p className="page__desc">{page.desc}</p>
        </div>

        {page.article ? page.preview() : (
          <section className="section" aria-labelledby="preview-h">
            <h2 id="preview-h">Preview</h2>
            <div className="card">{page.preview()}</div>
          </section>
        )}

        {page.guidance && (
          <section className="section" aria-labelledby="guide-h">
            <h2 id="guide-h">Guidelines</h2>
            <div className="guide">
              <div className="guide__col guide__col--do">
                <h3><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>Do</h3>
                <ul>{page.guidance.do.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className="guide__col guide__col--dont">
                <h3><svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8" /></svg>Don't</h3>
                <ul>{page.guidance.dont.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              {page.guidance.a11y && (
                <div className="guide__col guide__col--a11y">
                  <h3><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="2.8" r="1.3" /><path d="M3 5.5h10M8 5.5v4M8 9.5l-2.5 4.5M8 9.5l2.5 4.5" /></svg>Accessibility</h3>
                  <ul>{page.guidance.a11y.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              )}
            </div>
          </section>
        )}

        {page.code && (
          <section className="section" aria-labelledby="code-h">
            <h2 id="code-h">Code</h2>
            <CodeBlock code={page.code} />
          </section>
        )}

        {page.props && (
          <section className="section" aria-labelledby="props-h">
            <h2 id="props-h">Props</h2>
            {/* Focusable so the table can be scrolled sideways with the keyboard on small screens */}
            <div className="card card--flush" tabIndex={0} role="region" aria-labelledby="props-h">
              <table className="props">
                <caption className="sr-only">{page.title} props</caption>
                <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Description</th></tr></thead>
                <tbody>
                  {page.props.map((p) => (
                    <tr key={p.name}>
                      <th scope="row"><code>{p.name}</code></th>
                      <td><code>{p.type}</code></td>
                      <td>{p.default ? <code>{p.default}</code> : <span aria-label="none">—</span>}</td>
                      <td>{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
    </ToastProvider>
  )
}
