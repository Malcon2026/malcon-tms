import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
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

  return (
    <>
      <Navbar />
      <main className="main">
        {view === 'dashboard' && <Dashboard />}
        {view === 'board' && <Board />}
        {view === 'admin' && <AdminDashboard />}
      </main>
      <TabBar />
      <TaskModal />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
