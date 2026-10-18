import './Switch.css'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        role="switch"
        className="switch__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch__track" aria-hidden="true"><span className="switch__thumb" /></span>
      {label}
    </label>
  )
}
