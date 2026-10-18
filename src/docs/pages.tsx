import { useState } from 'react'
import type { ReactNode } from 'react'
import { Badge, Button, Input, Modal, Switch, Tooltip } from '../components'
import type { ButtonSize, ButtonVariant } from '../components'
import { CodeBlock } from './CodeBlock'
import { Tokens } from './Tokens'
import { AGENTIC_PAGES } from './agentic'
import { AGENTIC_PAGES_2 } from './agentic2'
import { ChatDemo, DropdownDemo, ProgressStepsDemo, SearchDemo, TabsDemo, ToastDemo } from './demos'

export interface Prop { name: string; type: string; default?: string; desc: string }
export interface DocPage {
  id: string
  title: string
  desc: string
  preview: () => ReactNode
  /** Import + usage snippet an engineer can paste into their codebase. */
  code: string
  props?: Prop[]
  /** Learning content: when to use it, what to avoid, and accessibility notes. */
  guidance?: { do: string[]; dont: string[]; a11y?: string[] }
  /** Article pages show their content directly, with no Preview/Code/Props sections. */
  article?: boolean
}

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'text', 'soft', 'danger', 'success', 'warning']
const SIZES: ButtonSize[] = ['sm', 'md', 'lg']

/** Interactive: the code block below the stage updates with the controls. */
function ButtonDoc() {
  const [variant, setVariant] = useState<ButtonVariant>('primary')
  const [size, setSize] = useState<ButtonSize>('md')
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const attrs = `${variant !== 'primary' ? ` variant="${variant}"` : ''}${size !== 'md' ? ` size="${size}"` : ''}${loading ? ' loading' : ''}${disabled ? ' disabled' : ''}`
  return (
    <>
      <div className="playground__stage">
        <Button variant={variant} size={size} loading={loading} disabled={disabled}>Text Here</Button>
      </div>
      <div className="playground__controls">
        <label>variant
          <select value={variant} onChange={(e) => setVariant(e.target.value as ButtonVariant)}>
            {VARIANTS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>size
          <select value={size} onChange={(e) => setSize(e.target.value as ButtonSize)}>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <Switch label="loading" checked={loading} onChange={setLoading} />
        <Switch label="disabled" checked={disabled} onChange={setDisabled} />
      </div>
      <h3>Code</h3>
      <CodeBlock code={`import { Button } from '@/components'

<Button${attrs}>Text Here</Button>`} />
    </>
  )
}

function InputPreview() {
  const [email, setEmail] = useState('')
  const invalid = email !== '' && !/^\S+@\S+\.\S+$/.test(email)
  return (
    <div className="stack">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} tooltip="We'll never share it." error={invalid ? 'Enter a valid email address.' : undefined} />
      <Input label="Disabled" disabled defaultValue="Read only" />
    </div>
  )
}

function TooltipPreview() {
  return (
    <div className="tooltip-demo">
      <div>
        <h3>Icon-only button</h3>
        <Tooltip content="Delete">
          <Button variant="text" aria-label="Delete">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h12M7 5V3h4v2M5 5l.7 10h6.6L13 5M7.5 8v4.5M10.5 8v4.5" /></svg>
          </Button>
        </Tooltip>
      </div>
      <div>
        <h3>Truncated text</h3>
        <Tooltip content="quarterly-report-final-v3.pdf">
          <a href="#tooltip" className="truncate-link">quarterly-report-final-v3.pdf</a>
        </Tooltip>
      </div>
      <div>
        <h3>Placement</h3>
        <div className="row row--start" style={{ padding: 'var(--space-2) var(--space-12)' }}>
          <Tooltip content="Top (default)"><Button variant="secondary">Top</Button></Tooltip>
          <Tooltip content="Bottom" placement="bottom"><Button variant="secondary">Bottom</Button></Tooltip>
          <Tooltip content="Left" placement="left"><Button variant="secondary">Left</Button></Tooltip>
          <Tooltip content="Right" placement="right"><Button variant="secondary">Right</Button></Tooltip>
        </div>
      </div>
    </div>
  )
}

function SwitchPreview() {
  const [on, setOn] = useState(true)
  return <Switch label="Email notifications" checked={on} onChange={setOn} />
}

type ModalVariant = 'danger' | 'success' | 'warning'

const MODAL_DOC: Record<ModalVariant, { trigger: string; title: string; body: string; action: string; component: string }> = {
  danger: { trigger: 'Delete project', title: 'Delete project?', body: "<p>This can't be undone.</p>", action: 'Delete', component: 'DeleteProject' },
  success: { trigger: 'Publish site', title: 'Publish site?', body: '<p>Your changes will go live.</p>', action: 'Publish', component: 'PublishSite' },
  warning: { trigger: 'Leave page', title: 'Unsaved changes', body: '<p>You will lose your edits if you leave.</p>', action: 'Leave anyway', component: 'LeavePage' },
}

