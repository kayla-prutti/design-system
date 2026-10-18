import { useRef, useState } from 'react'
import { AgentDirectory, AgentHandoff, Button, Dropdown, DynamicForm, EvaluationSuite, Input, KnowledgeSources, Modal, PolicyGuardrails, ReleaseControls, Search, StructuredOutput, Switch, WorkflowNodes, useToast } from '../components'
import type { AgentState, EvalTest, KnowledgeSource, NodeType, PolicyCheck, WorkflowNode } from '../components'
import type { DocPage } from './pages'

/* ---------- Workflow Nodes ---------- */

const START: WorkflowNode[] = [
  { id: 'n1', title: 'New record created', type: 'trigger', subtitle: 'CRM' },
  { id: 'n2', title: 'Analyze audience', type: 'ai', subtitle: 'Segment contacts' },
  { id: 'n3', title: 'Human review', type: 'approval', subtitle: 'Marketing team' },
]
const ADDABLE: { type: NodeType; label: string; title: string }[] = [
  { type: 'ai', label: 'AI step', title: 'New AI step' },
  { type: 'condition', label: 'Condition', title: 'New condition' },
  { type: 'tool', label: 'Tool', title: 'New tool call' },
  { type: 'approval', label: 'Approval', title: 'New approval' },
]

function WorkflowDemo() {
  const { toast } = useToast()
  const [nodes, setNodes] = useState(START)
  const [selected, setSelected] = useState('n2')
  const nextId = useRef(4)
  const node = nodes.find((n) => n.id === selected)
  const rename = (title: string) => setNodes((ns) => ns.map((n) => (n.id === selected ? { ...n, title } : n)))
  const add = (a: (typeof ADDABLE)[number]) => {
    const id = `n${nextId.current++}`
    setNodes((ns) => [...ns, { id, title: a.title, type: a.type }])
    setSelected(id)
  }
  const remove = () => {
    const i = nodes.findIndex((n) => n.id === selected)
    const next = nodes.filter((n) => n.id !== selected)
    setNodes(next)
    setSelected(next[Math.max(0, i - 1)]?.id ?? '')
  }
  return (
    <div className="agentic-demo">
      <div className="wf-demo">
        <div className="wf-demo__canvas"><WorkflowNodes nodes={nodes} selectedId={selected} onSelect={setSelected} /></div>
        <aside className="wf-demo__panel" aria-label="Selected step">
          {node ? <div className="stack"><Input label="Step name" value={node.title} onChange={(e) => rename(e.target.value)} /><p className="muted">Type: {node.type}</p></div> : <p className="muted">Select a step to edit it.</p>}
        </aside>
      </div>
      <div className="row row--start" role="group" aria-label="Add a step">
        {ADDABLE.map((a) => <Button key={a.type} size="sm" variant="secondary" onClick={() => add(a)}>+ {a.label}</Button>)}
      </div>
      <div className="row row--start">
        <Button variant="secondary" disabled={!node || node.type === 'trigger'} onClick={remove}>Remove selected</Button>
        <Button onClick={() => toast({ variant: 'success', title: 'Workflow saved', description: `${nodes.length} steps.` })}>Save workflow</Button>
      </div>
    </div>
  )
}

/* ---------- Knowledge Sources ---------- */

const SOURCES: KnowledgeSource[] = [
  { id: 's1', name: 'Brand guidelines.pdf', type: 'file', meta: 'Last synced 18 min ago · 2.4 MB', status: 'synced', provenance: [{ label: 'Access', value: 'Everyone in workspace' }, { label: 'Owner', value: 'Brand team' }, { label: 'Used by', value: '3 agents' }] },
  { id: 's2', name: 'CRM contacts', type: 'database', meta: '12,450 records · Read-only', status: 'synced', provenance: [{ label: 'Access', value: 'Read-only' }, { label: 'Owner', value: 'Sales ops' }, { label: 'Used by', value: 'Campaign agent' }] },
  { id: 's3', name: 'Campaign performance.xlsx', type: 'spreadsheet', meta: 'Sync scheduled · 1 day ago', status: 'delayed', provenance: [{ label: 'Access', value: 'Marketing only' }, { label: 'Owner', value: 'Analytics' }, { label: 'Last sync', value: 'Yesterday, 4:10 PM' }] },
]

