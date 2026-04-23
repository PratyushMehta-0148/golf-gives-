import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function DrawsPage() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('draws')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .then(({ data }) => { setDraws(data || []); setLoading(false) })
  }, [])

  const today = new Date()
  const daysUntilDraw = Math.ceil((new Date(today.getFullYear(), today.getMonth() + 1, 1) - today) / 86400000)

  return (
    <main>
      {/* Header */}
      <section style={{ background: 'var(--forest)', padding: '80px 0', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg-circle" style={{ width: 500, height: 500, background: 'rgba(201,168,76,0.07)', top: -150, right: -100 }} />
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Monthly Prize Draws</div>
          <h1 style={{ color: 'white', marginBottom: 16 }}>The Draw Engine</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 480, margin: '0 auto 40px' }}>
            Your last 5 Stableford scores become your draw numbers. Match 3, 4, or all 5 to win a share of the monthly prize pool.
          </p>

          {/* Countdown */}
          <div style={{
            display: 'inline-flex', gap: 32, background: 'rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius)', padding: '24px 40px', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)', flexWrap: 'wrap', justifyContent: 'center'
          }}>
            <div className="text-center">
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold-light)', lineHeight: 1 }}>{daysUntilDraw}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 6 }}>Days to Next Draw</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.12)' }} />
            <div className="text-center">
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold-light)', lineHeight: 1 }}>
                {MONTH_NAMES[today.getMonth()].slice(0,3)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 6 }}>Current Draw Month</div>
            </div>
          </div>
        </div>
      </section>

      {/* How Draws Work */}
      <section style={{ background: 'var(--cream)', padding: '64px 0' }}>
        <div className="container">
          <h2 className="text-center" style={{ marginBottom: 48 }}>How the Draw Works</h2>
          <div className="grid-3">
            {[
              { icon: '⛳', title: 'Your Scores = Your Numbers', desc: 'Your 5 most recent Stableford scores (1–45) automatically become your draw entries each month.' },
              { icon: '🎲', title: 'Monthly Draw', desc: 'On the last day of each month, 5 numbers are drawn — either randomly or algorithmically weighted by subscriber score data.' },
              { icon: '🏆', title: 'Match to Win', desc: 'Match 3, 4, or all 5 drawn numbers to win your tier of the prize pool. Jackpot rolls over if unclaimed.' },
            ].map(item => (
              <div key={item.title} className="card card-hover text-center">
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ marginBottom: 12 }}>{item.title}</h3>
                <p className="text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Tiers */}
      <section className="section">
        <div className="container">
          <h2 className="text-center" style={{ marginBottom: 16 }}>Prize Tiers</h2>
          <p className="text-center text-muted mb-8">Each tier receives a fixed percentage of the month's total prize pool</p>
          <div style={{ maxWidth: 640, margin: '0 auto' }} className="stack gap-4">
            {[
              { match: '5-Number Match', pct: '40%', emoji: '🏆', label: 'Jackpot', note: 'Rolls over if unclaimed', color: 'var(--gold)' },
              { match: '4-Number Match', pct: '35%', emoji: '🥇', label: 'Major Prize', note: 'Split among all 4-match winners', color: 'var(--forest-mid)' },
              { match: '3-Number Match', pct: '25%', emoji: '🥈', label: 'Starter Prize', note: 'Split among all 3-match winners', color: 'var(--sage)' },
            ].map(tier => (
              <div key={tier.match} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>{tier.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{tier.match}</div>
                  <div className="text-muted text-sm">{tier.note}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: tier.color, lineHeight: 1 }}>{tier.pct}</div>
                  <div className="text-muted text-xs">of pool</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Draws */}
      <section style={{ background: 'var(--cream)', padding: '64px 0' }}>
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>Past Draws</h2>
          <p className="text-muted mb-8">Results from previous monthly draws</p>

          {loading ? (
            <div className="flex-center" style={{ padding: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : draws.length === 0 ? (
            <div className="card text-center" style={{ padding: '60px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
              <h3 style={{ marginBottom: 8 }}>No Draws Yet</h3>
              <p className="text-muted">The first draw will be published at the end of this month.</p>
              <Link to="/signup" className="btn btn-primary mt-6">Join to Participate →</Link>
            </div>
          ) : (
            <div className="stack gap-4">
              {draws.map((draw, idx) => (
                <div key={draw.id} className="card" style={{ borderLeft: `4px solid ${idx === 0 ? 'var(--gold)' : 'var(--border)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0 }}>{MONTH_NAMES[draw.month - 1]} {draw.year}</h3>
                        {idx === 0 && <span className="badge badge-gold">Latest</span>}
                        <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{draw.draw_type}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {(draw.drawn_numbers || []).map(n => (
                          <div key={n} className="draw-ball">{n}</div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted text-xs mb-1">Prize Pool</div>
                      <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold)' }}>
                        £{Number(draw.prize_pool_total).toFixed(2)}
                      </div>
                      {draw.jackpot_rollover > 0 && (
                        <div className="text-sm text-muted mt-1">+ £{Number(draw.jackpot_rollover).toFixed(2)} rollover</div>
                      )}
                      <div className="text-xs text-muted mt-1">
                        {draw.published_at ? `Published ${new Date(draw.published_at).toLocaleDateString('en-GB')}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container text-center">
          <h2 style={{ marginBottom: 16 }}>Ready to Enter?</h2>
          <p className="text-muted mb-8" style={{ maxWidth: 400, margin: '0 auto 32px' }}>
            Subscribe, log your scores, and you're automatically entered into next month's draw.
          </p>
          <Link to="/signup" className="btn btn-gold btn-lg">Join GolfGives →</Link>
        </div>
      </section>
    </main>
  )
}
