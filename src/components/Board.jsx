import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { COLUMNS } from '../lib/store'
import TaskCard from './TaskCard'
import { SearchIcon, PlusIcon } from './Icons'

export default function Board() {
  const { tasks, users, moveTask, openNewTask } = useApp()
  const [query, setQuery] = useState('')
  const [prio, setPrio] = useState('all')
  const [dragOver, setDragOver] = useState(null)
  const [dragId, setDragId] = useState(null)

  const q = query.trim().toLowerCase()

  function visible(t) {
    if (prio !== 'all' && t.priority !== prio) return false
    if (!q) return true
    const a = users.find((u) => u.id === t.assigneeId)
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(q)) ||
      (a && a.name.toLowerCase().includes(q))
    )
  }

  function handleDrop(e, status) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || dragId
    if (id) moveTask(id, status)
    setDragOver(null)
    setDragId(null)
  }

  return (
    <div className="page">
      <div className="page-head board-head">
        <div>
          <h1>Board.</h1>
          <p className="page-sub">Drag cards between columns — or tap the arrows on mobile.</p>
        </div>
        <div className="board-tools">
          <div className="search-box">
            <SearchIcon size={16} />
            <input
              placeholder="Search tasks, tags, people…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className="filter-select" value={prio} onChange={(e) => setPrio(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="board">
        {COLUMNS.map((col, ci) => {
          const list = tasks.filter((t) => t.status === col.id && visible(t))
          return (
            <section
              key={col.id}
              className={'board-col' + (dragOver === col.id ? ' drag-over' : '')}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragOver !== col.id) setDragOver(col.id)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null)
              }}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <header className="col-head">
                <span className="col-title">
                  <i style={{ background: col.dot }} />
                  {col.title}
                  <em className="col-count">{list.length}</em>
                </span>
                <button
                  className="col-add"
                  title={`Add to ${col.title}`}
                  onClick={() => openNewTask({ status: col.id })}
                >
                  <PlusIcon size={15} />
                </button>
              </header>
              <div className="col-body">
                {list.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    column={ci}
                    onDragStartCard={setDragId}
                    onDragEndCard={() => {
                      setDragId(null)
                      setDragOver(null)
                    }}
                  />
                ))}
                {list.length === 0 && <div className="col-empty">Nothing here</div>}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