function KnowledgeDemo() {
  const { toast } = useToast()
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string>()
  const [sources, setSources] = useState(SOURCES)
  const shown = sources.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
  const retry = () => {
    setSources((ss) => ss.map((s) => (s.status === 'delayed' ? { ...s, status: 'synced', meta: 'Last synced just now' } : s)))
    toast({ variant: 'success', title: 'Sources synced' })
  }
  return (
    <div className="agentic-demo">
      <Search value={q} onChange={setQ} onSearch={setQuery} label="Search connected sources" />
      <KnowledgeSources sources={shown} selectedId={selected} onSelect={setSelected} />
      <div><Button variant="secondary" disabled={!sources.some((s) => s.status !== 'synced')} onClick={retry}>Retry sync</Button></div>
    </div>
  )
}

/* ---------- Agent Directory ---------- */

const AGENTS = [
  { id: 'a1', name: 'Research assistant', description: 'Summaries and source-backed answers', status: 'active' as AgentState, lastRun: 'Last run 2 min ago', tools: ['Web search', 'Knowledge sources'] },
  { id: 'a2', name: 'Campaign orchestrator', description: 'Audience segmentation and approvals', status: 'active' as AgentState, lastRun: 'Last run 1 hr ago', tools: ['CRM', 'Email', 'Approvals'] },
  { id: 'a3', name: 'Compliance monitor', description: 'Review and exception detection', status: 'draft' as AgentState, lastRun: 'Last run yesterday', tools: ['Policy guardrails'] },
  { id: 'a4', name: 'Data analyst', description: 'Queries data and builds charts', status: 'paused' as AgentState, lastRun: 'Paused 3 days ago', tools: ['SQL', 'Charts'] },
]

function DirectoryDemo() {
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const agent = AGENTS.find((a) => a.id === open)
  const shown = status ? AGENTS.filter((a) => a.status === status) : AGENTS
  return (
    <div className="agentic-demo">
      <div className="timeline-toolbar__filter">
        <Dropdown label="Status" value={status} onChange={setStatus} options={[{ value: '', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'draft', label: 'Draft' }]} />
      </div>
      <AgentDirectory agents={shown} onOpen={setOpen} />
      <Modal open={agent !== undefined} onClose={() => setOpen(null)} title={agent?.name ?? ''} actions={<Button onClick={() => setOpen(null)}>Done</Button>}>
        {agent && <>
          <p>{agent.description}.</p>
          <p className="muted">{agent.lastRun}</p>
          <p><strong>Tools:</strong> {agent.tools.join(', ')}</p>
        </>}
      </Modal>
    </div>
  )
}

/* ---------- Dynamic Form ---------- */

function FormDemo() {
  const { toast } = useToast()
  return (
    <DynamicForm
      submitLabel="Save configuration"
      initialValues={{ name: 'Weekly campaign summary', schedule: 'weekly', notify: true, email: 'marketing@example.com', review: 'require', instructions: 'Summarize campaign performance. Cite sources. Request approval before external outreach.' }}
      fields={[
        { name: 'name', label: 'Workflow name', type: 'text', required: true },
        { name: 'schedule', label: 'Schedule', type: 'select', options: [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }] },
        { name: 'notify', label: 'Send notification when complete', type: 'switch' },
        { name: 'email', label: 'Notification email', type: 'email', required: true, showIf: { field: 'notify', equals: true } },
        { name: 'review', label: 'Approval policy', type: 'select', options: [{ value: 'require', label: 'Require review' }, { value: 'auto', label: 'Auto-approve low risk' }] },
        { name: 'instructions', label: 'Instructions for the agent', type: 'textarea', hint: 'Saved to this demo only.' },
      ]}
      onSubmit={(v) => toast({ variant: 'success', title: 'Configuration saved', description: `"${v.name}" runs ${v.schedule}.` })}
    />
  )
}

/* ---------- Agent Handoff ---------- */

const SPECIALISTS = [
  { id: 'research', name: 'Research specialist', description: 'Evidence gathering and cited summaries.' },
  { id: 'copy', name: 'Copy specialist', description: 'Writes on-brand email and landing copy.' },
  { id: 'data', name: 'Data specialist', description: 'Pulls metrics and checks the numbers.' },
]

