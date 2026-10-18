import { useState } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Dropdown } from './Dropdown'
import './AgentHandoff.css'

export interface Specialist { id: string; name: string; description: string }

export interface AgentHandoffProps {
  task: { title: string; description: string; context: string[] }
  /** Agent that owns the task until it is handed off. */
  coordinator: string
  specialists: Specialist[]
  /** Id of the specialist that owns the task now, or null if the coordinator has it. */
  owner: string | null
  onHandoff: (specialistId: string) => void
  onReturn: () => void
}

/** Moves a task from a coordinating agent to a specialist and back, keeping the task context attached. */
export function AgentHandoff({ task, coordinator, specialists, owner, onHandoff, onReturn }: AgentHandoffProps) {
  const [choice, setChoice] = useState(specialists[0]?.id ?? '')
  const current = specialists.find((s) => s.id === owner)
  const picked = specialists.find((s) => s.id === choice)

  return (
    <div className="handoff">
      <section className="handoff__task" aria-label="Current task">
        <div className="handoff__task-head">
          <span className="handoff__eyebrow">Current task</span>
          <Badge variant={current ? 'info' : 'neutral'}>{current ? current.name : coordinator}</Badge>
        </div>
        <h4 className="handoff__title">{task.title}</h4>
        <p className="handoff__desc">{task.description}</p>
        <p className="handoff__context">Context attached: {task.context.map((c) => <span key={c} className="handoff__chip">{c}</span>)}</p>
      </section>

      {current ? (
        <div className="handoff__actions">
          <Button variant="secondary" onClick={onReturn}>Return to {coordinator}</Button>
        </div>
      ) : (
        <>
          <Dropdown label="Route to specialist" value={choice} onChange={setChoice} options={specialists.map((s) => ({ value: s.id, label: s.name }))} />
          {picked && <p className="handoff__picked">{picked.description}</p>}
          <div className="handoff__actions"><Button disabled={!picked} onClick={() => picked && onHandoff(picked.id)}>Send handoff</Button></div>
        </>
      )}
      <p className="handoff__owner" role="status">Task is owned by <strong>{current ? current.name : coordinator}</strong>.</p>
    </div>
  )
}
