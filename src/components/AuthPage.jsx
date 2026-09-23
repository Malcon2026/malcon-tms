import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { LogoMark, CheckIcon } from './Icons'

export default function AuthPage() {
  const { login, register, workspaceEmpty } = useApp()
  const bootstrap = workspaceEmpty
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setMode(bootstrap ? 'register' : 'login')
  }, [bootstrap])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res =
        mode === 'login' ? await login(email, password) : await register(name, email, password)
      if (res?.error) setError(res.error)
    } catch (err) {
      setError(err?.message || 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <section className="auth-hero">
        <div className="auth-brand">
          <LogoMark size={28} />
          <span>Malcon TMS</span>
        </div>
        <h1>
          Work, <span className="gradient-text">beautifully</span>
          <br />
          organized.
        </h1>
        <p className="auth-sub">
          A shared workspace where every member is an admin — see all tasks, move work forward
          together, and only delete what you created. Data is synced through Supabase.
        </p>
        <ul className="auth-feats">
          <li>
            <CheckIcon size={18} /> Shared Kanban board for the whole team
          </li>
          <li>
            <CheckIcon size={18} /> Admin dashboard to add users
          </li>
          <li>
            <CheckIcon size={18} /> Delete protection on others&apos; tasks
          </li>
        </ul>
        <p className="auth-fine">Designed with restraint. Built for focus.</p>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <h2>{bootstrap ? 'Set up your workspace.' : 'Welcome back.'}</h2>
          <p className="auth-card-sub">
            {bootstrap
              ? 'Create the first admin account — then add colleagues from the Admin tab.'
              : 'Sign in with the email and password your admin gave you.'}
          </p>

          {mode === 'register' && bootstrap && (
            <label className="field-label">
              Full name
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          )}

          <label className="field-label">
            Email
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>

          <label className="field-label">
            Password
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : bootstrap && mode === 'register' ? 'Create workspace' : 'Sign in'}
          </button>

          {bootstrap && (
            <div className="auth-switch">
              {mode === 'login' ? (
                <>
                  First time here?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setError('')
                    }}
                  >
                    Create the workspace
                  </button>
                </>
              ) : (
                <>
                  Already set up?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError('')
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </section>
    </div>
  )
}
