import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import TabBar from './components/TabBar'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import Board from './components/Board'
import AdminDashboard from './components/AdminDashboard'
import TaskModal from './components/TaskModal'

function Shell() {
  const { currentUser, view } = useApp()
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
