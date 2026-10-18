import { useState } from 'react'
import { ActivityTimeline, AIResponse, ApprovalRequest, Button, Dropdown, ExecutionTracker, ToolExecution, useToast } from '../components'
import type { ActivityEvent, StepStatus, TrackerStep } from '../components'
import type { DocPage } from './pages'

/* ---------- Execution Tracker ---------- */

const RUN: { id: string; label: string; detail?: string }[] = [
  { id: 'fetch', label: 'Retrieve CRM data', detail: '1,240 contacts' },
  { id: 'analyze', label: 'Analyze segments' },
  { id: 'draft', label: 'Draft campaign' },
  { id: 'approve', label: 'Request approval' },
]

function trackerSteps(position: number, failed: boolean): TrackerStep[] {
  return RUN.map((s, i) => {
    let status: StepStatus = i < position ? 'done' : i === position ? 'running' : 'pending'
    if (i === position && failed) status = 'failed'
    if (i === position && s.id === 'approve' && !failed) status = 'waiting'
    return { ...s, status, detail: status === 'failed' ? 'Timed out after 30 seconds' : s.detail }
  })
}

function ExecutionTrackerDemo() {
  const [position, setPosition] = useState(1)
  const [failed, setFailed] = useState(false)
  const finished = position >= RUN.length
  const steps = trackerSteps(position, failed)
  const note = failed ? 'The run stopped. Retry the step or reset the run.'
    : RUN[position]?.id === 'approve' ? 'Paused for human approval. No external actions will run until someone approves.'
    : finished ? 'All steps finished.' : undefined

  return (
    <div className="agentic-demo">
      <ExecutionTracker title="Customer segmentation" steps={steps} note={note} />
      <div className="row row--start">
        <Button disabled={finished || failed} onClick={() => setPosition((p) => p + 1)}>Advance run</Button>
        <Button variant="secondary" disabled={finished || failed} onClick={() => setFailed(true)}>Simulate failure</Button>
        <Button variant="secondary" disabled={!failed} onClick={() => setFailed(false)}>Retry</Button>
        <Button variant="text" onClick={() => { setPosition(0); setFailed(false) }}>Reset</Button>
      </div>
    </div>
  )
}

/* ---------- Approval Request ---------- */

function ApprovalDemo() {
  const { toast } = useToast()
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  return (
    <div className="agentic-demo">
      <ApprovalRequest
        title="Authorization requested"
        description="The agent wants to send 240 emails using your marketing email tool."
        details={[{ label: 'Requested action', value: 'Send customer outreach' }, { label: 'Audience size', value: '240 recipients' }]}
        risk="medium"
        requestedBy="Campaign agent"
        requestedAt="10:42 AM"
        payload={'{\n  "action": "send_email",\n  "recipients": 240,\n  "template": "q4-reengagement"\n}'}
        status={status}
        onApprove={() => { setStatus('approved'); toast({ variant: 'success', title: 'Request approved', description: 'The agent will send the emails.' }) }}
        onReject={() => { setStatus('rejected'); toast({ title: 'Request rejected', description: 'No emails were sent.' }) }}
      />
      {status !== 'pending' && <div><Button variant="text" onClick={() => setStatus('pending')}>Reset demo</Button></div>}
    </div>
  )
}

/* ---------- Tool Execution ---------- */

function ToolExecutionDemo() {
  const [status, setStatus] = useState<'running' | 'success' | 'error'>('success')
  const run = (fail: boolean) => {
    setStatus('running')
    setTimeout(() => setStatus(fail ? 'error' : 'success'), 900)
  }
  return (
    <div className="agentic-demo">
      <ToolExecution
        tool="CRM"
        operation="Query contacts"
        status={status}
        access="Read-only"
        duration="1.2s"
        callId="#003"
        summary="240 results returned"
        request={'GET /contacts?segment=lapsed&limit=500'}
        response={'{ "count": 240, "fields": ["email", "last_order"] }'}
        error="The CRM did not respond within 10 seconds."
        onRetry={() => run(false)}
      />
      <div className="row row--start">
        <Button variant="secondary" disabled={status === 'running'} onClick={() => run(false)}>Run call</Button>
        <Button variant="secondary" disabled={status === 'running'} onClick={() => run(true)}>Simulate error</Button>
      </div>
    </div>
  )
}

/* ---------- AI Response ---------- */

const ANSWERS = [
  'Returning customers who engaged in the last 30 days are the strongest audience for your next campaign. Prioritize a personalized re-engagement message.',
  'Customers who bought twice in Q3 respond best to early-access offers. Lead with a time-limited preview, then follow up after 3 days.',
]

