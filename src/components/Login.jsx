import { useState } from 'react'

// Hardcoded accounts — no backend needed for 3 users
const ACCOUNTS = [
  { username: 'cso',        password: '1234', id: 'a', name: 'CSO',        role: 'CSO' },
  { username: 'tl',         password: '1234', id: 'b', name: 'TL',         role: 'TL' },
  { username: 'supervisor', password: '1234', id: 'c', name: 'Supervisor', role: 'Supervisor' },
]

export function getStoredSession() {
  try { return JSON.parse(localStorage.getItem('cpf_session')) } catch { return null }
}

function storeSession(officer) {
  localStorage.setItem('cpf_session', JSON.stringify(officer))
}

export function clearSession() {
  localStorage.removeItem('cpf_session')
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const match = ACCOUNTS.find(a => a.username === username.trim() && a.password === password)
    if (!match) { setError('Invalid username or password.'); return }
    const { username: _, password: __, ...officer } = match
    storeSession(officer)
    onLogin(officer)
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a4a3a 0%, #1a6b55 100%)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 36px', width: 360,
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #1a6b55, #0a4a3a)',
            marginBottom: 12,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.8" />
              <path d="M12 7v5l3 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2e26' }}>CPF Mirror</div>
          <div style={{ fontSize: 12, color: '#6b8c7d', marginTop: 2 }}>Officer Performance Dashboard</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374a3f', display: 'block', marginBottom: 5 }}>
              Username
            </label>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="officer.a"
              autoComplete="username"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 8, fontSize: 13,
                border: '1.5px solid #cde5d8', outline: 'none', color: '#1a2e26',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374a3f', display: 'block', marginBottom: 5 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 8, fontSize: 13,
                border: '1.5px solid #cde5d8', outline: 'none', color: '#1a2e26',
              }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', borderRadius: 6, padding: '7px 10px' }}>
              {error}
            </div>
          )}

          <button type="submit" style={{
            marginTop: 4, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1a6b55, #0a4a3a)',
            color: '#fff', fontSize: 14, fontWeight: 700,
          }}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
