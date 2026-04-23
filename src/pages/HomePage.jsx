import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [charities, setCharities] = useState([])
  const [draws, setDraws] = useState([])

  useEffect(() => {
    supabase.from('charities').select('*').eq('is_featured', true).limit(3).then(({ data }) => setCharities(data || []))
    supabase.from('draws').select('*').eq('status', 'published').order('year', { ascending: false }).order('month', { ascending: false }).limit(3).then(({ data }) => setDraws(data || []))
  }, [])

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero">
        {/* Background decorative circles */}
        <div className="hero-bg-circle" style={{ width: 600, height: 600, background: 'rgba(90,138,106,0.12)', top: -100, right: -200 }} />
        <div className="hero-bg-circle" style={{ width: 400, height: 400, background: 'rgba(201,168,76,0.08)', bottom: -100, left: -100 }} />

        <div className="container" style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 680 }}>
            <div className="badge badge-gold animate-fade-up" style={{ marginBottom: 24 }}>
              ✦ The Golf Platform That Gives Back
            </div>
            <h1 className="animate-fade-up animate-delay-1" style={{ color: 'white', marginBottom: 24 }}>
              Play Your Best Golf.{' '}
              <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--gold-light)' }}>
                Win Prizes.
              </span>{' '}
              Fund Change.
            </h1>
            <p className="animate-fade-up animate-delay-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.15rem', maxWidth: 520, marginBottom: 40 }}>
              Track your Stableford scores, enter monthly prize draws, and automatically donate to the charity closest to your heart — all in one beautifully designed platform.
            </p>

            <div className="flex gap-4 animate-fade-up animate-delay-3" style={{ flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-gold btn-lg">
                Start Playing & Giving →
              </Link>
              <Link to="/draws" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 50, padding: '18px 36px', backdropFilter: 'blur(8px)' }}>
                See How It Works
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex gap-4 animate-fade-up animate-delay-4" style={{ marginTop: 60, flexWrap: 'wrap' }}>
              {[
                { n: '£50K+', l: 'Prize Pool Distributed' },
                { n: '12+', l: 'Charities Supported' },
                { n: '2,400+', l: 'Active Members' },
              ].map(s => (
                <div key={s.l} style={{ paddingRight: 40, borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-light)' }}>{s.n}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <p className="text-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Simple by Design</p>
            <h2>How GolfGives Works</h2>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '📋', title: 'Subscribe', desc: 'Choose monthly or yearly. A portion of your subscription automatically goes to charity — you pick which one.' },
              { step: '02', icon: '⛳', title: 'Track Your Scores', desc: 'Enter your last 5 Stableford scores (1–45). Your most recent 5 always count. One score per day, no duplicates.' },
              { step: '03', icon: '🎯', title: 'Enter the Draw', desc: 'Your scores become your draw numbers. Match 3, 4, or all 5 to win your share of the monthly prize pool.' },
            ].map(item => (
              <div key={item.step} className="card card-hover animate-fade-up">
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--sage)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>STEP {item.step}</div>
                <h3 style={{ marginBottom: 12 }}>{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOL ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 64 }}>
            <div>
              <p className="text-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Monthly Prize Draws</p>
              <h2 style={{ marginBottom: 20 }}>Win Big. <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--forest)' }}>Every Month.</span></h2>
              <p className="text-muted" style={{ marginBottom: 32 }}>Your 5 Stableford scores are your lottery numbers. The more you match the drawn numbers, the bigger your share of the prize pool.</p>
              <Link to="/signup" className="btn btn-primary">Join & Enter This Month</Link>
            </div>
            <div className="stack gap-3">
              {[
                { type: '5-Number Match', pct: '40%', prize: '£2,400+', badge: '🏆 Jackpot', color: 'var(--gold)', rolls: true },
                { type: '4-Number Match', pct: '35%', prize: '£2,100+', badge: '🥇 Major', color: 'var(--forest-mid)', rolls: false },
                { type: '3-Number Match', pct: '25%', prize: '£1,500+', badge: '🥈 Starter', color: 'var(--sage)', rolls: false },
              ].map(p => (
                <div key={p.type} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '1rem' }}>{p.badge}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.type}</span>
                    </div>
                    <div className="text-muted text-sm">{p.pct} of prize pool{p.rolls ? ' · Jackpot rolls over' : ''}</div>
                  </div>
                  <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: p.color }}>{p.prize}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CHARITIES ─────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--forest)', color: 'white' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mint)', marginBottom: 12 }}>Your Subscription. Your Choice.</p>
            <h2 style={{ color: 'white', marginBottom: 16 }}>Every Subscription <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--gold-light)' }}>Funds a Cause</span></h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto' }}>At least 10% of your subscription goes directly to the charity you choose. You can give more any time.</p>
          </div>
          {charities.length > 0 ? (
            <div className="grid-3">
              {charities.map(c => (
                <div key={c.id} className="card-hover" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {c.image_url && <img src={c.image_url} alt={c.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                  <div style={{ padding: 24 }}>
                    <h3 style={{ color: 'white', marginBottom: 8 }}>{c.name}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <p>Charities loading...</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/charities" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', backdropFilter: 'blur(8px)' }}>
              View All Charities →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container text-center">
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⛳</div>
            <h2 style={{ marginBottom: 16 }}>Ready to Play for Good?</h2>
            <p className="text-muted" style={{ marginBottom: 36 }}>Join thousands of golfers using their passion to fund the causes they care about — while competing for life-changing monthly prizes.</p>
            <Link to="/signup" className="btn btn-gold btn-lg">
              Get Started — From £9.99/mo
            </Link>
            <p className="text-muted text-sm mt-3">Cancel anytime · Secured by Stripe · HTTPS encrypted</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer style={{ background: 'var(--charcoal)', color: 'rgba(255,255,255,0.5)', padding: '40px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="nav-logo flex-center mb-4" style={{ justifyContent: 'center', color: 'white' }}>
            <span className="logo-icon">⛳</span> GolfGives
          </div>
          <p className="text-sm">© 2025 GolfGives. All rights reserved. · A Digital Heroes Build</p>
        </div>
      </footer>
    </main>
  )
}
