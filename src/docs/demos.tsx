import { useEffect, useRef, useState } from 'react'
import { Button, ChatInput, Dropdown, Input, ProgressSteps, Search, Switch, Tabs, useToast } from '../components'
import { CodeBlock } from './CodeBlock'

const FILES = ['report.pdf', 'logo.svg', 'notes.txt']

/** Stand-in for a server call: fails the first time, succeeds on retry. */
function makeFakeSync() {
  let attempts = 0
  return () => new Promise<void>((resolve, reject) => {
    attempts++
    setTimeout(() => (attempts === 1 ? reject(new Error('offline')) : resolve()), 800)
  })
}

export function ToastDemo() {
  const { toast } = useToast()
  const [name, setName] = useState('Design System')
  const [savedName, setSavedName] = useState('Design System')
  const [isPublic, setIsPublic] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [fakeSync] = useState(makeFakeSync)
  const [files, setFiles] = useState(FILES)

  // Success: the action worked
  const save = () => {
    setSavedName(name)
    toast({ variant: 'success', title: 'Project renamed', description: `It is now called "${name}".` })
  }

  // Warning: the action worked but has a risky side effect, so offer Undo
  const changeVisibility = (next: boolean) => {
    setIsPublic(next)
    if (next) {
      toast({
        variant: 'warning',
        title: 'Project is now public',
        description: 'Anyone with the link can view it.',
        duration: 8000,
        action: { label: 'Undo', onClick: () => setIsPublic(false) },
      })
    }
  }

  // Danger: the action failed, so offer Retry. Success when it works.
  const sync = async () => {
    setSyncing(true)
    try {
      await fakeSync()
      toast({ variant: 'success', title: 'Project synced' })
    } catch {
      toast({ variant: 'danger', title: 'Sync failed', description: 'Check your connection and try again.', duration: 0, action: { label: 'Retry', onClick: sync } })
    } finally {
      setSyncing(false)
    }
  }

  // Default: neutral confirmation, with Undo for a reversible delete
  const remove = (file: string) => {
    const index = files.indexOf(file)
    setFiles((f) => f.filter((x) => x !== file))
    toast({
      title: `${file} deleted`,
      duration: 8000,
      action: { label: 'Undo', onClick: () => setFiles((f) => [...f.slice(0, index), file, ...f.slice(index)]) },
    })
  }

  return (
    <div className="toast-demo">
      <section className="toast-demo__row">
        <div className="toast-demo__label"><strong>Rename</strong><span className="muted">Success after saving</span></div>
        <div className="row row--start toast-demo__control">
          <Input label="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button disabled={name.trim() === '' || name === savedName} onClick={save}>Save</Button>
        </div>
      </section>
      <section className="toast-demo__row">
        <div className="toast-demo__label"><strong>Visibility</strong><span className="muted">Warning with Undo</span></div>
        <div className="toast-demo__control"><Switch label="Public project" checked={isPublic} onChange={changeVisibility} /></div>
      </section>
      <section className="toast-demo__row">
        <div className="toast-demo__label"><strong>Sync</strong><span className="muted">Danger with Retry (fails the first time)</span></div>
        <div className="toast-demo__control"><Button variant="secondary" loading={syncing} onClick={sync}>Sync now</Button></div>
      </section>
      <section className="toast-demo__row">
        <div className="toast-demo__label"><strong>Files</strong><span className="muted">Default with Undo</span></div>
        <ul className="file-list toast-demo__control">
          {files.map((f) => (
            <li key={f}>
              <span>{f}</span>
              <Button size="sm" variant="soft" onClick={() => remove(f)}>Delete</Button>
            </li>
          ))}
          {files.length === 0 && <li className="muted">No files left.</li>}
        </ul>
      </section>
    </div>
  )
}

const STEPS = [
  { label: 'Account', description: 'Create your login', content: <div className="stack"><Input label="Email" type="email" defaultValue="ada@example.com" /><Input label="Password" type="password" defaultValue="secret-pass" /></div> },
  { label: 'Workspace', description: 'Name your team', content: <div className="stack"><Input label="Workspace name" defaultValue="Analytical Engines" /></div> },
  { label: 'Invite', description: 'Add teammates', content: <div className="stack"><Input label="Teammate email" type="email" placeholder="name@company.com" /></div> },
  { label: 'Done', description: 'Start building', content: 'You are all set. Welcome aboard!' },
]

export function ProgressStepsDemo() {
  const [current, setCurrent] = useState(1)
  return (
    <div className="steps-stage">
      <ProgressSteps steps={STEPS} current={current} onStepClick={setCurrent} />
      <p className="steps-stage__caption" role="status">Step {current + 1} of {STEPS.length} · click a step to open it</p>
    </div>
  )
}

const ITEMS = ['Design tokens', 'Button', 'Dropdown', 'Modal', 'Search', 'Tabs', 'Toast', 'Tooltip']

const DEBOUNCES = [0, 300, 600, 1000]

