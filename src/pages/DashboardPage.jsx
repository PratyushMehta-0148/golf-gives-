import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const SECTIONS = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'scores', icon: '⛳', label: 'My Scores' },
  { key: 'draws', icon: '🎯', label: 'Draws' },
  { key: 'winnings', icon: '🏆', label: 'Winnings' },
  { key: 'charity', icon: '💚', label: 'My Charity' },
  { key: 'profile', icon: '👤', label: 'Profile' },
]

export default function DashboardPage() {
  const { profile, user, refreshProfile } = useAuth()
  const [active, setActive] = useState('overview')

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>{profile?.full_name || user?.email}</div>
          <div className="mt-2">
            {profile?.subscription_status === 'active'
              ? <span className="badge badge-green">Active Member</span>
              : <span className="badge badge-red">Inactive</span>
            }
          </div>
        </div>
        <div className="sidebar-section-title">Navigation</div>
        {SECTIONS.map(s => (
          <div key={s.key} className={`sidebar-nav-item ${active === s.key ? 'active' : ''}`}
            onClick={() => setActive(s.key)}>
            <span>{s.icon}</span><span>{s.label}</span>
          </div>
        ))}
      </aside>

      {/* Content */}
      <div className="dashboard-content">
        {active === 'overview' && <OverviewSection profile={profile} />}
        {active === 'scores' && <ScoresSection user={user} profile={profile} />}
        {active === 'draws' && <DrawsSection user={user} />}
        {active === 'winnings' && <WinningsSection user={user} />}
        {active === 'charity' && <CharitySection profile={profile} user={user} onUpdate={refreshProfile} />}
        {active === 'profile' && <ProfileSection profile={profile} user={user} onUpdate={refreshProfile} />}
      </div>
    </div>
  )
}

