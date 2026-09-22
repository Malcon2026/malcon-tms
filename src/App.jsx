import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import AppHeader from './components/AppHeader'
import TabBar from './components/TabBar'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import Board from './components/Board'
import AdminDashboard from './components/AdminDashboard'
import TaskModal from './components/TaskModal'

function ConfigMissing() {
  return (
    <div className="app-loading">
      <h1>Malcon TMS</h1>
      <p>
        Supabase is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment (see <code>.env.example</code>
        ).
      </p>
    </div>
  )
}

const VIEW_META = {
  dashboard: {
    title: 'Project Dashboard',
    subtitle: 'Manage and track your team tasks.',
  },
  board: {
    title: 'Task Board',
    subtitle: 'Drag cards between columns — or use arrows on mobile.',
  },
  admin: {
    title: 'Team & settings',
    subtitle: 'Add colleagues and view workload.',
  },
}

function Shell() {
  const { ready, supabaseConfigured, currentUser, view } = useApp()

  if (!ready) {
    return (
      <div className="app-loading">
        <p>Loading Malcon TMS…</p>
      </div>
    )
  }

  if (!supabaseConfigured) return <ConfigMissing />
  if (!currentUser) return <AuthPage />

  const meta = VIEW_META[view] || VIEW_META.dashboard

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <AppHeader title={meta.title} subtitle={meta.subtitle} />
        <div className="app-content">
          {view === 'dashboard' && <Dashboard />}
          {view === 'board' && <Board />}
          {view === 'admin' && <AdminDashboard />}
        </div>
      </div>
      <TabBar />
      <TaskModal />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
