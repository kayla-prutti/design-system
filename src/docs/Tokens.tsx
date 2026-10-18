import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button, Tabs } from '../components'
import { CodeBlock } from './CodeBlock'

function Panel({ preview, code, label = 'css' }: { preview: ReactNode; code: string; label?: string }) {
  return (
    <div className="token-panel">
      <h3>Preview</h3>
      {preview}
      <h3>Code</h3>
      <CodeBlock code={code} label={label} />
    </div>
  )
}

const Swatches = ({ tokens, border = true }: { tokens: string[]; border?: boolean }) => (
  <div className="swatches">
    {tokens.map((t) => (
      <div key={t} className="swatch">
        <span className="swatch__chip" style={{ background: `var(${t})`, borderColor: border ? undefined : 'transparent' }} />
        <code>{t}</code>
      </div>
    ))}
  </div>
)

const group = (title: string, body: ReactNode) => (
  <div className="token-group"><h4>{title}</h4>{body}</div>
)

const COLOR_PRIMITIVES = ['--indigo-50', '--indigo-100', '--indigo-500', '--indigo-600', '--indigo-700', '--indigo-800', '--gray-0', '--gray-50', '--gray-100', '--gray-300', '--gray-400', '--gray-500', '--gray-800', '--gray-900', '--red-500', '--green-500', '--amber-500']
const COLOR_SURFACE = ['--bg', '--surface', '--surface-raised', '--surface-hover', '--border', '--border-strong', '--border-control']
const COLOR_TEXT = ['--text', '--text-muted', '--text-disabled', '--on-accent']
const COLOR_ACCENT = ['--accent', '--accent-hover', '--accent-active', '--accent-subtle']
const COLOR_STATUS = ['--danger', '--danger-text', '--danger-subtle', '--success', '--success-text', '--success-subtle', '--warning', '--warning-text', '--warning-subtle', '--bg-disabled']

const SPACE = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-8', '--space-12', '--space-16']
const SIZES = ['--text-xs', '--text-sm', '--text-md', '--text-lg', '--text-xl', '--text-2xl']
const WEIGHTS = ['400', '500', '600', '700']
const LEADINGS = ['120', '150', '175']
const TRACKING = ['neg-2', '0', '6']
const RADII = ['sm', 'md', 'lg', 'full']
const BORDER_WIDTHS = ['thin', 'medium', 'thick']
const SHADOWS = ['sm', 'md', 'lg']
const OPACITIES = [['8', 'hover tint'], ['12', 'skeleton'], ['40', 'overlay'], ['50', 'disabled']]
const EASES = ['--ease-out', '--ease-in', '--ease-in-out']
const DURATIONS = ['--duration-fast', '--duration-base', '--duration-slow']

const SAMPLE = 'The quick brown fox jumps over the lazy dog'

/** Moving demo with a pause control: anything that moves for more than 5 seconds needs one (WCAG 2.2.2). */
function MotionPreview() {
  const [playing, setPlaying] = useState(true)
  return (
    <div className={playing ? undefined : 'motion-paused'}>
      <div className="row row--start" style={{ marginBottom: 'var(--space-4)' }}>
        <Button size="sm" variant="secondary" onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause animation' : 'Play animation'}
        </Button>
      </div>
      {group('Duration', <div className="type-list">{DURATIONS.map((d) => (
        <div key={d} className="motion-row"><code>{d}</code><div className="motion-track"><span className="motion-dot" style={{ animationDuration: `calc(var(${d}) * 6)`, animationTimingFunction: 'var(--ease-in-out)' }} /></div></div>
      ))}</div>)}
      {group('Easing', <div className="type-list">{EASES.map((e) => (
        <div key={e} className="motion-row"><code>{e}</code><div className="motion-track"><span className="motion-dot" style={{ animationDuration: '2.4s', animationTimingFunction: `var(${e})` }} /></div></div>
      ))}</div>)}
    </div>
  )
}

