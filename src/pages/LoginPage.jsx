import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/dashboard')
  }

  return (
    <div className="flex-center" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--cream)', padding: 24 }}>
      <div className="card animate-fade-up" style={{ maxWidth: 440, width: '100%', padding: 40 }}>
        <div className="text-center mb-8">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⛳</div>
          <h2 style={{ marginBottom: 8 }}>Welcome Back</h2>
          <p className="text-muted text-sm">Sign in to your GolfGives account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="stack gap-4">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <div className="divider" />
        <p className="text-center text-sm text-muted">
          New to GolfGives?{' '}
          <Link to="/signup" style={{ color: 'var(--forest)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
