import { Button } from './Button'
import './AgentDirectory.css'

export type AgentState = 'active' | 'paused' | 'draft'

export interface AgentSummary {
  id: string
  name: string
  /** What the agent does, in one line. */
  description: string
  status: AgentState
  /** e.g. "Last run 2 min ago". */
  lastRun: string
}

export interface AgentDirectoryProps {
  agents: AgentSummary[]
  /** Called with the agent id when its Open button is clicked. */
  onOpen: (id: string) => void
}

const STATE_TEXT: Record<AgentState, string> = { active: 'Active', paused: 'Paused', draft: 'Draft' }

/** A list of the agents in a workspace: what each does, whether it is running, and a way to open it. */
export function AgentDirectory({ agents, onOpen }: AgentDirectoryProps) {
  if (agents.length === 0) return <p className="dir__empty">No agents match this filter.</p>
  return (
    <ul className="dir" aria-label="Agents">
      {agents.map((a) => (
        <li key={a.id} className="dir__row">
          <span className="dir__avatar" aria-hidden="true">{a.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')}</span>
          <div className="dir__text">
            <span className="dir__name">{a.name}</span>
            <span className="dir__desc">{a.description}</span>
            <span className={`dir__state dir__state--${a.status}`}><span className="dir__dot" aria-hidden="true" />{STATE_TEXT[a.status]} · {a.lastRun}</span>
          </div>
          {/* aria-label names the agent, so "Open" is not ambiguous in a list of buttons */}
          <Button size="sm" variant="secondary" aria-label={`Open ${a.name}`} onClick={() => onOpen(a.id)}>Open</Button>
        </li>
      ))}
    </ul>
  )
}
