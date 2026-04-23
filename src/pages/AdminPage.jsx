import { useState, useEffect } from 'react'
import { supabase, PRIZE_DISTRIBUTION } from '../lib/supabase'

const ADMIN_SECTIONS = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'users', icon: '👥', label: 'Users' },
  { key: 'draws', icon: '🎯', label: 'Draw Engine' },
  { key: 'charities', icon: '💚', label: 'Charities' },
  { key: 'winners', icon: '🏆', label: 'Winners' },
]

export default function AdminPage() {
  const [active, setActive] = useState('overview')

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Admin Panel</div>
          <div style={{ fontWeight: 700, color: 'var(--gold-light)', fontSize: '1.1rem' }}>⚙️ Control Centre</div>
        </div>
        <div className="sidebar-section-title">Modules</div>
        {ADMIN_SECTIONS.map(s => (
          <div key={s.key} className={`sidebar-nav-item ${active === s.key ? 'active' : ''}`}
            onClick={() => setActive(s.key)}>
            <span>{s.icon}</span><span>{s.label}</span>
          </div>
        ))}
      </aside>
      <div className="dashboard-content">
        {active === 'overview' && <AdminOverview />}
        {active === 'users' && <AdminUsers />}
        {active === 'draws' && <AdminDraws />}
        {active === 'charities' && <AdminCharities />}
        {active === 'winners' && <AdminWinners />}
      </div>
    </div>
  )
}

