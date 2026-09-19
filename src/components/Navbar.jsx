import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './Avatar'
import { LogoMark, PlusIcon, LogoutIcon } from './Icons'

const LINKS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'board', label: 'Board' },
  { id: 'admin', label: 'Admin' },
]

export default function Navbar() {
  const { view, setView, currentUser, logout, openNewTask } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="brand" onClick={() => setView('dashboard')}>
          <LogoMark />
          <span>Malcon TMS</span>
        </button>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <button
              key={l.id}
              className={'nav-link' + (view === l.id ? ' active' : '')}
              onClick={() => setView(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="nav-right">
        <button className="btn-primary nav-new" onClick={() => openNewTask()}>
          <PlusIcon size={15} />
          <span>New task</span>
        </button>
        <div className="avatar-menu">
          <button className="avatar-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu">
            <Avatar user={currentUser} size={30} />
          </button>
          {menuOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="menu">
                <div className="menu-head">
                  <Avatar user={currentUser} size={34} />
                  <div>
                    <div className="menu-name">{currentUser.name}</div>
                    <div className="menu-email">{currentUser.email}</div>
                  </div>
                </div>
                <button
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                >
                  <LogoutIcon size={16} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
