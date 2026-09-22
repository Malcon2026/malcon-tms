import { useApp } from '../context/AppContext'
import { BoardIcon, HomeIcon, LogoMark, UsersIcon } from './Icons'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: HomeIcon },
  { id: 'board', label: 'Board', Icon: BoardIcon },
  { id: 'admin', label: 'Team', Icon: UsersIcon },
]

export default function Sidebar() {
  const { view, setView } = useApp()

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <LogoMark size={26} />
        <span>Malcon TMS</span>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={'sidebar-nav-btn' + (view === id ? ' active' : '')}
            onClick={() => setView(id)}
            title={label}
          >
            <Icon size={22} />
            <span className="sidebar-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