export function Tokens() {
  return (
    <Tabs items={[
      {
        id: 'color', label: 'Color',
        content: <Panel
          preview={<>
            {group('Primitives (raw palette, never used in components)', <Swatches tokens={COLOR_PRIMITIVES} />)}
            {group('Surface & border', <Swatches tokens={COLOR_SURFACE} />)}
            {group('Text', <Swatches tokens={COLOR_TEXT} />)}
            {group('Accent & interactive states (hover, active)', <Swatches tokens={COLOR_ACCENT} />)}
            {group('Status & disabled', <Swatches tokens={COLOR_STATUS} />)}
          </>}
          code={`/* Primitives: raw values */
--indigo-600: #4f46e5;

/* Semantic: meaning, mapped onto primitives */
--accent: var(--indigo-600);
--accent-hover: var(--indigo-700);
--danger: var(--red-500);

/* Usage: components only read semantic tokens */
.save-button {
  background: var(--accent);
  color: var(--on-accent);
}
.save-button:hover { background: var(--accent-hover); }
.save-button:disabled {
  background: var(--bg-disabled);
  color: var(--text-disabled);
}`} />,
      },
      {
        id: 'type', label: 'Typography',
        content: <Panel
          preview={<>
            {group('Font family', <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', margin: 0 }}>--font-sans · {SAMPLE}</p>)}
            {group('Font size', <div className="type-list">{SIZES.map((t) => <div key={t} className="type-row"><code>{t}</code><span style={{ fontSize: `var(${t})` }}>{SAMPLE}</span></div>)}</div>)}
            {group('Font weight', <div className="type-list">{WEIGHTS.map((w) => <div key={w} className="type-row"><code>--font-weight-{w}</code><span style={{ fontWeight: `var(--font-weight-${w})` }}>{SAMPLE}</span></div>)}</div>)}
            {group('Line height', <div className="type-list">{LEADINGS.map((l) => <div key={l} className="type-row"><code>--leading-{l}</code><span style={{ lineHeight: `var(--leading-${l})`, maxWidth: 320 }}>{SAMPLE}. {SAMPLE}.</span></div>)}</div>)}
            {group('Letter spacing', <div className="type-list">{TRACKING.map((t) => <div key={t} className="type-row"><code>--tracking-{t}</code><span style={{ letterSpacing: `var(--tracking-${t})` }}>{SAMPLE}</span></div>)}</div>)}
          </>}
          code={`--font-sans: "Inter", system-ui, sans-serif;
--text-sm: 0.875rem;
--font-weight-600: 600;
--leading-150: 1.5;
--tracking-neg-2: -0.02em;  /* -2% of font size */

/* Usage */
.card-title {
  font-family: var(--font-sans);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-600);
  line-height: var(--leading-120);
  letter-spacing: var(--tracking-neg-2);
}`} />,
      },
      {
        id: 'spacing', label: 'Spacing',
        content: <Panel
          preview={<div className="spaces">{SPACE.map((t) => (
            <div key={t} className="space-row"><code>{t}</code><span className="space-bar" style={{ width: `var(${t})` }} /></div>
          ))}</div>}
          code={`/* 4px base scale */
--space-1: 4px;
--space-2: 8px;
--space-4: 16px;

/* Usage: padding, margins and gaps */
.toolbar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
}`} />,
      },
      {
        id: 'radius', label: 'Radius & Border',
        content: <Panel
          preview={<>
            {group('Radius', <div className="demo-row">{RADII.map((r) => (
              <div key={r} className="demo-box" style={{ borderRadius: `var(--radius-${r})` }}><code>--radius-{r}</code></div>
            ))}</div>)}
            {group('Border width', <div className="demo-row">{BORDER_WIDTHS.map((b) => (
              <div key={b} className="demo-box" style={{ border: `var(--border-width-${b}) solid var(--accent)` }}><code>--border-width-{b}</code></div>
            ))}</div>)}
          </>}
          code={`--radius-sm: 6px;
--radius-md: 10px;
--radius-full: 999px;
--border-width-thin: 1px;
--border-width-medium: 2px;

/* Usage */
.input {
  border: var(--border-width-thin) solid var(--border-strong);
  border-radius: var(--radius-md);
}
.avatar { border-radius: var(--radius-full); }`} />,
      },
      {
        id: 'elevation', label: 'Elevation',
        content: <Panel
          preview={<div className="demo-row demo-row--pad">{SHADOWS.map((s) => (
            <div key={s} className="demo-box" style={{ boxShadow: `var(--shadow-${s})`, borderColor: 'transparent' }}><code>--shadow-{s}</code></div>
          ))}</div>}
          code={`--shadow-sm: 0 1px 3px rgb(18 20 28 / 0.1), 0 1px 2px rgb(18 20 28 / 0.06);
--shadow-md: 0 4px 16px rgb(18 20 28 / 0.08);
--shadow-lg: 0 24px 64px rgb(18 20 28 / 0.18);

/* Usage: higher shadow = closer to the user */
.card  { box-shadow: var(--shadow-md); }
.modal { box-shadow: var(--shadow-lg); }`} />,
      },
      {
        id: 'opacity', label: 'Opacity',
        content: <Panel
          preview={<div className="demo-row">{OPACITIES.map(([n, use]) => (
            <div key={n} className="opacity-item">
              <div className="opacity-tile"><span style={{ opacity: `var(--opacity-${n})` }} /></div>
              <code>--opacity-{n}</code>
              <span className="muted">{use}</span>
            </div>
          ))}</div>}
          code={`--opacity-8: 0.08;
--opacity-12: 0.12;
--opacity-40: 0.4;
--opacity-50: 0.5;

/* Usage */
.button:disabled { opacity: var(--opacity-50); }
.backdrop { background: rgb(0 0 0 / var(--opacity-40)); }
.skeleton { background: var(--text); opacity: var(--opacity-12); }`} />,
      },
      {
        id: 'motion', label: 'Motion',
        content: <Panel
          preview={<MotionPreview />}
          code={`--duration-fast: 120ms;
--duration-base: 200ms;
--duration-slow: 400ms;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

/* Usage */
.button {
  transition: background var(--duration-fast) var(--ease-out);
}

/* Tokens collapse to 0ms under prefers-reduced-motion */`} />,
      },
    ]} />
  )
}