function HandoffDemo() {
  const { toast } = useToast()
  const [owner, setOwner] = useState<string | null>(null)
  return (
    <AgentHandoff
      task={{ title: 'Prepare Q4 campaign brief', description: 'Review engagement data and recommend an audience, with citations.', context: ['3 sources', '6.2 KB notes'] }}
      coordinator="Coordinator"
      specialists={SPECIALISTS}
      owner={owner}
      onHandoff={(id) => { setOwner(id); toast({ title: 'Handed off', description: `${SPECIALISTS.find((s) => s.id === id)?.name} now owns the task.` }) }}
      onReturn={() => { setOwner(null); toast({ title: 'Returned to Coordinator' }) }}
    />
  )
}

/* ---------- Policy Guardrails ---------- */

function evaluate(classification: string, destination: string, mask: boolean): PolicyCheck[] {
  const external = destination === 'external'
  return [
    { id: 'class', label: 'Data classification', result: classification === 'restricted' && external ? 'fail' : 'pass', detail: classification === 'restricted' && external ? 'Restricted data cannot leave the workspace. Choose an internal destination.' : `${classification[0].toUpperCase()}${classification.slice(1)} data is allowed here.` },
    { id: 'pii', label: 'Personal information', result: external && !mask ? 'warn' : 'pass', detail: external && !mask ? 'Turn on masking before sending personal information outside.' : 'Personal information is masked or stays internal.' },
    { id: 'dest', label: 'Destination', result: 'pass', detail: external ? 'External send is logged for audit.' : 'Content stays in your workspace.' },
  ]
}

function PolicyDemo() {
  const [classification, setClassification] = useState('internal')
  const [destination, setDestination] = useState('internal')
  const [mask, setMask] = useState(true)
  const [checks, setChecks] = useState<PolicyCheck[] | null>(null)
  const change = <T,>(set: (v: T) => void) => (v: T) => { set(v); setChecks(null) }
  return (
    <div className="agentic-demo">
      <div className="policy-demo">
        <Dropdown label="Data classification" value={classification} onChange={change(setClassification)} options={[{ value: 'public', label: 'Public' }, { value: 'internal', label: 'Internal' }, { value: 'restricted', label: 'Restricted' }]} />
        <Dropdown label="Destination" value={destination} onChange={change(setDestination)} options={[{ value: 'internal', label: 'Internal workspace' }, { value: 'external', label: 'External email' }]} />
      </div>
      <Switch label="Mask personal information" checked={mask} onChange={change(setMask)} />
      <div><Button onClick={() => setChecks(evaluate(classification, destination, mask))}>Evaluate action</Button></div>
      <PolicyGuardrails policy="Enterprise standard" checks={checks} />
    </div>
  )
}

/* ---------- Evaluation Suite ---------- */

const TESTS: Omit<EvalTest, 'status'>[] = [
  { id: 't1', name: 'Citation integrity', description: 'Every claim links to a source', critical: true },
  { id: 't2', name: 'Permission boundaries', description: 'Role restrictions are respected', critical: true },
  { id: 't3', name: 'Structured result', description: 'Output matches the required schema' },
  { id: 't4', name: 'Refusal behavior', description: 'Unsupported actions are declined' },
]

function EvalDemo() {
  const [version, setVersion] = useState('v2.4')
  const [tests, setTests] = useState<EvalTest[]>(TESTS.map((t) => ({ ...t, status: 'not-run' })))
  const running = tests.some((t) => t.status === 'running')
  const run = () => {
    setTests((ts) => ts.map((t) => ({ ...t, status: 'running' })))
    // v2.5 fails one non-critical test, so the demo shows a mixed result
    setTimeout(() => setTests((ts) => ts.map((t) => ({ ...t, status: version === 'v2.5' && t.id === 't3' ? 'fail' : 'pass' }))), 1200)
  }
  return (
    <div className="agentic-demo">
      <div className="timeline-toolbar__filter">
        <Dropdown label="Version" value={version} onChange={(v) => { setVersion(v); setTests((ts) => ts.map((t) => ({ ...t, status: 'not-run' }))) }} options={[{ value: 'v2.4', label: 'v2.4 · Stable' }, { value: 'v2.5', label: 'v2.5 · Candidate' }]} />
      </div>
      <EvaluationSuite title={`Quality gate · Campaign agent ${version}`} tests={tests} />
      <div className="row row--start">
        <Button loading={running} onClick={run}>Run test suite</Button>
        <Button variant="text" disabled={running} onClick={() => setTests((ts) => ts.map((t) => ({ ...t, status: 'not-run' })))}>Reset results</Button>
      </div>
    </div>
  )
}

