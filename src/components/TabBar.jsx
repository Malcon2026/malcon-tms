import { useApp } from '../context/AppContext'
import { HomeIcon, BoardIcon, UsersIcon } from './Icons'

export default function TabBar() {
  const { view, setView } = useApp()
  const items = [
    { id: 'dashboard', label: 'Dashboard', Icon: HomeIcon },
    { id: 'board', label: 'Board', Icon: BoardIcon },
    { id: 'admin', label: 'Admin', Icon: UsersIcon },
  ]
  return (
    <nav className="tabbar">
      {items.map(({ id, label, Icon: I }) => (
        <button key={id} className={'tab' + (view === id ? ' active' : '')} onClick={() => setView(id)}>
          <I size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