function modalDocSnippet(v: ModalVariant) {
  const ex = MODAL_DOC[v]
  const btn = ` variant="${v}"`
  return `import { useState } from 'react'
import { Button, Modal } from '@/components'

export function ${ex.component}() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button${btn} onClick={() => setOpen(true)}>${ex.trigger}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        variant="${v}"
        title="${ex.title}"
        actions={
          <>
            <Button variant="soft" onClick={() => setOpen(false)}>Cancel</Button>
            <Button${btn} onClick={() => setOpen(false)}>${ex.action}</Button>
          </>
        }
      >
        ${ex.body}
      </Modal>
    </>
  )
}`
}

function ModalPreview() {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState<ModalVariant>('danger')
  const ex = MODAL_DOC[v]
  const close = () => setOpen(false)
  const variants = Object.keys(MODAL_DOC) as ModalVariant[]
  return (
    <>
      <div className="row row--start">
        {variants.map((t) => (
          <Button key={t} variant={t} onClick={() => { setV(t); setOpen(true) }}>{MODAL_DOC[t].trigger}</Button>
        ))}
      </div>
      <Modal
        open={open}
        onClose={close}
        variant={v}
        title={ex.title}
        actions={
          <>
            <Button variant="soft" onClick={close}>Cancel</Button>
            <Button variant={v} onClick={close}>{ex.action}</Button>
          </>
        }
      >
        <p className="muted">{ex.body.replace(/<\/?p>/g, '')}</p>
      </Modal>

      <h3>Code</h3>
      <div className="playground__controls">
        <label>variant
          <select value={v} onChange={(e) => setV(e.target.value as ModalVariant)}>
            {variants.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <CodeBlock code={modalDocSnippet(v)} />
    </>
  )
}

export const PAGES: DocPage[] = [
  {
    id: 'tokens',
    title: 'Tokens',
    desc: 'Primitives feed semantic tokens; components only use semantic ones. Pick a category to see its preview and code.',
    preview: () => <Tokens />,
    code: '',
  },
  {
    id: 'button',
    title: 'Button',
    desc: 'Variants, sizes, loading and disabled states. Tweak the controls and the code updates.',
    preview: () => <ButtonDoc />,
    code: '',
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'text' | 'soft' | 'danger' | 'success' | 'warning'", default: "'primary'", desc: 'Visual emphasis. soft is a light tint (12% opacity); inside a Modal with a variant it takes that color.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'Control height and padding.' },
      { name: 'loading', type: 'boolean', default: 'false', desc: 'Shows a spinner and blocks clicks.' },
      { name: 'onClick', type: '(event: MouseEvent) => void', desc: 'Runs when the button is clicked. Not called while disabled or loading.' },
      { name: '...rest', type: 'ButtonHTMLAttributes', desc: 'Any other native button prop (type, disabled, aria-label…).' },
    ],
  },
  {
    id: 'input',
    title: 'Input',
    desc: 'Label wired by id, optional info tooltip, errors linked with aria-describedby and announced.',
    preview: () => <InputPreview />,
    code: `import { useState } from 'react'
import { Input } from '@/components'

export function EmailField() {
  const [email, setEmail] = useState('')
  const invalid = email !== '' && !/^\\S+@\\S+\\.\\S+$/.test(email)

  return (
    <Input
      label="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      tooltip="We'll never share it."
      error={invalid ? 'Enter a valid email address.' : undefined}
    />
  )
}`,
    props: [
      { name: 'label', type: 'string', desc: 'Required. Rendered as a <label> tied to the input.' },
      { name: 'tooltip', type: 'string', desc: 'Help text shown in a tooltip on an info icon next to the label.' },
      { name: 'error', type: 'string', desc: 'Error message. Shown below the field; sets aria-invalid.' },
      { name: 'value', type: 'string', desc: 'Current text, for a controlled field. Pair with onChange.' },
      { name: 'onChange', type: '(event: ChangeEvent) => void', desc: 'Runs on every keystroke. Read the text from event.target.value.' },
      { name: '...rest', type: 'InputHTMLAttributes', desc: 'Any other native input prop (type, placeholder, disabled…).' },
    ],
  },
  {
    id: 'search',
    title: 'Search',
    desc: 'Search field with a clear button and built-in debounce. It only reports what the user typed; running and cancelling the request is up to your code. Change the debounce below and the code updates.',
    preview: () => <SearchDemo />,
    code: '',
    props: [
      { name: 'value', type: 'string', desc: 'Required. Controlled value.' },
      { name: 'onChange', type: '(value: string) => void', desc: 'Required. Called on every keystroke, and with "" when cleared. Use it to keep the field in sync.' },
      { name: 'onSearch', type: '(value: string) => void', desc: 'Runs after the debounce delay, on Enter, and immediately when cleared.' },
      { name: 'debounce', type: 'number', default: '300', desc: 'Milliseconds to wait after the last keystroke before onSearch runs.' },
      { name: 'label', type: 'string', default: "'Search'", desc: 'Accessible name for the field.' },
      { name: 'placeholder', type: 'string', desc: 'Defaults to the label followed by an ellipsis.' },
    ],
  },
  {
    id: 'dropdown',
    title: 'Dropdown',
    desc: 'Select one option from a list. Turn on searchable for long lists: a search box filters options after a short pause in typing (debounced). Fully keyboard operable: arrows, Enter to pick, Esc to close.',
    preview: () => <DropdownDemo />,
    code: '',
    props: [
      { name: 'label', type: 'string', desc: 'Required. Visible label, also the accessible name.' },
      { name: 'options', type: '{ value: string; label: string; disabled?: boolean }[]', desc: 'Required. The choices.' },
      { name: 'value', type: 'string', desc: 'Required. Selected option value, or "" for none.' },
      { name: 'onChange', type: '(value: string) => void', desc: 'Required. Called with the chosen option value.' },
      { name: 'placeholder', type: 'string', default: "'Select…'", desc: 'Shown while nothing is selected.' },
      { name: 'searchable', type: 'boolean', default: 'false', desc: 'Adds a search box at the top of the list. Filters by label as you type; shows "No results" when nothing matches.' },
      { name: 'searchPlaceholder', type: 'string', default: "'Search…'", desc: 'Placeholder text inside the search box.' },
      { name: 'onSearch', type: '(query: string) => void', desc: 'Optional, for options loaded from a server. Runs after the debounce delay, and with "" when the list closes. When set, the Dropdown stops filtering locally and you update options.' },
      { name: 'debounce', type: 'number', default: '300', desc: 'Milliseconds to wait after the last keystroke before the list filters (and onSearch runs). Set 0 for instant filtering.' },
    ],
  },
  {
    id: 'switch',
    title: 'Switch',
    desc: 'A controlled on/off toggle for settings that apply immediately.',
    preview: () => <SwitchPreview />,
    code: `import { useState } from 'react'
import { Switch } from '@/components'

export function Notifications() {
  const [on, setOn] = useState(true)
  return <Switch label="Email notifications" checked={on} onChange={setOn} />
}`,
    props: [
      { name: 'label', type: 'string', desc: 'Required. Accessible name and visible text.' },
      { name: 'checked', type: 'boolean', desc: 'Required. Controlled value.' },
      { name: 'onChange', type: '(checked: boolean) => void', desc: 'Required. Called with the new value.' },
    ],
  },
  {
    id: 'tabs',
    title: 'Tabs',
    desc: 'Switch between related views in the same place. Each tab owns a panel: put any UI in its content. Only the open panel renders. Arrow, Home and End keys move between tabs.',
    preview: () => <TabsDemo />,
    code: `import { useState } from 'react'
import { Input, Switch, Tabs } from '@/components'

const [tab, setTab] = useState('profile')
const [email, setEmail] = useState(true)

<Tabs
  value={tab}
  onChange={setTab}
  items={[
    {
      id: 'profile',
      label: 'Profile',
      content: <Input label="Name" defaultValue="Ada Lovelace" />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: <Switch label="Email updates" checked={email} onChange={setEmail} />,
    },
    { id: 'billing', label: 'Billing', content: 'You are on the Free plan.' },
  ]}
/>

// Don't need to track the tab? Skip value/onChange and use defaultValue="billing".`,
    props: [
      { name: 'items', type: '{ id: string; label: string; content: ReactNode }[]', desc: 'Required. One entry per tab. content is the panel that belongs to that tab: a string or any UI.' },
      { name: 'defaultValue', type: 'string', desc: 'Tab id open first. Defaults to the first item. Use when you do not need to control the tab.' },
      { name: 'value', type: 'string', desc: 'Id of the open tab, for when your app controls it (URL, saved setting). Pair with onChange.' },
      { name: 'onChange', type: '(id: string) => void', desc: 'Called with the tab id when the user opens a different tab. Use it to update the URL or load data.' },
    ],
  },
  {
    id: 'progress-steps',
    title: 'Progress Steps',
    desc: 'Shows where the user is in a multi-step flow. Each step has a content panel that shows below while it is current. Add onStepClick to let people click a step to open it. Each step uses a number, a check mark or a ring, and screen readers hear "(complete)", "(current)" or "(upcoming)".',
    preview: () => <ProgressStepsDemo />,
    code: `import { useState } from 'react'
import { Input, ProgressSteps } from '@/components'

const steps = [
  {
    label: 'Account',
    description: 'Create your login',
    content: <Input label="Email" type="email" />,
  },
  {
    label: 'Workspace',
    description: 'Name your team',
    content: <Input label="Workspace name" />,
  },
  {
    label: 'Invite',
    description: 'Add teammates',
    content: <Input label="Teammate email" type="email" />,
  },
  { label: 'Done', description: 'Start building', content: 'You are all set. Welcome aboard!' },
]

export function Onboarding() {
  // current is zero-based: steps before it show a check mark
  const [current, setCurrent] = useState(0)

  return <ProgressSteps steps={steps} current={current} onStepClick={setCurrent} />
}`,
    props: [
      { name: 'steps', type: '{ label: string; description?: string; content?: ReactNode }[]', desc: 'Required. Labels must be unique. content is the panel for that step: a string or any UI. It shows below the steps while the step is current.' },
      { name: 'current', type: 'number', desc: 'Required. Zero-based index of the active step. Use steps.length when everything is done.' },
      { name: 'onStepClick', type: '(index: number) => void', desc: 'Makes every step a button and calls this with the clicked step\'s index. Leave it out for a read-only indicator.' },
    ],
  },
  {
    id: 'modal',
    title: 'Modal',
    desc: 'The base dialog, in three variants: danger, success and warning. Native dialog: focus trap, Esc to close, click backdrop to dismiss.',
    preview: () => <ModalPreview />,
    code: '',
    props: [
      { name: 'open', type: 'boolean', desc: 'Required. Controls visibility.' },
      { name: 'onClose', type: '() => void', desc: 'Required. Fired on Esc, backdrop click, or close.' },
      { name: 'title', type: 'string', desc: 'Required. Dialog heading, used as its accessible name.' },
      { name: 'variant', type: "'default' | 'danger' | 'success' | 'warning'", default: "'default'", desc: 'Colors the header and adds an icon.' },
      { name: 'children', type: 'ReactNode', desc: 'Body content only. Put buttons in actions.' },
      { name: 'actions', type: 'ReactNode', desc: 'Footer buttons. Modal fixes the layout: right-aligned, Cancel first, main action last.' },
    ],
  },
  {
    id: 'toast',
    title: 'Toast',
    desc: 'Tells the user the result of something they just did. Appears at the top center and closes after 5 seconds; pauses while hovered or focused. success = it worked, warning = it worked but has a risky side effect, danger = it failed, default = neutral confirmation. Add an action (Undo, Retry) when the user can respond.',
    preview: () => <ToastDemo />,
    code: `import { useState } from 'react'
import { Button, Switch, ToastProvider, useToast } from '@/components'

// Any component inside <ToastProvider> can call toast()
function ProjectSettings({ onSync }: { onSync: () => Promise<void> }) {
  const { toast } = useToast()
  const [isPublic, setIsPublic] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // It worked, with a risky side effect: warning + Undo
  const changeVisibility = (next: boolean) => {
    setIsPublic(next)
    if (next) {
      toast({
        variant: 'warning',
        title: 'Project is now public',
        description: 'Anyone with the link can view it.',
        action: { label: 'Undo', onClick: () => setIsPublic(false) },
      })
    }
  }

  // success if it worked, danger + Retry if it failed
  const sync = async () => {
    setSyncing(true)
    try {
      await onSync()
      toast({ variant: 'success', title: 'Project synced' })
    } catch {
      toast({
        variant: 'danger',
        title: 'Sync failed',
        description: 'Check your connection and try again.',
        duration: 0,
        action: { label: 'Retry', onClick: sync },
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      <Switch label="Public project" checked={isPublic} onChange={changeVisibility} />
      <Button variant="secondary" loading={syncing} onClick={sync}>Sync now</Button>
    </>
  )
}

// Put the provider once, near the root of your app. It shows the toasts.
export function App({ onSync }: { onSync: () => Promise<void> }) {
  return (
    <ToastProvider>
      <ProjectSettings onSync={onSync} />
    </ToastProvider>
  )
}`,
    props: [
      { name: 'title', type: 'string', desc: 'Required. Short headline.' },
      { name: 'description', type: 'string', desc: 'One extra line of detail.' },
      { name: 'variant', type: "'default' | 'danger' | 'success' | 'warning'", default: "'default'", desc: 'Colors the toast and adds an icon.' },
      { name: 'duration', type: 'number', default: '5000', desc: 'Milliseconds before it closes. 0 keeps it until dismissed.' },
      { name: 'action', type: '{ label: string; onClick: () => void }', desc: 'Adds a button, like Undo. Clicking it runs onClick, then closes the toast. Give it a longer duration so people have time to use it.' },
    ],
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    desc: 'Short, non-interactive help text. Wraps any focusable element: an icon-only button, a link, truncated text. Opens on hover or keyboard focus, closes on Esc or blur.',
    preview: () => <TooltipPreview />,
    code: `import { Button, Tooltip } from '@/components'

// 1. Icon-only button: the tooltip names the action.
//    Keep an aria-label too, so screen readers get the name.
<Tooltip content="Delete">
  <Button variant="text" aria-label="Delete">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M3 5h12M7 5V3h4v2M5 5l.7 10h6.6L13 5" />
    </svg>
  </Button>
</Tooltip>

// 2. Truncated text: show the full value (the trigger must be focusable)
<Tooltip content="quarterly-report-final-v3.pdf">
  <a href="/files/42" className="truncate">quarterly-report-final-v3.pdf</a>
</Tooltip>

// 3. Placement: 'top' (default) | 'bottom' | 'left' | 'right'
<Tooltip content="Shown on the right" placement="right">
  <Button variant="secondary">Right</Button>
</Tooltip>`,
    props: [
      { name: 'content', type: 'string', desc: 'Required. Tooltip text. Keep it short; no links or buttons inside.' },
      { name: 'children', type: 'ReactElement', desc: 'Required. A single focusable trigger (button, link, input).' },
      { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", desc: 'Which side of the trigger it appears on.' },
    ],
  },
  {
    id: 'badge',
    title: 'Badge',
    desc: 'Small status label.',
    preview: () => (
      <div className="row row--start">
        {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((t) => <Badge key={t} variant={t}>{t}</Badge>)}
      </div>
    ),
    code: `import { Badge } from '@/components'

<Badge>Draft</Badge>  {/* neutral is the default */}
<Badge variant="info">Running</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Failed</Badge>`,
    props: [
      { name: 'variant', type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'", default: "'neutral'", desc: 'Color meaning. info is for in-progress states like Running. Always pair with a word, never color alone.' },
      { name: 'children', type: 'ReactNode', desc: 'Label text.' },
    ],
  },
  {
    id: 'chat-input',
    title: 'Chat Input',
    desc: 'Message box for talking to an AI agent. Grows with the text, Enter sends, Shift+Enter adds a line. While the agent responds, Send becomes Stop.',
    preview: () => <ChatDemo />,
    code: `import { useState } from 'react'
import { ChatInput } from '@/components'

const [loading, setLoading] = useState(false)

<ChatInput
  onSend={(message) => { console.log(message); setLoading(true) }}
  onStop={() => setLoading(false)}
  loading={loading}
  suggestions={['Summarize performance', 'Find segments']}
/>`,
    props: [
      { name: 'onSend', type: '(message: string) => void', desc: 'Required. Called with the trimmed text on Enter or Send. Empty messages are ignored.' },
      { name: 'onStop', type: '() => void', desc: 'Called when Stop is clicked while loading.' },
      { name: 'loading', type: 'boolean', default: 'false', desc: 'True while the agent is responding. Swaps Send for Stop and blocks new messages.' },
      { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disables the whole input.' },
      { name: 'placeholder', type: 'string', default: "'Message the agent…'", desc: 'Hint text shown when empty.' },
      { name: 'label', type: 'string', default: "'Message'", desc: 'Accessible name for the text box.' },
      { name: 'suggestions', type: 'string[]', desc: 'Starter prompts shown as chips. Clicking one fills the box so the user can edit before sending.' },
    ],
    guidance: {
      do: ['Offer 2 or 3 starter prompts on an empty chat so people know what the agent can do.', 'Show Stop while the agent responds, so people stay in control of long runs.', 'Keep the hint about Enter and Shift+Enter visible.'],
      dont: ['Send a suggestion straight away. Fill the box and let the person edit it first.', 'Disable the box silently while loading. Say why, or show Stop.'],
      a11y: ['The hint is linked to the text box with aria-describedby.', 'Suggestions are buttons in a labeled group, reachable with Tab.', 'Enter does not send while an IME is composing text.'],
    },
  },
  ...AGENTIC_PAGES,
  ...AGENTIC_PAGES_2,
]