// ── OVERVIEW ────────────────────────────────────────────────
function OverviewSection({ profile }) {
  const [scores, setScores] = useState([])
  const [wins, setWins] = useState([])
  const [nextDraw, setNextDraw] = useState(null)

  useEffect(() => {
    if (!profile) return
    supabase.from('golf_scores').select('*').eq('user_id', profile.id).order('score_date', { ascending: false }).limit(5)
      .then(({ data }) => setScores(data || []))
    supabase.from('winners').select('*').eq('user_id', profile.id)
      .then(({ data }) => setWins(data || []))
  }, [profile])

  const today = new Date()
  const daysLeft = new Date(today.getFullYear(), today.getMonth() + 1, 1) - today
  const daysLeftNum = Math.ceil(daysLeft / 86400000)

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>Dashboard</h2>
      <p className="text-muted mb-8">Your GolfGives overview</p>

      {profile?.subscription_status !== 'active' && (
        <div className="alert alert-info mb-6">
          ⚠️ Your subscription is inactive. <a href="/signup" style={{ color: 'var(--forest)', fontWeight: 600 }}>Reactivate now</a> to enter draws.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-3 mb-8">
        <div className="card">
          <div className="stat-label">Subscription</div>
          <div className="stat-number" style={{ fontSize: '1.4rem', textTransform: 'capitalize', color: 'var(--forest)' }}>
            {profile?.subscription_plan || '—'}
          </div>
          <div className="text-muted text-sm mt-2">
            {profile?.subscription_renewal_date
              ? `Renews ${new Date(profile.subscription_renewal_date).toLocaleDateString()}`
              : 'No active plan'}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Scores Logged</div>
          <div className="stat-number" style={{ color: 'var(--forest)' }}>{scores.length}/5</div>
          <div className="text-muted text-sm mt-2">{5 - scores.length} more needed for full entry</div>
        </div>
        <div className="card">
          <div className="stat-label">Total Winnings</div>
          <div className="stat-number" style={{ color: 'var(--gold)' }}>
            £{wins.reduce((sum, w) => sum + (w.prize_amount || 0), 0).toFixed(2)}
          </div>
          <div className="text-muted text-sm mt-2">{wins.length} prize(s) won</div>
        </div>
      </div>

      {/* Next Draw Countdown */}
      <div className="card card-forest mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Next Monthly Draw</div>
          <h3 style={{ color: 'white', margin: 0 }}>{today.toLocaleString('default', { month: 'long' })} Draw</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4, fontSize: '0.9rem' }}>
            {scores.length >= 3 ? '✅ You\'re eligible to enter' : '⚠️ Log at least 3 scores to enter'}
          </p>
        </div>
        <div className="text-center">
          <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold-light)', lineHeight: 1 }}>{daysLeftNum}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>days remaining</div>
        </div>
      </div>

      {/* Recent Scores Preview */}
      {scores.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Recent Scores</h3>
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            {scores.map(s => (
              <div key={s.id} className="stack" style={{ alignItems: 'center', gap: 6 }}>
                <div className="score-ball filled">{s.score}</div>
                <span className="text-xs text-muted">{new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
            {[...Array(5 - scores.length)].map((_, i) => (
              <div key={i} className="stack" style={{ alignItems: 'center', gap: 6 }}>
                <div className="score-ball empty">?</div>
                <span className="text-xs text-muted">Not set</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── SCORES ──────────────────────────────────────────────────
function ScoresSection({ user }) {
  const [scores, setScores] = useState([])
  const [score, setScore] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editScore, setEditScore] = useState('')

  async function fetchScores() {
    const { data } = await supabase.from('golf_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false })
    setScores(data || [])
  }

  useEffect(() => { fetchScores() }, [user])

  async function addScore() {
    setError(''); setSuccess('')
    if (!score || !date) { setError('Please enter both a score and date'); return }
    const scoreNum = parseInt(score)
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) { setError('Score must be between 1 and 45'); return }

    setLoading(true)
    const { error: err } = await supabase.from('golf_scores').insert({ user_id: user.id, score: scoreNum, score_date: date })
    setLoading(false)
    if (err) {
      if (err.code === '23505') setError('You already have a score for this date. Edit or delete the existing one.')
      else setError(err.message)
      return
    }
    setScore(''); setSuccess('Score added! Your rolling 5 have been updated.')
    fetchScores()
  }

  async function deleteScore(id) {
    await supabase.from('golf_scores').delete().eq('id', id)
    fetchScores()
  }

  async function saveEdit(id) {
    const n = parseInt(editScore)
    if (isNaN(n) || n < 1 || n > 45) { setError('Score must be between 1 and 45'); return }
    await supabase.from('golf_scores').update({ score: n }).eq('id', id)
    setEditingId(null); fetchScores()
  }

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>My Golf Scores</h2>
      <p className="text-muted mb-8">Your last 5 Stableford scores — these are your draw numbers</p>

      {/* Score Entry */}
      <div className="card mb-6">
        <h3 style={{ marginBottom: 16 }}>Log a Score</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 160px' }}>
            <label className="form-label">Stableford Score (1–45)</label>
            <input type="number" className="form-input" placeholder="e.g. 32" min="1" max="45"
              value={score} onChange={e => setScore(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1 1 180px' }}>
            <label className="form-label">Date Played</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} />
          </div>
          <button className="btn btn-primary" onClick={addScore} disabled={loading}>
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Adding...</> : '+ Add Score'}
          </button>
        </div>
        <p className="form-hint mt-3">ℹ️ Only one score per date. Adding a 6th score automatically removes the oldest.</p>
      </div>

      {/* Score Display */}
      <div className="card">
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3>Current Scores ({scores.length}/5)</h3>
          {scores.length < 5 && <span className="badge badge-gold">Need {5 - scores.length} more for full entry</span>}
        </div>

        {scores.length === 0 ? (
          <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⛳</div>
            <p>No scores yet. Log your first score above!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Score</th>
                  <th>Date Played</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={s.id}>
                    <td><span className="badge badge-gray">#{i + 1}</span></td>
                    <td>
                      {editingId === s.id ? (
                        <input type="number" className="form-input" style={{ width: 80, padding: '6px 10px' }}
                          value={editScore} onChange={e => setEditScore(e.target.value)} min="1" max="45" />
                      ) : (
                        <div className="score-ball filled" style={{ width: 40, height: 40, fontSize: '1rem' }}>{s.score}</div>
                      )}
                    </td>
                    <td>{new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>
                      <div className="flex gap-2">
                        {editingId === s.id ? (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(s.id)}>Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(s.id); setEditScore(s.score) }}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteScore(s.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── DRAWS ──────────────────────────────────────────────────
function DrawsSection({ user }) {
  const [draws, setDraws] = useState([])
  const [entries, setEntries] = useState([])

  useEffect(() => {
    supabase.from('draws').select('*').eq('status', 'published').order('year', { ascending: false }).order('month', { ascending: false })
      .then(({ data }) => setDraws(data || []))
    supabase.from('draw_entries').select('*, draws(month, year, drawn_numbers)').eq('user_id', user.id)
      .then(({ data }) => setEntries(data || []))
  }, [user])

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>Draw Participation</h2>
      <p className="text-muted mb-8">Your history of monthly prize draws</p>

      {entries.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
          <h3 style={{ marginBottom: 8 }}>No Draw Entries Yet</h3>
          <p className="text-muted">Log at least 3 scores to automatically enter the monthly draw.</p>
        </div>
      ) : (
        <div className="stack gap-4">
          {entries.map(entry => {
            const draw = entry.draws
            if (!draw) return null
            const matched = entry.user_numbers?.filter(n => draw.drawn_numbers?.includes(n)) || []
            return (
              <div key={entry.id} className="card">
                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ marginBottom: 4 }}>{monthNames[draw.month - 1]} {draw.year} Draw</h3>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                      {entry.user_numbers?.map(n => (
                        <div key={n} className={`score-ball ${matched.includes(n) ? 'match' : 'filled'}`} style={{ width: 36, height: 36, fontSize: '0.9rem' }}>{n}</div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.is_winner
                      ? <span className="badge badge-gold">🏆 Winner!</span>
                      : matched.length > 0
                        ? <span className="badge badge-green">{matched.length} Matched</span>
                        : <span className="badge badge-gray">No Match</span>
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── WINNINGS ──────────────────────────────────────────────
function WinningsSection({ user }) {
  const [winners, setWinners] = useState([])
  const [uploading, setUploading] = useState(null)

  useEffect(() => {
    supabase.from('winners').select('*, draws(month, year)').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setWinners(data || []))
  }, [user])

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const totalWon = winners.filter(w => w.payment_status === 'paid').reduce((s, w) => s + Number(w.prize_amount), 0)

  async function uploadProof(winnerId, file) {
    setUploading(winnerId)
    const ext = file.name.split('.').pop()
    const path = `proofs/${user.id}/${winnerId}.${ext}`
    const { data, error } = await supabase.storage.from('winner-proofs').upload(path, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('winner-proofs').getPublicUrl(path)
      await supabase.from('winners').update({ proof_url: urlData.publicUrl, payment_status: 'pending' }).eq('id', winnerId)
      supabase.from('winners').select('*, draws(month, year)').eq('user_id', user.id).then(({ data }) => setWinners(data || []))
    }
    setUploading(null)
  }

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>Winnings</h2>
      <p className="text-muted mb-6">Your prize history and payment status</p>

      <div className="card card-forest mb-8">
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Total Earned (Paid)</div>
            <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '2.5rem', fontWeight: 700, color: 'var(--gold-light)' }}>£{totalWon.toFixed(2)}</div>
          </div>
          <div style={{ fontSize: '3rem' }}>🏆</div>
        </div>
      </div>

      {winners.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
          <h3 style={{ marginBottom: 8 }}>No Winnings Yet</h3>
          <p className="text-muted">Keep entering draws — your time will come!</p>
        </div>
      ) : (
        <div className="stack gap-4">
          {winners.map(w => (
            <div key={w.id} className="card">
              <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>
                    {w.draws ? `${monthNames[w.draws.month - 1]} ${w.draws.year}` : 'Draw'} — {w.match_type}
                  </h3>
                  <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>
                    £{Number(w.prize_amount).toFixed(2)}
                  </div>
                  {w.admin_notes && <p className="text-muted text-sm mt-2">{w.admin_notes}</p>}
                </div>
                <div className="stack" style={{ alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge ${w.payment_status === 'paid' ? 'badge-green' : w.payment_status === 'rejected' ? 'badge-red' : 'badge-gold'}`}>
                    {w.payment_status === 'pending' ? '⏳ Pending Review' : w.payment_status === 'approved' ? '✅ Approved' : w.payment_status === 'paid' ? '💰 Paid' : '❌ Rejected'}
                  </span>
                  {(w.payment_status === 'pending' || w.payment_status === 'rejected') && !w.proof_url && (
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                      {uploading === w.id ? 'Uploading...' : '📷 Upload Proof'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadProof(w.id, e.target.files[0])} />
                    </label>
                  )}
                  {w.proof_url && <a href={w.proof_url} target="_blank" className="btn btn-ghost btn-sm">View Proof</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CHARITY ──────────────────────────────────────────────
function CharitySection({ profile, user, onUpdate }) {
  const [charities, setCharities] = useState([])
  const [charityId, setCharityId] = useState(profile?.charity_id || '')
  const [pct, setPct] = useState(profile?.charity_contribution_pct || 10)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    supabase.from('charities').select('*').eq('is_active', true).then(({ data }) => setCharities(data || []))
  }, [])

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({ charity_id: charityId, charity_contribution_pct: pct }).eq('id', user.id)
    setSaving(false); setSuccess('Charity preferences updated!')
    onUpdate()
  }

  const selected = charities.find(c => c.id === charityId)
  const monthlyAmount = ((profile?.subscription_plan === 'monthly' ? 9.99 : 99.99 / 12) * pct / 100).toFixed(2)

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>My Charity</h2>
      <p className="text-muted mb-8">Your subscription contributes to a cause you care about</p>

      {success && <div className="alert alert-success">{success}</div>}

      {selected && (
        <div className="card card-forest mb-6">
          <div className="flex gap-4" style={{ alignItems: 'center' }}>
            {selected.image_url && <img src={selected.image_url} alt={selected.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Currently Supporting</div>
              <h3 style={{ color: 'white', margin: 0 }}>{selected.name}</h3>
              <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginTop: 4 }}>£{monthlyAmount}/month · {pct}% of subscription</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Update Your Charity</h3>
        <div className="form-group mb-4">
          <label className="form-label">Choose Charity</label>
          <select className="form-input form-select" value={charityId} onChange={e => setCharityId(e.target.value)}>
            <option value="">— Select a charity —</option>
            {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group mb-6">
          <label className="form-label">Contribution: <strong>{pct}%</strong> = £{monthlyAmount}/month</label>
          <input type="range" min="10" max="100" value={pct} onChange={e => setPct(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--forest)', marginTop: 8 }} />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving || !charityId}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ── PROFILE ──────────────────────────────────────────────
function ProfileSection({ profile, user, onUpdate }) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    setSaving(false); setSuccess('Profile updated!')
    onUpdate()
  }

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>Profile Settings</h2>
      <p className="text-muted mb-8">Manage your account details</p>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card mb-6">
        <h3 style={{ marginBottom: 20 }}>Personal Information</h3>
        <div className="form-group mb-4">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div className="form-group mb-6">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" value={user?.email || ''} disabled style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-muted)' }} />
          <span className="form-hint">Email cannot be changed here</span>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Subscription Details</h3>
        <div className="grid-2">
          <div>
            <div className="text-muted text-sm mb-1">Plan</div>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{profile?.subscription_plan || 'None'}</div>
          </div>
          <div>
            <div className="text-muted text-sm mb-1">Status</div>
            <span className={`badge ${profile?.subscription_status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ textTransform: 'capitalize' }}>
              {profile?.subscription_status || 'Inactive'}
            </span>
          </div>
          <div>
            <div className="text-muted text-sm mb-1">Renewal Date</div>
            <div style={{ fontWeight: 500 }}>
              {profile?.subscription_renewal_date
                ? new Date(profile.subscription_renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-muted text-sm mb-1">Member Since</div>
            <div style={{ fontWeight: 500 }}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