function AIResponseDemo() {
  const { toast } = useToast()
  const [answer, setAnswer] = useState(0)
  return (
    <AIResponse
      title="Campaign recommendation"
      copyText={ANSWERS[answer]}
      sources={[
        { title: 'CRM contact activity', excerpt: '1,240 contacts opened an email in the last 30 days; 31% clicked through.' },
        { title: 'Q3 campaign report', excerpt: 'Re-engagement emails outperformed discount emails by 2.4x on conversion.' },
      ]}
      onRegenerate={() => setAnswer((a) => (a + 1) % ANSWERS.length)}
      onFeedback={(v) => toast({ title: v === 'helpful' ? 'Marked as helpful' : 'Marked as not helpful' })}
    >
      <p>{ANSWERS[answer]}</p>
    </AIResponse>
  )
}

/* ---------- Activity Timeline ---------- */

const EVENTS: ActivityEvent[] = [
  { id: '4', title: 'Approval requested', actor: 'Campaign agent', kind: 'agent', time: '2026-10-17T10:42', timeLabel: '10:42 AM' },
  { id: '3', title: 'Campaign analysis completed', actor: 'Campaign agent', kind: 'agent', time: '2026-10-17T10:41', timeLabel: '10:41 AM' },
  { id: '2', title: 'Contacts retrieved from CRM', actor: 'CRM integration', kind: 'integration', time: '2026-10-17T10:39', timeLabel: '10:39 AM' },
  { id: '1', title: 'Workflow started by Sam Lee', actor: 'Sam Lee', kind: 'human', time: '2026-10-17T10:38', timeLabel: '10:38 AM' },
]

function ActivityTimelineDemo() {
  const [kind, setKind] = useState('')
  const shown = kind ? EVENTS.filter((e) => e.kind === kind) : EVENTS
  const exportCsv = () => {
    const rows = [['time', 'title', 'actor', 'kind'], ...shown.map((e) => [e.time, e.title, e.actor, e.kind])]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'activity.csv' })
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="agentic-demo">
      <div className="row row--start timeline-toolbar">
        <div className="timeline-toolbar__filter">
          <Dropdown label="Show" value={kind} onChange={setKind} placeholder="All activity" options={[
            { value: '', label: 'All activity' }, { value: 'agent', label: 'Agents' }, { value: 'human', label: 'People' }, { value: 'integration', label: 'Integrations' },
          ]} />
        </div>
        <Button variant="secondary" onClick={exportCsv}>Export .csv</Button>
      </div>
      <ActivityTimeline events={shown} label="Workflow activity" />
    </div>
  )
}

/* ---------- Learn: principles ---------- */

const PRINCIPLES = [
  { title: 'Show status beyond color', body: 'Every state has a word and a shape: a check for done, a pause for waiting, an X for failed. People who cannot tell red from green still know what happened.', see: [['execution-tracker', 'Execution Tracker'], ['activity-timeline', 'Activity Timeline']] },
  { title: 'Make human control points obvious', body: 'Before an agent does something hard to undo, such as sending email or spending money, stop and ask. Say what will happen, how big it is, and how risky. Approve and Reject must be easy to find.', see: [['approval-request', 'Approval Request'], ['chat-input', 'Chat Input (Stop)']] },
  { title: 'Let people inspect what the AI did', body: 'Label AI output as AI-generated, show its sources, and keep the raw request and response one click away. Trust comes from being able to check.', see: [['ai-response', 'AI Response'], ['tool-execution', 'Tool Execution']] },
  { title: 'Give consistent focus and error feedback', body: 'Errors say what went wrong and what to do next, with a Retry where it makes sense. Focus rings look the same everywhere, and messages are announced to screen readers.', see: [['tool-execution', 'Tool Execution'], ['toast', 'Toast']] },
]

function Principles() {
  return (
    <div className="principles">
      {PRINCIPLES.map((p, i) => (
        <article key={p.title} className="principle">
          <span className="principle__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <h2 className="principle__title">{p.title}</h2>
          <p className="principle__body">{p.body}</p>
          <p className="principle__see">See it in: {p.see.map(([id, name], j) => <span key={id}>{j > 0 && ', '}<a href={`#${id}`}>{name}</a></span>)}</p>
        </article>
      ))}
    </div>
  )
}

/* ---------- Pages ---------- */

