import Board from './Board'
import Dashboard from './Dashboard'

export default function HomeView() {
  return (
    <div className="home-split page">
      <section className="home-board-pane" aria-label="Kanban board">
        <Board embedded />
      </section>
      <aside className="home-dash-pane" aria-label="Dashboard">
        <Dashboard sidebar />
      </aside>
    </div>
  )
}
