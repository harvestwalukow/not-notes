import { useState } from 'react'
import { Cloud, X } from 'lucide-react'
import { cloudConfigured, supabase } from './supabase'

export function AuthDialog({ open, onClose }) {
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  if (!open) return null

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const action = mode === 'sign-in'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { data, error } = await action
    setBusy(false)
    if (error) {
      setMessage(error.message)
      return
    }
    if (data.session) onClose()
    else setMessage('Check your email to confirm your account, then sign in.')
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" onClick={onClose} aria-label="Close"><X size={19}/></button>
        <div className="auth-icon"><Cloud size={22}/></div>
        <h2 id="auth-title">Sync Not iCloud Notes everywhere</h2>
        <p>Your notes stay private to your account and update automatically across your devices.</p>
        {!cloudConfigured ? (
          <div className="auth-message error">Cloud sync has not been configured for this deployment yet.</div>
        ) : (
          <form onSubmit={submit}>
            <label>Email<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label>
            <label>Password<input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength="8" required value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters"/></label>
            {message && <div className={`auth-message ${message.startsWith('Check') ? '' : 'error'}`}>{message}</div>}
            <button className="auth-primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign In & Sync' : 'Create Account'}</button>
            <button type="button" className="auth-switch" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage('') }}>
              {mode === 'sign-in' ? 'New to Not iCloud Notes? Create an account' : 'Already have an account? Sign in'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
