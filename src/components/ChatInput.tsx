import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import './ChatInput.css'

export interface ChatInputProps {
  /** Called with the trimmed message when the user presses Enter or the send button. */
  onSend: (message: string) => void
  /** Called when the user stops a running response. Shown in place of Send while loading. */
  onStop?: () => void
  /** True while the agent is responding. */
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  /** Accessible name for the text box. */
  label?: string
  /** Starter prompts shown under the box. Clicking one fills the box so the user can edit before sending. */
  suggestions?: string[]
}

/** Message box for talking to an AI agent: Enter sends, Shift+Enter adds a line, Stop replaces Send while the agent responds. */
export function ChatInput({ onSend, onStop, loading = false, disabled = false, placeholder = 'Message the agent…', label = 'Message', suggestions }: ChatInputProps) {
  const [text, setText] = useState('')
  const hintId = useId()
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim() !== '' && !loading && !disabled

  // Grow with content, up to a max height.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [text])

  const send = () => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: don't send while an IME (e.g. Japanese, Chinese) is confirming text
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() }
  }

  return (
    <div className="chat-input">
      <div className={`chat-input__box${disabled ? ' is-disabled' : ''}`}>
        <textarea
          ref={ref}
          rows={1}
          className="chat-input__text"
          aria-label={label}
          aria-describedby={hintId}
          placeholder={placeholder}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {loading ? (
          <button type="button" className="chat-input__btn chat-input__btn--stop" aria-label="Stop response" onClick={onStop}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" /></svg>
          </button>
        ) : (
          <button type="button" className="chat-input__btn" aria-label="Send message" disabled={!canSend} onClick={send}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
          </button>
        )}
      </div>
      <p id={hintId} className="chat-input__hint">Enter to send · Shift+Enter for a new line</p>
      {suggestions && suggestions.length > 0 && (
        <div className="chat-input__suggestions" role="group" aria-label="Suggested prompts">
          <span className="chat-input__suggestions-label" aria-hidden="true">Try a prompt</span>
          {suggestions.map((s) => (
            <button key={s} type="button" className="chat-input__chip" disabled={disabled} onClick={() => { setText(s); ref.current?.focus() }}>{s}</button>
          ))}
        </div>
      )}
    </div>
  )
}