/* ---------- Release Controls ---------- */

function ReleaseDemo() {
  const { toast } = useToast()
  const [env, setEnv] = useState('Staging')
  const [rollout, setRollout] = useState(10)
  const [live, setLive] = useState<Record<string, boolean>>({})
  const gates = [{ label: 'Policy gate', passed: true }, { label: 'Evaluation', passed: env !== 'Production' || rollout <= 50 }]
  return (
    <ReleaseControls
      environments={['Development', 'Staging', 'Production']}
      environment={env}
      onEnvironmentChange={setEnv}
      version="v2.5 candidate"
      rollout={rollout}
      onRolloutChange={setRollout}
      gates={gates}
      live={live[env] ?? false}
      onPromote={() => { setLive((l) => ({ ...l, [env]: true })); toast({ variant: 'success', title: `Promoted to ${env}`, description: `${rollout}% of users get v2.5.`, action: { label: 'Undo', onClick: () => setLive((l) => ({ ...l, [env]: false })) } }) }}
      onRollback={() => { setLive((l) => ({ ...l, [env]: false })); toast({ variant: 'warning', title: `Rolled back ${env}`, description: 'Everyone is on v2.4 again.' }) }}
    />
  )
}

/* ---------- Structured Output ---------- */

const GOOD = '{\n  "campaign": "Q4 re-engagement",\n  "audience_size": 240,\n  "approved": false,\n  "channels": ["email", "in-app"]\n}'
const BAD = '{\n  "campaign": "Q4 re-engagement",\n  "audience_size": "240",\n  "channels": "email"\n}'

function OutputDemo() {
  const [json, setJson] = useState(GOOD)
  return (
    <div className="agentic-demo">
      <StructuredOutput json={json} schema={[{ field: 'campaign', type: 'string' }, { field: 'audience_size', type: 'integer' }, { field: 'approved', type: 'boolean' }, { field: 'channels', type: 'string[]' }]} />
      <div className="row row--start">
        <Button variant="secondary" disabled={json === BAD} onClick={() => setJson(BAD)}>Load invalid sample</Button>
        <Button variant="text" disabled={json === GOOD} onClick={() => setJson(GOOD)}>Reset sample</Button>
      </div>
    </div>
  )
}

/* ---------- Pages ---------- */

