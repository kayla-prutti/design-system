import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from './Button'
import { Dropdown } from './Dropdown'
import { Input } from './Input'
import { Switch } from './Switch'
import './DynamicForm.css'

export type FormValue = string | boolean

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'select' | 'switch' | 'textarea'
  required?: boolean
  /** For select fields. */
  options?: { value: string; label: string }[]
  /** Help text under textarea fields. */
  hint?: string
  /** Only show this field when another field has a given value. */
  showIf?: { field: string; equals: FormValue }
}

export interface DynamicFormProps {
  fields: FormField[]
  initialValues: Record<string, FormValue>
  onSubmit: (values: Record<string, FormValue>) => void
  submitLabel?: string
}

const EMAIL = /^\S+@\S+\.\S+$/

/** A settings form built from a list of fields. Validates on submit, hides fields that do not apply, and moves focus to the first problem. */
export function DynamicForm({ fields, initialValues, onSubmit, submitLabel = 'Save' }: DynamicFormProps) {
  const uid = useId()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fieldId = (name: string) => `${uid}-${name}`
  const visible = fields.filter((f) => !f.showIf || values[f.showIf.field] === f.showIf.equals)

  const set = (name: string, value: FormValue) => {
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => { const { [name]: _, ...rest } = e; return rest })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    for (const f of visible) {
      const v = values[f.name]
      if (f.required && (typeof v !== 'string' || v.trim() === '')) next[f.name] = `Enter ${f.label.toLowerCase()}.`
      else if (f.type === 'email' && typeof v === 'string' && v !== '' && !EMAIL.test(v)) next[f.name] = 'Enter a valid email address, like name@example.com.'
    }
    return next
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    const first = visible.find((f) => next[f.name])
    if (first) { document.getElementById(fieldId(first.name))?.focus(); return }
    // Only send the fields that are showing
    onSubmit(Object.fromEntries(visible.map((f) => [f.name, values[f.name]])))
  }

  return (
    <form className="dform" onSubmit={submit} noValidate>
      {visible.map((f) => {
        const label = f.required ? `${f.label} (required)` : f.label
        if (f.type === 'switch') return <Switch key={f.name} label={f.label} checked={values[f.name] === true} onChange={(c) => set(f.name, c)} />
        if (f.type === 'select') return <Dropdown key={f.name} label={f.label} value={String(values[f.name] ?? '')} onChange={(v) => set(f.name, v)} options={f.options ?? []} />
        if (f.type === 'textarea') {
          const descId = `${fieldId(f.name)}-desc`
          return (
            <div key={f.name} className="field">
              <label htmlFor={fieldId(f.name)} className="field__label">{label}</label>
              <textarea id={fieldId(f.name)} className="dform__textarea" rows={3} value={String(values[f.name] ?? '')} aria-invalid={errors[f.name] ? true : undefined} aria-describedby={errors[f.name] || f.hint ? descId : undefined} onChange={(e) => set(f.name, e.target.value)} />
              {errors[f.name] ? <p id={descId} className="field__msg field__msg--error" role="alert">{errors[f.name]}</p> : f.hint && <p id={descId} className="field__msg">{f.hint}</p>}
            </div>
          )
        }
        return <Input key={f.name} id={fieldId(f.name)} label={label} type={f.type} value={String(values[f.name] ?? '')} error={errors[f.name]} onChange={(e) => set(f.name, e.target.value)} />
      })}
      <div><Button type="submit">{submitLabel}</Button></div>
    </form>
  )
}
