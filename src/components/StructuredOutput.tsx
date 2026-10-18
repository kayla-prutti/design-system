import { useState } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import './StructuredOutput.css'

export type FieldType = 'string' | 'number' | 'integer' | 'boolean' | 'string[]'

export interface SchemaField { field: string; type: FieldType }

export interface StructuredOutputProps {
  /** Raw JSON the agent returned. */
  json: string
  /** Fields the output must contain, with their types. */
  schema: SchemaField[]
}

function checkType(value: unknown, type: FieldType) {
  if (type === 'string') return typeof value === 'string'
  if (type === 'number') return typeof value === 'number'
  if (type === 'integer') return Number.isInteger(value)
  if (type === 'boolean') return typeof value === 'boolean'
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

/** Checks machine-readable agent output against a typed contract, and explains every mismatch in plain words. */
export function validate(json: string, schema: SchemaField[]) {
  let data: Record<string, unknown>
  try { data = JSON.parse(json) } catch { return { data: null, errors: ['The output is not valid JSON.'] } }
  const errors = schema.flatMap(({ field, type }) =>
    !(field in data) ? [`Missing required field "${field}".`]
    : !checkType(data[field], type) ? [`"${field}" should be ${type}, but got ${Array.isArray(data[field]) ? 'array' : typeof data[field]}.`]
    : [])
  return { data, errors }
}

export function StructuredOutput({ json, schema }: StructuredOutputProps) {
  const [view, setView] = useState<'json' | 'table'>('json')
  const [copied, setCopied] = useState(false)
  const { data, errors } = validate(json, schema)
  const valid = errors.length === 0

  const copy = async () => {
    try { await navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* unavailable */ }
  }

  return (
    <div className="so">
      <div className="so__bar">
        <div className="so__toggle" role="group" aria-label="View as">
          <Button size="sm" variant={view === 'json' ? 'soft' : 'text'} aria-pressed={view === 'json'} onClick={() => setView('json')}>JSON</Button>
          <Button size="sm" variant={view === 'table' ? 'soft' : 'text'} aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</Button>
        </div>
        <Button size="sm" variant="secondary" onClick={copy}>{copied ? 'Copied' : 'Copy JSON'}</Button>
      </div>

      {view === 'json' || !data ? (
        <pre className="so__json" tabIndex={0} aria-label="Agent response payload">{json}</pre>
      ) : (
        <table className="so__table">
          <caption className="sr-only">Agent response fields</caption>
          <thead><tr><th scope="col">Field</th><th scope="col">Value</th><th scope="col">Expected</th><th scope="col">Check</th></tr></thead>
          <tbody>
            {schema.map(({ field, type }) => {
              const ok = field in data && checkType(data[field], type)
              return (
                <tr key={field}>
                  <th scope="row"><code>{field}</code></th>
                  <td><code>{field in data ? JSON.stringify(data[field]) : '(missing)'}</code></td>
                  <td><code>{type}</code></td>
                  <td className={ok ? 'so__ok' : 'so__bad'}>{ok ? '✓ OK' : '✕ Wrong'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <div className="so__schema">
        <div><strong>Schema</strong><span className="so__fields">{schema.map((s) => `${s.field}: ${s.type}`).join(' · ')}</span></div>
        <Badge variant={valid ? 'success' : 'danger'}>{valid ? 'Valid' : `${errors.length} problem${errors.length === 1 ? '' : 's'}`}</Badge>
      </div>
      <div role="status" aria-live="polite">
        {valid ? <p className="so__msg">All {schema.length} required fields match the schema.</p>
          : <ul className="so__errors">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      </div>
      <span className="sr-only" role="status">{copied ? 'JSON copied to clipboard' : ''}</span>
    </div>
  )
}
