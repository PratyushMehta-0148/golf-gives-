import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, PLANS } from '../lib/supabase'

export default function SignupPage() {
  const { signUp, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [charities, setCharities] = useState([])

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    plan: 'monthly', charityId: '', charityPct: 10
  })

  useEffect(() => {
    supabase.from('charities').select('id, name, description').eq('is_active', true)
      .then(({ data }) => setCharities(data || []))
  }, [])

  function update(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit() {
    setError('')
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (!form.charityId) { setError("Please select a charity"); return }

    setLoading(true)
    const { data, error: signUpError } = await signUp(form.email, form.password, form.fullName)
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    // Update profile with plan and charity
    if (data.user) {
      await supabase.from('profiles').update({
        subscription_plan: form.plan,
        subscription_status: 'active',
        subscription_renewal_date: new Date(Date.now() + (form.plan === 'monthly' ? 30 : 365) * 86400000).toISOString(),
        charity_id: form.charityId,
        charity_contribution_pct: form.charityPct,
      }).eq('id', data.user.id)

      await supabase.from('subscription_events').insert({
        user_id: data.user.id,
        event_type: 'subscribed',
        plan: form.plan,
        amount: form.plan === 'monthly' ? 9.99 : 99.99,
      })
    }

    await refreshProfile()
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="flex-center" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--cream)', padding: 24 }}>
      <div className="card animate-fade-up" style={{ maxWidth: 520, width: '100%', padding: 40 }}>
        {/* Progress */}
        <div className="flex gap-2 mb-8" style={{ alignItems: 'center', justifyContent: 'center' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s <= step ? 'var(--forest)' : 'var(--border)', color: s <= step ? 'white' : 'var(--text-muted)',
                fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.3s'
              }}>{s < step ? '✓' : s}</div>
              {s < 3 && <div style={{ width: 40, height: 2, background: s < step ? 'var(--forest)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Step 1: Account */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h2 style={{ marginBottom: 8 }}>Create Your Account</h2>
            <p className="text-muted text-sm mb-6">Join thousands of golfers making a difference</p>
            <div className="stack gap-4">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="John Smith"
                  value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => update('password', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" placeholder="••••••••"
                  value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
              </div>
              <button className="btn btn-primary w-full mt-2"
                onClick={() => { if (!form.fullName || !form.email || !form.password) { setError('Please fill all fields'); return } setError(''); setStep(2) }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Plan */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h2 style={{ marginBottom: 8 }}>Choose Your Plan</h2>
            <p className="text-muted text-sm mb-6">Both plans include full access and charity contributions</p>
            <div className="stack gap-3 mb-6">
              {Object.entries(PLANS).map(([key, plan]) => (
                <div key={key} onClick={() => update('plan', key)} style={{
                  padding: 20, borderRadius: 'var(--radius)', cursor: 'pointer',
                  border: `2px solid ${form.plan === key ? 'var(--forest)' : 'var(--border)'}`,
                  background: form.plan === key ? 'rgba(26,58,42,0.05)' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{plan.label}</div>
                      <div className="text-muted text-sm">Billed {plan.interval}ly</div>
                      {plan.savings && <div className="badge badge-green mt-2" style={{ fontSize: '0.7rem' }}>{plan.savings}</div>}
                    </div>
                    <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--forest)' }}>
                      {plan.priceDisplay}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3: Charity */}
        {step === 3 && (
          <div className="animate-fade-up">
            <h2 style={{ marginBottom: 8 }}>Choose Your Charity</h2>
            <p className="text-muted text-sm mb-6">At least 10% of your subscription will support this cause</p>

            <div className="form-group mb-4">
              <label className="form-label">Select a Charity</label>
              <select className="form-input form-select" value={form.charityId} onChange={e => update('charityId', e.target.value)}>
                <option value="">— Pick a charity —</option>
                {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Contribution Percentage: <strong>{form.charityPct}%</strong></label>
              <input type="range" min="10" max="100" value={form.charityPct}
                onChange={e => update('charityPct', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--forest)', marginTop: 8 }} />
              <div className="form-hint flex" style={{ justifyContent: 'space-between' }}>
                <span>Minimum 10%</span>
                <span>Up to 100% for pure donation</span>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(90,138,106,0.06)', marginBottom: 20 }}>
              <p className="text-sm">
                💚 You're contributing <strong>{form.charityPct}%</strong> = <strong>
                  £{((form.plan === 'monthly' ? 9.99 : 99.99 / 12) * form.charityPct / 100).toFixed(2)}/month
                </strong> to your chosen charity.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner" style={{ borderTopColor: 'var(--forest)' }} /> Creating account...</> : '🎉 Join GolfGives'}
              </button>
            </div>
          </div>
        )}

        <div className="divider" />
        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