export const AGENTIC_PAGES: DocPage[] = [
  {
    id: 'execution-tracker',
    title: 'Execution Tracker',
    desc: 'Shows each step an agent takes, so people can see what it is doing, how far along it is, and exactly where it stopped.',
    preview: () => <ExecutionTrackerDemo />,
    code: `import { ExecutionTracker } from '@/components'

<ExecutionTracker
  title="Customer segmentation"
  steps={[
    { id: 'fetch', label: 'Retrieve CRM data', status: 'done', detail: '1,240 contacts' },
    { id: 'analyze', label: 'Analyze segments', status: 'done' },
    { id: 'draft', label: 'Draft campaign', status: 'running' },
    { id: 'approve', label: 'Request approval', status: 'pending' },
  ]}
  note="No external actions will run until someone approves."
/>`,
    props: [
      { name: 'title', type: 'string', desc: 'Required. What the agent is working on.' },
      { name: 'steps', type: "{ id: string; label: string; status: 'done' | 'running' | 'waiting' | 'failed' | 'pending'; detail?: string }[]", desc: 'Required. The run, in order. The overall badge and progress bar are worked out from these.' },
      { name: 'note', type: 'string', desc: 'One line under the steps, e.g. why the run is paused. Announced when it changes.' },
    ],
    guidance: {
      do: ['Name steps by outcome ("Retrieve CRM data"), not by internal function names.', 'Use waiting for steps that need a person, and say who in the note.', 'Put the failure reason in the step detail so people can act on it.'],
      dont: ['Show a progress bar alone. People need to know which step is running.', 'Hide failed steps or jump past them silently.'],
      a11y: ['The progress bar has a text value ("2 of 4 steps done").', 'Each status is a word plus an icon, never color alone.', 'The note is a live region, so pauses and failures are announced.'],
    },
  },
  {
    id: 'approval-request',
    title: 'Approval Request',
    desc: 'A human checkpoint before an agent takes a high-impact action. It says what will happen, how big it is, and how risky, then asks for a decision.',
    preview: () => <ApprovalDemo />,
    code: `import { useState } from 'react'
import { ApprovalRequest } from '@/components'

export function SendApproval() {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')

  return (
    <ApprovalRequest
      title="Authorization requested"
      description="The agent wants to send 240 emails using your marketing email tool."
      details={[
        { label: 'Requested action', value: 'Send customer outreach' },
        { label: 'Audience size', value: '240 recipients' },
      ]}
      risk="medium"
      requestedBy="Campaign agent"
      requestedAt="10:42 AM"
      payload='{ "action": "send_email", "recipients": 240 }'
      status={status}
      onApprove={() => setStatus('approved')}
      onReject={() => setStatus('rejected')}
    />
  )
}`,
    props: [
      { name: 'title', type: 'string', desc: 'Required. What is being asked for.' },
      { name: 'description', type: 'string', desc: 'Required. Plain-language summary of the action.' },
      { name: 'details', type: '{ label: string; value: string }[]', desc: 'Key facts a reviewer needs, like action and audience size.' },
      { name: 'risk', type: "'low' | 'medium' | 'high'", desc: 'Required. Shown as a word and a shape (circle, triangle, square).' },
      { name: 'requestedBy', type: 'string', desc: 'Required. Who or what asked.' },
      { name: 'requestedAt', type: 'string', desc: 'Required. When it was asked.' },
      { name: 'payload', type: 'string', desc: 'Raw request, behind a "View payload" toggle.' },
      { name: 'status', type: "'pending' | 'approved' | 'rejected'", default: "'pending'", desc: 'Pending shows the buttons; the others show the outcome.' },
      { name: 'onApprove', type: '() => void', desc: 'Required. Called when Approve is clicked.' },
      { name: 'onReject', type: '() => void', desc: 'Required. Called when Reject is clicked.' },
    ],
    guidance: {
      do: ['Ask before anything hard to undo: sending, publishing, paying, deleting.', 'Lead with the numbers that matter (how many people, how much money).', 'Confirm the outcome after the decision so reviewers know it took effect.'],
      dont: ['Ask for approval on every small step. People stop reading and approve everything.', 'Make Reject harder to find than Approve.'],
      a11y: ['Facts are a description list, so screen readers read label then value.', 'Risk uses a word and a shape, not just color.', 'The outcome after a decision is announced.'],
    },
  },
  {
    id: 'tool-execution',
    title: 'Tool Execution',
    desc: 'One call an agent made to an outside system: what it called, with which permission, how long it took, and what came back.',
    preview: () => <ToolExecutionDemo />,
    code: `import { ToolExecution } from '@/components'

<ToolExecution
  tool="CRM"
  operation="Query contacts"
  status="success"
  access="Read-only"
  duration="1.2s"
  callId="#003"
  summary="240 results returned"
  request="GET /contacts?segment=lapsed"
  response='{ "count": 240 }'
/>`,
    props: [
      { name: 'tool', type: 'string', desc: 'Required. System the agent called.' },
      { name: 'operation', type: 'string', desc: 'Required. What it did there.' },
      { name: 'status', type: "'running' | 'success' | 'error'", desc: 'Required. Running shows a waiting message and hides details.' },
      { name: 'access', type: 'string', desc: 'Permission the call ran with, e.g. "Read-only".' },
      { name: 'duration', type: 'string', desc: 'How long the call took.' },
      { name: 'callId', type: 'string', desc: 'Id to match this call to logs.' },
      { name: 'summary', type: 'string', desc: 'One-line outcome on success.' },
      { name: 'request', type: 'string', desc: 'Raw request, behind "Show details".' },
      { name: 'response', type: 'string', desc: 'Raw response, behind "Show details".' },
      { name: 'error', type: 'string', desc: 'Shown instead of the summary when the call failed.' },
      { name: 'onRetry', type: '() => void', desc: 'Shows a Retry button on error.' },
    ],
    guidance: {
      do: ['Always show the permission level. "Read-only" is reassuring; "Write" deserves attention.', 'Keep raw request and response available for debugging.', 'Write errors as what happened plus what to do.'],
      dont: ['Show raw JSON by default. Lead with the one-line summary.', 'Retry automatically without telling the person.'],
      a11y: ['Errors use role="alert"; the summary is a polite live region.', 'aria-busy is set while the call runs.', 'Code blocks are focusable so they can be scrolled with the keyboard.'],
    },
  },
  {
    id: 'ai-response',
    title: 'AI Response',
    desc: 'An AI-generated answer that says it is AI, cites where it came from, and can be copied, regenerated or rated.',
    preview: () => <AIResponseDemo />,
    code: `import { AIResponse } from '@/components'

<AIResponse
  title="Campaign recommendation"
  copyText="Returning customers are the strongest audience..."
  sources={[{ title: 'Q3 campaign report', excerpt: 'Re-engagement outperformed discounts 2.4x.' }]}
  onRegenerate={() => console.log('regenerate')}
  onFeedback={(value) => console.log(value)}
>
  <p>Returning customers are the strongest audience for your next campaign.</p>
</AIResponse>`,
    props: [
      { name: 'title', type: 'string', desc: 'Required. What the answer is about.' },
      { name: 'children', type: 'ReactNode', desc: 'Required. The answer.' },
      { name: 'copyText', type: 'string', desc: 'Required. Plain text the Copy button copies.' },
      { name: 'sources', type: '{ title: string; excerpt: string }[]', desc: 'Where the answer came from. Listed, with excerpts on demand.' },
      { name: 'status', type: "'draft' | 'final'", default: "'draft'", desc: 'Whether a person has reviewed it.' },
      { name: 'onRegenerate', type: '() => void', desc: 'Shows a Regenerate button.' },
      { name: 'onFeedback', type: "(value: 'helpful' | 'not-helpful') => void", desc: 'Called when the person rates the answer.' },
    ],
    guidance: {
      do: ['Label AI output as AI-generated, every time.', 'Cite sources the person can check.', 'Mark answers as draft until a person has reviewed them.'],
      dont: ['Present AI output as fact without sources.', 'Hide feedback controls; they are how the agent improves.'],
      a11y: ['Rating buttons use aria-pressed and sit in a labeled group.', 'Copy and rating changes are announced.', 'The AI-generated label is text, not just an icon.'],
    },
  },
  {
    id: 'activity-timeline',
    title: 'Activity Timeline',
    desc: 'Newest-first audit log of what agents, people and integrations did, so a run can be traced afterwards.',
    preview: () => <ActivityTimelineDemo />,
    code: `import { ActivityTimeline } from '@/components'

<ActivityTimeline
  label="Workflow activity"
  events={[
    { id: '2', title: 'Approval requested', actor: 'Campaign agent', kind: 'agent', time: '2026-10-17T10:42', timeLabel: '10:42 AM' },
    { id: '1', title: 'Workflow started', actor: 'Sam Lee', kind: 'human', time: '2026-10-17T10:38', timeLabel: '10:38 AM' },
  ]}
/>`,
    props: [
      { name: 'events', type: "{ id: string; title: string; actor: string; kind: 'agent' | 'human' | 'integration' | 'system'; time: string; timeLabel: string }[]", desc: 'Required. Newest first. time is ISO; timeLabel is what people see.' },
      { name: 'label', type: 'string', default: "'Activity'", desc: 'Accessible name for the list.' },
    ],
    guidance: {
      do: ['Say who did each thing, and whether it was an agent or a person.', 'Use past-tense titles ("Contacts retrieved").', 'Offer export for audits.'],
      dont: ['Mix agent and human actions without labels.', 'Show relative times only ("2 min ago"); audits need exact times.'],
      a11y: ['Events are an ordered list with a label.', 'Times use <time datetime> for machine-readable values.', 'Each kind has an icon and a text label.'],
    },
  },
  {
    id: 'agentic-principles',
    title: 'Agentic Principles',
    desc: 'Four rules behind every agentic component here. Use them when you design something new for AI that takes action.',
    preview: () => <Principles />,
    code: '',
    article: true,
  },
]