// ── ADMIN OVERVIEW ──────────────────────────────────────
function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, active: 0, charityTotal: 0, prizePool: 0, draws: 0, winners: 0 })

  useEffect(() => {
    async function load() {
      const [users, subs, events, draws, winners] = await Promise.all([
        supabase.from('profiles').select('id, subscription_status', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('subscription_status', 'active'),
        supabase.from('subscription_events').select('amount, plan'),
        supabase.from('draws').select('prize_pool_total', { count: 'exact' }),
        supabase.from('winners').select('prize_amount', { count: 'exact' }),
      ])
      const totalRevenue = (events.data || []).reduce((s, e) => s + Number(e.amount), 0)
      const charityTotal = totalRevenue * 0.10
      const prizePool = (draws.data || []).reduce((s, d) => s + Number(d.prize_pool_total), 0)
      setStats({
        users: users.count || 0,
        active: subs.count || 0,
        charityTotal,
        prizePool,
        draws: draws.count || 0,
        winners: winners.count || 0,
      })
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: '👥', color: 'var(--forest)' },
    { label: 'Active Subscribers', value: stats.active, icon: '✅', color: 'var(--sage)' },
    { label: 'Charity Contributions', value: `£${stats.charityTotal.toFixed(2)}`, icon: '💚', color: '#2a7a2a' },
    { label: 'Total Prize Pool', value: `£${stats.prizePool.toFixed(2)}`, icon: '🏆', color: 'var(--gold)' },
    { label: 'Draws Run', value: stats.draws, icon: '🎯', color: 'var(--forest-mid)' },
    { label: 'Total Winners', value: stats.winners, icon: '🎉', color: '#a06a00' },
  ]

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>Admin Overview</h2>
      <p className="text-muted mb-8">Platform health at a glance</p>
      <div className="grid-3">
        {statCards.map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
            <div className="text-muted text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ADMIN USERS ──────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    const { data } = await supabase.from('profiles').select('*, charities(name)').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleSubscription(user) {
    const newStatus = user.subscription_status === 'active' ? 'lapsed' : 'active'
    await supabase.from('profiles').update({ subscription_status: newStatus }).eq('id', user.id)
    load()
  }

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>User Management</h2>
      <p className="text-muted mb-6">View and manage all platform users</p>

      <div className="card mb-6">
        <input type="text" className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <div className="flex-center" style={{ padding: 40 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Charity</th>
                  <th>Contrib.</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.full_name || '—'}</div>
                      <div className="text-muted text-xs">{u.email}</div>
                    </td>
                    <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{u.subscription_plan || '—'}</span></td>
                    <td>
                      <span className={`badge ${u.subscription_status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {u.subscription_status}
                      </span>
                    </td>
                    <td className="text-sm">{u.charities?.name || '—'}</td>
                    <td className="text-sm">{u.charity_contribution_pct}%</td>
                    <td className="text-sm text-muted">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleSubscription(u)}>
                        {u.subscription_status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center text-muted" style={{ padding: 32 }}>No users found</div>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ADMIN DRAWS ──────────────────────────────────────────
function AdminDraws() {
  const [draws, setDraws] = useState([])
  const [creating, setCreating] = useState(false)
  const [drawType, setDrawType] = useState('random')
  const [simResult, setSimResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const today = new Date()

  async function load() {
    const { data } = await supabase.from('draws').select('*').order('year', { ascending: false }).order('month', { ascending: false })
    setDraws(data || [])
  }

  useEffect(() => { load() }, [])

  async function getSubscriberCount() {
    const { count } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('subscription_status', 'active')
    return count || 0
  }

  function generateNumbers(type, scores) {
    if (type === 'random') {
      const nums = new Set()
      while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1)
      return [...nums]
    } else {
      // Algorithmic: weighted by frequency
      if (!scores || scores.length === 0) {
        const nums = new Set()
        while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1)
        return [...nums]
      }
      const freq = {}
      scores.forEach(s => { freq[s.score] = (freq[s.score] || 0) + 1 })
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
      const top = sorted.slice(0, 10).map(([n]) => Number(n))
      const nums = new Set()
      while (nums.size < 5 && top.length > nums.size) {
        nums.add(top[Math.floor(Math.random() * top.length)])
      }
      while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1)
      return [...nums]
    }
  }

  async function simulate() {
    setLoading(true)
    const { data: scores } = await supabase.from('golf_scores').select('score')
    const nums = generateNumbers(drawType, scores)
    const subCount = await getSubscriberCount()
    const prizePool = subCount * (drawType === 'monthly' ? 9.99 : 9.99) * 0.5
    setSimResult({ numbers: nums, prizePool: subCount * 5.00 })
    setLoading(false)
  }

  async function publishDraw() {
    if (!simResult) { alert('Please simulate first'); return }
    setLoading(true)
    const subCount = await getSubscriberCount()
    const prizePool = subCount * 5.00

    const { data: draw, error } = await supabase.from('draws').insert({
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      draw_type: drawType,
      drawn_numbers: simResult.numbers,
      status: 'published',
      prize_pool_total: prizePool,
      published_at: new Date().toISOString(),
    }).select().single()

    if (error) {
      if (error.code === '23505') alert('A draw for this month already exists.')
      else alert(error.message)
      setLoading(false); return
    }

    // Create draw entries for all active subscribers with 3+ scores
    const { data: eligibleUsers } = await supabase
      .from('profiles').select('id').eq('subscription_status', 'active')

    for (const user of eligibleUsers || []) {
      const { data: userScores } = await supabase.from('golf_scores').select('score').eq('user_id', user.id).limit(5)
      if (userScores && userScores.length >= 3) {
        const userNums = userScores.map(s => s.score)
        const matchCount = userNums.filter(n => simResult.numbers.includes(n)).length
        const isWinner = matchCount >= 3

        await supabase.from('draw_entries').insert({
          draw_id: draw.id, user_id: user.id,
          user_numbers: userNums, match_count: matchCount, is_winner: isWinner,
        })

        if (isWinner) {
          const matchType = matchCount >= 5 ? '5-match' : matchCount >= 4 ? '4-match' : '3-match'
          const tierPool = prizePool * PRIZE_DISTRIBUTION[matchType]
          // Prize will be split later based on total winners count
          await supabase.from('winners').insert({
            draw_id: draw.id, user_id: user.id,
            match_type: matchType, prize_amount: tierPool,
            payment_status: 'pending',
          })
        }
      }
    }

    setSimResult(null); setCreating(false)
    load()
    setLoading(false)
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="animate-fade-up">
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Draw Engine</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ Run New Draw</button>
      </div>
      <p className="text-muted mb-8">Configure, simulate, and publish monthly draws</p>

      {creating && (
        <div className="card mb-6" style={{ border: '2px solid var(--forest)' }}>
          <h3 style={{ marginBottom: 20 }}>New Draw — {monthNames[today.getMonth()]} {today.getFullYear()}</h3>
          <div className="form-group mb-4">
            <label className="form-label">Draw Logic</label>
            <div className="flex gap-3">
              {['random', 'algorithmic'].map(t => (
                <div key={t} onClick={() => setDrawType(t)} style={{
                  padding: '12px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  border: `2px solid ${drawType === t ? 'var(--forest)' : 'var(--border)'}`,
                  background: drawType === t ? 'rgba(26,58,42,0.06)' : 'white',
                  flex: 1, textAlign: 'center', fontWeight: drawType === t ? 600 : 400,
                  textTransform: 'capitalize', transition: 'all 0.2s'
                }}>{t}</div>
              ))}
            </div>
            <span className="form-hint">Random: standard lottery · Algorithmic: weighted by user score frequency</span>
          </div>

          {simResult && (
            <div className="card" style={{ background: 'rgba(90,138,106,0.05)', marginBottom: 20 }}>
              <div style={{ marginBottom: 12, fontWeight: 600 }}>Simulation Result</div>
              <div className="flex gap-3 mb-4">
                {simResult.numbers.map(n => <div key={n} className="draw-ball">{n}</div>)}
              </div>
              <p className="text-sm text-muted">Estimated prize pool: <strong>£{simResult.prizePool.toFixed(2)}</strong></p>
            </div>
          )}

          <div className="flex gap-3">
            <button className="btn btn-outline" onClick={() => { setCreating(false); setSimResult(null) }}>Cancel</button>
            <button className="btn btn-primary" onClick={simulate} disabled={loading}>
              {loading ? 'Simulating...' : '🎲 Simulate'}
            </button>
            {simResult && (
              <button className="btn btn-gold" onClick={publishDraw} disabled={loading}>
                {loading ? 'Publishing...' : '🚀 Publish Draw'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Draw History</h3>
        {draws.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 40 }}>No draws yet. Run your first draw above.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Month</th><th>Numbers Drawn</th><th>Prize Pool</th><th>Type</th><th>Status</th></tr>
              </thead>
              <tbody>
                {draws.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{monthNames[d.month - 1]} {d.year}</td>
                    <td>
                      <div className="flex gap-2">
                        {(d.drawn_numbers || []).map(n => (
                          <div key={n} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{n}</div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gold)' }}>£{Number(d.prize_pool_total).toFixed(2)}</td>
                    <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{d.draw_type}</span></td>
                    <td>
                      <span className={`badge ${d.status === 'published' ? 'badge-green' : 'badge-gold'}`} style={{ textTransform: 'capitalize' }}>{d.status}</span>
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

// ── ADMIN CHARITIES ──────────────────────────────────────
function AdminCharities() {
  const [charities, setCharities] = useState([])
  const [form, setForm] = useState({ name: '', description: '', image_url: '', website_url: '', is_featured: false })
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  async function load() {
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    setCharities(data || [])
  }

  useEffect(() => { load() }, [])

  async function saveCharity() {
    setSaving(true)
    await supabase.from('charities').insert(form)
    setSaving(false); setCreating(false); setForm({ name: '', description: '', image_url: '', website_url: '', is_featured: false })
    setSuccess('Charity added!'); load()
  }

  async function toggleActive(c) {
    await supabase.from('charities').update({ is_active: !c.is_active }).eq('id', c.id)
    load()
  }

  async function toggleFeatured(c) {
    await supabase.from('charities').update({ is_featured: !c.is_featured }).eq('id', c.id)
    load()
  }

  async function deleteCharity(id) {
    if (!confirm('Delete this charity?')) return
    await supabase.from('charities').delete().eq('id', id)
    load()
  }

  return (
    <div className="animate-fade-up">
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Charity Management</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ Add Charity</button>
      </div>
      <p className="text-muted mb-8">Manage the charity directory</p>

      {success && <div className="alert alert-success">{success}</div>}

      {creating && (
        <div className="card mb-6" style={{ border: '2px solid var(--forest)' }}>
          <h3 style={{ marginBottom: 20 }}>Add New Charity</h3>
          <div className="grid-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Charity Name" />
            </div>
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input type="url" className="form-input" value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows="3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Image URL</label>
            <input type="url" className="form-input" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://images.example.com/..." />
          </div>
          <div className="flex gap-3 mb-4" style={{ alignItems: 'center' }}>
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
            <label htmlFor="featured" style={{ cursor: 'pointer' }}>Featured on homepage</label>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveCharity} disabled={saving || !form.name}>
              {saving ? 'Saving...' : 'Add Charity'}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Charity</th><th>Featured</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {charities.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {c.image_url && <img src={c.image_url} alt={c.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="text-muted text-xs" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button className={`badge ${c.is_featured ? 'badge-gold' : 'badge-gray'}`} onClick={() => toggleFeatured(c)} style={{ cursor: 'pointer', border: 'none' }}>
                      {c.is_featured ? '⭐ Featured' : 'Not Featured'}
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => toggleActive(c)}>{c.is_active ? 'Disable' : 'Enable'}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteCharity(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── ADMIN WINNERS ────────────────────────────────────────
function AdminWinners() {
  const [winners, setWinners] = useState([])

  async function load() {
    const { data } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(month, year)')
      .order('created_at', { ascending: false })
    setWinners(data || [])
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    await supabase.from('winners').update({ payment_status: status }).eq('id', id)
    load()
  }

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="animate-fade-up">
      <h2 style={{ marginBottom: 4 }}>Winners Management</h2>
      <p className="text-muted mb-8">Verify submissions and manage payouts</p>

      <div className="card">
        {winners.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 40 }}>No winners yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Winner</th><th>Draw</th><th>Match</th><th>Prize</th><th>Proof</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {winners.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{w.profiles?.full_name || '—'}</div>
                      <div className="text-muted text-xs">{w.profiles?.email}</div>
                    </td>
                    <td className="text-sm">{w.draws ? `${monthNames[w.draws.month - 1]} ${w.draws.year}` : '—'}</td>
                    <td><span className="badge badge-gold">{w.match_type}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--gold)' }}>£{Number(w.prize_amount).toFixed(2)}</td>
                    <td>
                      {w.proof_url
                        ? <a href={w.proof_url} target="_blank" className="btn btn-outline btn-sm">View</a>
                        : <span className="text-muted text-sm">Not uploaded</span>}
                    </td>
                    <td>
                      <span className={`badge ${w.payment_status === 'paid' ? 'badge-green' : w.payment_status === 'approved' ? 'badge-green' : w.payment_status === 'rejected' ? 'badge-red' : 'badge-gold'}`} style={{ textTransform: 'capitalize' }}>
                        {w.payment_status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {w.payment_status === 'pending' && <>
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(w.id, 'approved')}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(w.id, 'rejected')}>Reject</button>
                        </>}
                        {w.payment_status === 'approved' && (
                          <button className="btn btn-gold btn-sm" onClick={() => updateStatus(w.id, 'paid')}>Mark Paid</button>
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
