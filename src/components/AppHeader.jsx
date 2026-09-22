import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './Avatar'
import { LogoutIcon, PlusIcon, SearchIcon } from './Icons'

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All' },
]

export default function AppHeader({ title, subtitle }) {
  const {
    currentUser,
    searchQuery,
    setSearchQuery,
    timeRange,
    setTimeRange,
    openNewTask,
    logout,
  } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="app-header">
      <div className="app-header-top">
        <div className="app-header-periods">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={'period-pill' + (timeRange === p.id ? ' active' : '')}
              onClick={() => setTimeRange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="app-header-user">
          <button type="button" className="btn-primary header-new" onClick={() => openNewTask()}>
            <PlusIcon size={15} />
            <span>New task</span>
          </button>
          <button
            type="button"
            className="header-profile"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Account menu"
          >
            <Avatar user={currentUser} size={36} />
            <div className="header-profile-text">
              <strong>{currentUser.name}</strong>
              <span>Workspace admin</span>
            </div>
          </button>
          {menuOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="menu header-menu">
                <div className="menu-head">
                  <Avatar user={currentUser} size={34} />
                  <div>
                    <div className="menu-name">{currentUser.name}</div>
                    <div className="menu-email">{currentUser.email}</div>
                  </div>
                </div>
                <button
                  type="button"
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
      <div className="app-header-main">
        <div>
          <h1 className="app-page-title">{title}</h1>
          {subtitle && <p className="app-page-sub">{subtitle}</p>}
        </div>
        <div className="app-header-search">
          <SearchIcon size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, tags, people…"
          />
        </div>
      </div>
    </header>
  )
}
