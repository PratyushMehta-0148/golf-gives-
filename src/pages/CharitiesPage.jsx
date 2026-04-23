import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CharitiesPage() {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false })
      .then(({ data }) => { setCharities(data || []); setLoading(false) })
  }, [])

  const featured = charities.find(c => c.is_featured)
  const rest = charities.filter(c =>
    !c.is_featured || search
      ? (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase())
      : !c.is_featured
  )

  return (
    <main>
      {/* Header */}
      <section style={{ background: 'var(--forest)', padding: '80px 0', color: 'white' }}>
        <div className="container text-center">
          <div style={{ fontSize: '0.8rem', color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Your Subscription Funds These Causes</div>
          <h1 style={{ color: 'white', marginBottom: 16 }}>Our Charity Partners</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 480, margin: '0 auto' }}>
            Choose a charity at signup and 10% or more of your monthly subscription goes directly to them. No fees, no middleman.
          </p>
        </div>
      </section>

      {/* Featured */}
      {featured && !search && (
        <section style={{ padding: '64px 0', background: 'var(--cream)' }}>
          <div className="container">
            <div className="badge badge-gold mb-6">⭐ Featured Charity</div>
            <div className="card" style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
              {featured.image_url && (
                <img src={featured.image_url} alt={featured.name}
                  style={{ width: 220, height: 180, objectFit: 'cover', borderRadius: 'var(--radius)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 240 }}>
                <h2 style={{ marginBottom: 12 }}>{featured.name}</h2>
                <p className="text-muted" style={{ marginBottom: 20, fontSize: '1.05rem' }}>{featured.description}</p>
                {featured.website_url && (
                  <a href={featured.website_url} target="_blank" className="btn btn-outline btn-sm">Visit Website ↗</a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search + Grid */}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 480, margin: '0 auto 48px' }}>
            <input type="text" className="form-input" placeholder="Search charities..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ textAlign: 'center', fontSize: '1rem' }} />
          </div>

          {loading ? (
            <div className="flex-center" style={{ padding: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : (
            <div className="grid-3">
              {charities.filter(c =>
                (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (c.description || '').toLowerCase().includes(search.toLowerCase())
              ).map(c => (
                <div key={c.id} className="card card-hover">
                  {c.image_url && (
                    <img src={c.image_url} alt={c.name}
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 20 }} />
                  )}
                  <div className="flex gap-2 mb-3" style={{ alignItems: 'center' }}>
                    {c.is_featured && <span className="badge badge-gold">⭐ Featured</span>}
                  </div>
                  <h3 style={{ marginBottom: 10 }}>{c.name}</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 16 }}>{c.description}</p>
                  {c.website_url && (
                    <a href={c.website_url} target="_blank" className="btn btn-ghost btn-sm" style={{ padding: '6px 0', color: 'var(--forest)' }}>
                      Visit website ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <p className="text-muted mb-4">Want to support one of these charities?</p>
            <Link to="/signup" className="btn btn-gold btn-lg">Join GolfGives →</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