/** Interactive: change the debounce and watch how long "Last search" waits after you stop typing. */
export function SearchDemo() {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')   // updates after the debounce delay
  const [debounce, setDebounce] = useState(300)
  const items = ITEMS.filter((i) => i.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <div className="stack">
        <Search value={text} onChange={setText} onSearch={setQuery} debounce={debounce} placeholder="Search components…" />
        <p className="muted" role="status">Last search: “{query}” · {items.length} result{items.length === 1 ? '' : 's'}</p>
        <ul className="demo-list">{items.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
      <div className="playground__controls">
        <label>debounce (ms)
          <select value={debounce} onChange={(e) => setDebounce(Number(e.target.value))}>
            {DEBOUNCES.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <h3>Code</h3>
      <CodeBlock code={`import { useState } from 'react'
import { Search } from '@/components'

const [text, setText] = useState('')
const [query, setQuery] = useState('')  // updates ${debounce === 0 ? 'on every keystroke' : `${debounce}ms after typing stops`}, on Enter, or when cleared

<Search
  value={text}
  onChange={setText}
  onSearch={setQuery}
  debounce={${debounce}}
  placeholder="Search components…"
/>
<p>Showing results for: {query}</p>`} />
    </>
  )
}

const COUNTRIES = ['Australia', 'Canada', 'France', 'Germany', 'India', 'Japan', 'Singapore', 'Vietnam']

/** Interactive: the code block below the stage updates with the toggles. */
export function DropdownDemo() {
  const [country, setCountry] = useState('')
  const [searchable, setSearchable] = useState(true)
  const [withDisabled, setWithDisabled] = useState(false)

  const options = COUNTRIES.map((c) => ({ value: c.toLowerCase(), label: c, disabled: withDisabled && c === 'Germany' }))
  const optionLines = options
    .map((o) => `    { value: '${o.value}', label: '${o.label}'${o.disabled ? ', disabled: true' : ''} },`)
    .join('\n')
  const code = `import { useState } from 'react'
import { Dropdown } from '@/components'

const [country, setCountry] = useState('')

<Dropdown
  label="Country"${searchable ? '\n  searchable' : ''}
  value={country}
  onChange={setCountry}
  placeholder="Choose a country"
  options={[
${optionLines}
  ]}
/>`

  return (
    <>
      <div className="playground__stage playground__stage--top">
        <div className="stack">
          {/* key remounts the dropdown so toggling searchable starts from a clean state */}
          <Dropdown
            key={String(searchable)}
            label="Country"
            searchable={searchable}
            value={country}
            onChange={setCountry}
            placeholder="Choose a country"
            options={options}
          />
        </div>
      </div>
      <div className="playground__controls">
        <Switch label="searchable" checked={searchable} onChange={setSearchable} />
        <Switch label="disabled option" checked={withDisabled} onChange={setWithDisabled} />
      </div>
      <h3>Code</h3>
      <CodeBlock code={code} />
    </>
  )
}

interface Msg { from: 'you' | 'agent'; text: string }

export function ChatDemo() {
  const [messages, setMessages] = useState<Msg[]>([{ from: 'agent', text: 'Hi! Ask me anything about the design system.' }])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const send = (text: string) => {
    setMessages((m) => [...m, { from: 'you', text }])
    setLoading(true)
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { from: 'agent', text: `You asked: "${text}". (This is a demo reply.)` }])
      setLoading(false)
    }, 1800)
  }
  const stop = () => {
    clearTimeout(timer.current)
    setLoading(false)
    setMessages((m) => [...m, { from: 'agent', text: 'Stopped.' }])
  }

  return (
    <div className="chat-demo">
      <div className="chat-demo__log" role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((m, i) => <p key={i} className={`chat-demo__msg chat-demo__msg--${m.from}`}><span className="sr-only">{m.from === 'you' ? 'You: ' : 'Agent: '}</span>{m.text}</p>)}
        {loading && <p className="chat-demo__msg chat-demo__msg--agent muted">Thinking…</p>}
      </div>
      <ChatInput onSend={send} onStop={stop} loading={loading} suggestions={['Summarize performance', 'Find segments']} />
    </div>
  )
}

export function TabsDemo() {
  const [tab, setTab] = useState('profile')
  const [email, setEmail] = useState(true)
  const [push, setPush] = useState(false)
  return (
    <div className="stack stack--wide">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'profile', label: 'Profile', content: <div className="stack"><Input label="Name" defaultValue="Ada Lovelace" /><Input label="Email" type="email" defaultValue="ada@example.com" /></div> },
          { id: 'notifications', label: 'Notifications', content: <div className="stack"><Switch label="Email updates" checked={email} onChange={setEmail} /><Switch label="Push notifications" checked={push} onChange={setPush} /></div> },
          { id: 'billing', label: 'Billing', content: 'You are on the Free plan.' },
        ]}
      />
      <p className="muted">Open tab: <code>{tab}</code></p>
    </div>
  )
}
