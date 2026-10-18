import './WorkflowNodes.css'

export type NodeType = 'trigger' | 'ai' | 'condition' | 'tool' | 'approval'

export interface WorkflowNode {
  id: string
  title: string
  type: NodeType
  /** e.g. "Salesforce" or "Marketing team". */
  subtitle?: string
}

export interface WorkflowNodesProps {
  nodes: WorkflowNode[]
  selectedId?: string
  onSelect: (id: string) => void
  label?: string
}

const TYPE_TEXT: Record<NodeType, string> = { trigger: 'Trigger', ai: 'AI step', condition: 'Condition', tool: 'Tool', approval: 'Approval' }
const TYPE_ICON: Record<NodeType, string> = {
  trigger: 'M9 1.5 3.5 9H8l-1 5.5L12.5 7H8Z',
  ai: 'M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8l5.1-1.4Z',
  condition: 'M8 1.5 14.5 8 8 14.5 1.5 8Z',
  tool: 'M9.5 2.5a3 3 0 0 0 3.5 4l-6 6a1.5 1.5 0 0 1-2-2l6-6a3 3 0 0 0-1.5-2Z',
  approval: 'M8 1.8 13 3.8v4c0 3-2.2 5.3-5 6.4-2.8-1.1-5-3.4-5-6.4v-4ZM5.8 8l1.6 1.6L10.4 6.5',
}

/** A workflow as a vertical chain of steps. Each step is a button; the selected one is marked. */
export function WorkflowNodes({ nodes, selectedId, onSelect, label = 'Workflow steps' }: WorkflowNodesProps) {
  if (nodes.length === 0) return <p className="wf__empty">No steps yet. Add a trigger to start.</p>
  return (
    <ol className="wf" aria-label={label}>
      {nodes.map((n, i) => (
        <li key={n.id} className="wf__item">
          <button type="button" className={`wf__node wf__node--${n.type}`} aria-current={n.id === selectedId ? 'true' : undefined} onClick={() => onSelect(n.id)}>
            <span className="wf__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d={TYPE_ICON[n.type]} /></svg>
            </span>
            <span className="wf__text">
              <span className="wf__title">{n.title}</span>
              <span className="wf__meta">{TYPE_TEXT[n.type]}{n.subtitle && ` · ${n.subtitle}`}</span>
            </span>
            <span className="sr-only">, step {i + 1} of {nodes.length}{n.id === selectedId ? ', selected' : ''}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}
