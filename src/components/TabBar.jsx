import { useApp } from '../context/AppContext'
import { BoardIcon, UsersIcon } from './Icons'

export default function TabBar() {
  const { view, setView } = useApp()
  const items = [
    { id: 'dashboard', label: 'Workspace', Icon: BoardIcon },
    { id: 'admin', label: 'Admin', Icon: UsersIcon },
  ]
  return (
    <nav className="tabbar">
      {items.map(({ id, label, Icon: I }) => (
        <button
          key={id}
          className={
            'tab' +
            (id === 'dashboard'
              ? view === 'dashboard' || view === 'board'
                ? ' active'
                : ''
              : view === id
                ? ' active'
                : '')
          }
          onClick={() => setView(id)}
        >
          <I size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
