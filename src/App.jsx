import { useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import './App.css'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const PERSONALITIES = [
  { value: '', label: 'Alege personalitatea brandului...' },
  { value: 'Warm & Family', label: 'Warm & Family' },
  { value: 'Trendy & Urban', label: 'Trendy & Urban' },
  { value: 'Elegant & Upscale', label: 'Elegant & Upscale' },
  { value: 'Fun & Casual', label: 'Fun & Casual' },
]

function buildPrompt(form) {
  return `Ești un copywriter expert în marketing pentru restaurante din România.

Generează exact 5 hook-uri captivante pentru social media (Instagram, TikTok, Facebook) pentru restaurantul descris mai jos. Hook-urile trebuie să fie în română, să oprească scrollul și să invite la acțiune.

Restaurant: ${form.restaurantName}
Tipul bucătăriei: ${form.cuisineType}
Public țintă: ${form.targetAudience}
Personalitatea brandului: ${form.personality}

Returnează DOAR un array JSON valid cu exact 5 string-uri, fără alt text, fără markdown, fără explicații. Exemplu de format:
["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"]`
}

async function generateHooks(form) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(form) }],
  })

  const raw = message.content[0].text.trim()
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed) || parsed.length !== 5) {
    throw new Error('Răspuns neașteptat de la AI.')
  }
  return parsed
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy} aria-label="Copiază hook-ul">
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copiat
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="5" y="5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 5V3.5A1.5 1.5 0 0 0 7.5 2H2.5A1.5 1.5 0 0 0 1 3.5v5A1.5 1.5 0 0 0 2.5 10H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Copiază
        </>
      )}
    </button>
  )
}

function HookCard({ hook, index }) {
  return (
    <article className="hook-card">
      <span className="hook-number">#{index + 1}</span>
      <p className="hook-text">{hook}</p>
      <CopyButton text={hook} />
    </article>
  )
}

function SkeletonCard() {
  return (
    <div className="hook-card skeleton" aria-hidden="true">
      <span className="hook-number">&nbsp;</span>
      <div className="skel-line long" />
      <div className="skel-line medium" />
      <div className="skel-line short" />
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState({
    restaurantName: '',
    cuisineType: '',
    targetAudience: '',
    personality: '',
  })
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [hooks, setHooks] = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setHooks([])
    setErrorMsg('')
    try {
      const result = await generateHooks(form)
      setHooks(result)
      setStatus('done')
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } catch (err) {
      setErrorMsg(err.message ?? 'A apărut o eroare. Verifică cheia API și încearcă din nou.')
      setStatus('error')
    }
  }

  const isValid = form.restaurantName && form.cuisineType && form.targetAudience && form.personality

  return (
    <div className="landing">
      <nav className="nav">
        <span className="logo">Hookr</span>
      </nav>

      <main className="hero">
        <div className="badge">AI-Powered</div>
        <h1 className="headline">
          Hookr — Conținut magnetic pentru restaurantele tale
        </h1>
        <p className="subtext">
          Generează hook-uri irezistibile pentru social media, personalizate pentru brandul tău
        </p>
        <a href="#generator" className="cta">Începe acum</a>
      </main>

      <section className="generator" id="generator">
        <div className="generator-inner">
          <div className="section-label">Generator</div>
          <h2 className="section-title">Spune-ne despre restaurantul tău</h2>
          <p className="section-sub">Completează câmpurile de mai jos și vom crea hook-uri personalizate pentru tine.</p>

          <form className="gen-form" onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="restaurantName">Numele restaurantului</label>
                <input
                  id="restaurantName"
                  name="restaurantName"
                  type="text"
                  placeholder="ex. La Mama, Vatra, Brasserie 5"
                  value={form.restaurantName}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              <div className="field">
                <label htmlFor="cuisineType">Tipul bucătăriei</label>
                <input
                  id="cuisineType"
                  name="cuisineType"
                  type="text"
                  placeholder="ex. Românească tradițională, Fusion, Italiană"
                  value={form.cuisineType}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="targetAudience">Publicul țintă</label>
                <input
                  id="targetAudience"
                  name="targetAudience"
                  type="text"
                  placeholder="ex. Familii cu copii, tineri 25–35, business lunch"
                  value={form.targetAudience}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              <div className="field">
                <label htmlFor="personality">Personalitatea brandului</label>
                <select
                  id="personality"
                  name="personality"
                  value={form.personality}
                  onChange={handleChange}
                  className={form.personality === '' ? 'placeholder' : ''}
                >
                  {PERSONALITIES.map(p => (
                    <option key={p.value} value={p.value} disabled={p.value === ''}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="cta gen-submit" disabled={!isValid || status === 'loading'}>
              {status === 'loading' ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Se generează...
                </>
              ) : 'Generează hook-uri'}
            </button>
          </form>
        </div>
      </section>

      {(status === 'loading' || status === 'done' || status === 'error') && (
        <section className="results" id="results">
          <div className="generator-inner">
            <div className="section-label">Rezultate</div>
            <h2 className="section-title">
              {status === 'loading' && 'Se generează hook-urile tale…'}
              {status === 'done' && 'Hook-urile tale sunt gata'}
              {status === 'error' && 'A apărut o eroare'}
            </h2>

            {status === 'error' && (
              <p className="error-msg">{errorMsg}</p>
            )}

            <div className="hooks-grid">
              {status === 'loading' && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
              {status === 'done' && hooks.map((hook, i) => <HookCard key={i} hook={hook} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