export const AGENTIC_PAGES_2: DocPage[] = [
  {
    id: 'workflow-nodes',
    title: 'Workflow Nodes',
    desc: 'A workflow as a chain of steps: trigger, AI step, condition, tool, approval. Click a step to select and edit it.',
    preview: () => <WorkflowDemo />,
    code: `import { useState } from 'react'
import { WorkflowNodes } from '@/components'

export function CampaignWorkflow() {
  const [selected, setSelected] = useState('n2')

  return (
    <WorkflowNodes
      selectedId={selected}
      onSelect={setSelected}
      nodes={[
        { id: 'n1', title: 'New record created', type: 'trigger', subtitle: 'CRM' },
        { id: 'n2', title: 'Analyze audience', type: 'ai', subtitle: 'Segment contacts' },
        { id: 'n3', title: 'Human review', type: 'approval', subtitle: 'Marketing team' },
      ]}
    />
  )
}`,
    props: [
      { name: 'nodes', type: "{ id: string; title: string; type: 'trigger' | 'ai' | 'condition' | 'tool' | 'approval'; subtitle?: string }[]", desc: 'Required. Steps in run order.' },
      { name: 'selectedId', type: 'string', desc: 'Id of the selected step.' },
      { name: 'onSelect', type: '(id: string) => void', desc: 'Required. Called when a step is clicked.' },
      { name: 'label', type: 'string', default: "'Workflow steps'", desc: 'Accessible name for the list.' },
    ],
    guidance: {
      do: ['Start every workflow with a trigger, so people know what kicks it off.', 'Put an approval step before anything that leaves the workspace.', 'Name steps by what they do ("Analyze audience").'],
      dont: ['Let people remove the trigger; the workflow cannot run without it.', 'Rely on node color alone to show the type. Each has an icon and a label.'],
      a11y: ['Steps are buttons in an ordered list, with "step 2 of 3" read out.', 'The selected step uses aria-current.', 'Editing happens in a labeled side panel with normal form fields.'],
    },
  },
  {
    id: 'knowledge-sources',
    title: 'Knowledge Sources',
    desc: 'The data an agent can draw on, with how fresh each source is and where it came from.',
    preview: () => <KnowledgeDemo />,
    code: `import { useState } from 'react'
import { KnowledgeSources } from '@/components'

export function Sources() {
  const [selected, setSelected] = useState<string>()

  return (
    <KnowledgeSources
      selectedId={selected}
      onSelect={setSelected}
      sources={[
        {
          id: 's1',
          name: 'Brand guidelines.pdf',
          type: 'file',
          meta: 'Last synced 18 min ago',
          status: 'synced',
          provenance: [{ label: 'Owner', value: 'Brand team' }],
        },
      ]}
    />
  )
}`,
    props: [
      { name: 'sources', type: "{ id: string; name: string; type: 'file' | 'database' | 'spreadsheet'; meta: string; status: 'synced' | 'delayed' | 'failed'; provenance?: { label: string; value: string }[] }[]", desc: 'Required. The connected sources.' },
      { name: 'selectedId', type: 'string', desc: 'Id of the source whose provenance is shown.' },
      { name: 'onSelect', type: '(id: string) => void', desc: 'Required. Called when a source is clicked.' },
    ],
    guidance: {
      do: ['Show when each source last synced. Stale data leads to wrong answers.', 'Show who owns a source and who can see it.', 'Offer Retry when a sync is delayed or failed.'],
      dont: ['Hide failed sources; people need to know the agent is missing data.'],
      a11y: ['Each source is a button; the selected one uses aria-current.', 'The provenance panel is a live region, so the new details are read out.', 'Sync status is a word in a badge, not a colored dot.'],
    },
  },
  {
    id: 'agent-directory',
    title: 'Agent Directory',
    desc: 'The agents in a workspace: what each one does, whether it is running, and a way to open it.',
    preview: () => <DirectoryDemo />,
    code: `import { useState } from 'react'
import { AgentDirectory } from '@/components'

export function Agents() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <>
      <AgentDirectory
        onOpen={setOpenId}
        agents={[
          { id: 'a1', name: 'Research assistant', description: 'Source-backed answers', status: 'active', lastRun: 'Last run 2 min ago' },
          { id: 'a2', name: 'Compliance monitor', description: 'Exception detection', status: 'draft', lastRun: 'Last run yesterday' },
        ]}
      />
      {openId && <p>Opened {openId}</p>}
    </>
  )
}`,
    props: [
      { name: 'agents', type: "{ id: string; name: string; description: string; status: 'active' | 'paused' | 'draft'; lastRun: string }[]", desc: 'Required. Agents to list.' },
      { name: 'onOpen', type: '(id: string) => void', desc: 'Required. Called with the agent id when Open is clicked.' },
    ],
    guidance: {
      do: ['Describe each agent by what it does for people, in one line.', 'Show status and last run, so people can spot agents that stopped.', 'Open the agent somewhere useful: its details, settings or chat.'],
      dont: ['Use an Open button that does nothing visible.', 'Show status by dot color only.'],
      a11y: ['Each Open button is labeled with the agent name ("Open Research assistant").', 'Status is a word plus a shape: dot, square or ring.'],
    },
  },
  {
    id: 'dynamic-form',
    title: 'Dynamic Form',
    desc: 'A settings form built from a list of fields. It hides fields that do not apply, validates on save, and moves focus to the first problem.',
    preview: () => <FormDemo />,
    code: `import { DynamicForm } from '@/components'

<DynamicForm
  submitLabel="Save configuration"
  initialValues={{ name: '', notify: false, email: '' }}
  fields={[
    { name: 'name', label: 'Workflow name', type: 'text', required: true },
    { name: 'notify', label: 'Send notification when complete', type: 'switch' },
    // Only shown while notify is on
    { name: 'email', label: 'Notification email', type: 'email', required: true, showIf: { field: 'notify', equals: true } },
  ]}
  onSubmit={(values) => console.log(values)}
/>`,
    props: [
      { name: 'fields', type: "{ name: string; label: string; type: 'text' | 'email' | 'select' | 'switch' | 'textarea'; required?: boolean; options?: { value: string; label: string }[]; hint?: string; showIf?: { field: string; equals: string | boolean } }[]", desc: 'Required. The form, top to bottom.' },
      { name: 'initialValues', type: 'Record<string, string | boolean>', desc: 'Required. Starting value for every field.' },
      { name: 'onSubmit', type: '(values: Record<string, string | boolean>) => void', desc: 'Required. Called with the visible fields only, once everything is valid.' },
      { name: 'submitLabel', type: 'string', default: "'Save'", desc: 'Text for the submit button.' },
    ],
    guidance: {
      do: ['Hide fields that do not apply instead of disabling them.', 'Write errors that say how to fix it ("like name@example.com").', 'Mark required fields in the label text.'],
      dont: ['Validate on every keystroke; wait until save.', 'Submit values for fields that are hidden.'],
      a11y: ['On save, focus moves to the first field with a problem.', 'Errors are linked to their field and announced.', '"(required)" is part of the label, not just an asterisk.'],
    },
  },
  {
    id: 'agent-handoff',
    title: 'Agent Handoff',
    desc: 'Moves a task from a coordinating agent to a specialist and back, with the task context attached the whole way.',
    preview: () => <HandoffDemo />,
    code: `import { useState } from 'react'
import { AgentHandoff } from '@/components'

export function BriefHandoff() {
  const [owner, setOwner] = useState<string | null>(null)

  return (
    <AgentHandoff
      task={{ title: 'Prepare Q4 campaign brief', description: 'Recommend an audience, with citations.', context: ['3 sources'] }}
      coordinator="Coordinator"
      specialists={[{ id: 'research', name: 'Research specialist', description: 'Cited summaries.' }]}
      owner={owner}
      onHandoff={setOwner}
      onReturn={() => setOwner(null)}
    />
  )
}`,
    props: [
      { name: 'task', type: '{ title: string; description: string; context: string[] }', desc: 'Required. What is being handed off, and what goes with it.' },
      { name: 'coordinator', type: 'string', desc: 'Required. Agent that owns the task by default.' },
      { name: 'specialists', type: '{ id: string; name: string; description: string }[]', desc: 'Required. Who the task can go to.' },
      { name: 'owner', type: 'string | null', desc: 'Required. Specialist id that owns it now, or null for the coordinator.' },
      { name: 'onHandoff', type: '(specialistId: string) => void', desc: 'Required. Called when Send handoff is clicked.' },
      { name: 'onReturn', type: '() => void', desc: 'Required. Called when the task is sent back.' },
    ],
    guidance: {
      do: ['Always show who owns the task right now.', 'Show what context travels with the task.', 'Let people send the task back.'],
      dont: ['Hand off without saying why that specialist fits.'],
      a11y: ['Ownership changes are announced in a live region.', 'The specialist picker is a labeled dropdown.'],
    },
  },
  {
    id: 'policy-guardrails',
    title: 'Policy Guardrails',
    desc: 'Checks a proposed agent action against the organization rules, one rule at a time, and says what to change when something is blocked.',
    preview: () => <PolicyDemo />,
    code: `import { PolicyGuardrails } from '@/components'

<PolicyGuardrails
  policy="Enterprise standard"
  checks={[
    { id: 'class', label: 'Data classification', result: 'pass', detail: 'Internal data is allowed here.' },
    { id: 'pii', label: 'Personal information', result: 'warn', detail: 'Turn on masking before sending outside.' },
  ]}
/>`,
    props: [
      { name: 'policy', type: 'string', desc: 'Required. Name of the policy set.' },
      { name: 'checks', type: "{ id: string; label: string; result: 'pass' | 'warn' | 'fail'; detail: string }[] | null", desc: 'Required. Results per rule, or null before evaluating.' },
    ],
    guidance: {
      do: ['Explain every blocked rule and what would make it pass.', 'Separate warnings (allowed, with care) from blocks.', 'Re-evaluate when the inputs change.'],
      dont: ['Show a single "Denied" with no reason.', 'Keep old results on screen after the inputs change.'],
      a11y: ['Results are announced in a live region.', 'Each result has an icon and the word Passed, Warning or Blocked.'],
    },
  },
  {
    id: 'evaluation-suite',
    title: 'Evaluation Suite',
    desc: 'Test results for an agent version: pass rate, critical failures, and each test with its status. Run it before promoting a release.',
    preview: () => <EvalDemo />,
    code: `import { EvaluationSuite } from '@/components'

<EvaluationSuite
  title="Quality gate · Campaign agent v2.5"
  tests={[
    { id: 't1', name: 'Citation integrity', description: 'Claims link to sources', status: 'pass', critical: true },
    { id: 't2', name: 'Structured result', description: 'Output matches the schema', status: 'fail' },
  ]}
/>`,
    props: [
      { name: 'title', type: 'string', desc: 'Required. Which agent and version.' },
      { name: 'tests', type: "{ id: string; name: string; description: string; status: 'not-run' | 'running' | 'pass' | 'fail'; critical?: boolean }[]", desc: 'Required. A failed critical test blocks release.' },
    ],
    guidance: {
      do: ['Mark which tests are critical, and block release when one fails.', 'Lead with the numbers: pass rate and critical failures.', 'Reset results when the version changes.'],
      dont: ['Show a pass rate without saying what failed.'],
      a11y: ['A summary sentence is announced when a run finishes.', 'aria-busy is set while tests run.', 'Critical is a word, not just a red label.'],
    },
  },
  {
    id: 'release-controls',
    title: 'Release Controls',
    desc: 'Pick an environment, set how many users get the new agent version, and promote it only when its gates pass.',
    preview: () => <ReleaseDemo />,
    code: `import { useState } from 'react'
import { ReleaseControls } from '@/components'

export function Release() {
  const [env, setEnv] = useState('Staging')
  const [rollout, setRollout] = useState(10)

  return (
    <ReleaseControls
      environments={['Development', 'Staging', 'Production']}
      environment={env}
      onEnvironmentChange={setEnv}
      version="v2.5 candidate"
      rollout={rollout}
      onRolloutChange={setRollout}
      gates={[{ label: 'Policy gate', passed: true }, { label: 'Evaluation', passed: false }]}
      onPromote={() => console.log('promote')}
      onRollback={() => console.log('rollback')}
    />
  )
}`,
    props: [
      { name: 'environments', type: 'string[]', desc: 'Required. In promotion order.' },
      { name: 'environment', type: 'string', desc: 'Required. The selected one.' },
      { name: 'onEnvironmentChange', type: '(env: string) => void', desc: 'Required.' },
      { name: 'version', type: 'string', desc: 'Required. Version being released.' },
      { name: 'rollout', type: 'number', desc: 'Required. Percent of users, 0–100.' },
      { name: 'onRolloutChange', type: '(percent: number) => void', desc: 'Required.' },
      { name: 'gates', type: '{ label: string; passed: boolean }[]', desc: 'Required. Promote is disabled until all pass, with a reason shown.' },
      { name: 'onPromote', type: '() => void', desc: 'Required.' },
      { name: 'onRollback', type: '() => void', desc: 'Required.' },
      { name: 'live', type: 'boolean', default: 'false', desc: 'True once the version is released in this environment. Changes the badge and shows Roll back.' },
    ],
    guidance: {
      do: ['Roll out gradually: start small and raise the percentage.', 'Say why Promote is disabled.', 'Keep Roll back one click away after a release.'],
      dont: ['Allow promoting with failed gates.', 'Hide which environment you are in.'],
      a11y: ['Environments are native radio buttons, so arrow keys work.', 'The slider reads "10% of users".', 'The disabled reason is linked to the button with aria-describedby.'],
    },
  },
  {
    id: 'structured-output',
    title: 'Structured Output',
    desc: 'Checks machine-readable agent output against a typed contract, and explains every mismatch in plain words.',
    preview: () => <OutputDemo />,
    code: `import { StructuredOutput } from '@/components'

<StructuredOutput
  json='{ "campaign": "Q4", "audience_size": 240 }'
  schema={[
    { field: 'campaign', type: 'string' },
    { field: 'audience_size', type: 'integer' },
  ]}
/>`,
    props: [
      { name: 'json', type: 'string', desc: 'Required. Raw JSON the agent returned.' },
      { name: 'schema', type: "{ field: string; type: 'string' | 'number' | 'integer' | 'boolean' | 'string[]' }[]", desc: 'Required. Fields the output must contain.' },
    ],
    guidance: {
      do: ['Validate agent output before anything else uses it.', 'Explain each problem by field: what was expected, what came back.', 'Offer a table view for people who do not read JSON.'],
      dont: ['Pass invalid output on silently.', 'Show only "Invalid" with no detail.'],
      a11y: ['The JSON block is focusable so it can be scrolled.', 'The table has a caption and row headers.', 'Validation results are announced.'],
    },
  },
]
