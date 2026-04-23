import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⛳</span>
          GolfGives
        </Link>

        <div className="flex gap-4 hide-mobile" style={{ alignItems: 'center' }}>
          <Link to="/charities" className="btn btn-ghost btn-sm">Charities</Link>
          <Link to="/draws" className="btn btn-ghost btn-sm">Draws</Link>

          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-gold btn-sm">Join Now</Link>
            </>
          ) : (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn btn-ghost btn-sm" style={{ color: 'var(--gold)' }}>Admin</Link>
              )}
              <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
              <button onClick={handleSignOut} className="btn btn-ghost btn-sm">Sign Out</button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="btn btn-ghost btn-sm" style={{ display: 'none' }} onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu" id="mobile-menu-btn">☰</button>
      </div>
    </nav>
  )
}
