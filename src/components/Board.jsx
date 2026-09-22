import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  COLUMNS,
  DUE_DAY_PRESETS,
  DUE_TIME_SLOTS,
  taskInTimeRange,
  taskMatchesDueFilter,
  taskMatchesDueSlotFilter,
  taskMatchesSearch,
} from '../lib/store'
import TaskCard from './TaskCard'
import { SearchIcon, PlusIcon } from './Icons'

export default function Board() {
  const { tasks, users, moveTask, openNewTask, searchQuery, timeRange } = useApp()
  const [query, setQuery] = useState('')
  const [prio, setPrio] = useState('all')
  const [dueFilter, setDueFilter] = useState('all')
  const [dueSlotFilter, setDueSlotFilter] = useState('all')
  const [dragOver, setDragOver] = useState(null)
  const [dragId, setDragId] = useState(null)

  const q = query.trim().toLowerCase()

  function visible(t) {
    if (!taskInTimeRange(t, timeRange)) return false
    if (!taskMatchesSearch(t, users, searchQuery)) return false
    if (prio !== 'all' && t.priority !== prio) return false
    if (!taskMatchesDueFilter(t, dueFilter)) return false
    if (!taskMatchesDueSlotFilter(t, dueSlotFilter)) return false
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
    <div className="page board-page">
      <div className="board-tools board-tools-standalone">
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
          <select className="filter-select" value={dueFilter} onChange={(e) => setDueFilter(e.target.value)}>
            <option value="all">All dates</option>
            {DUE_DAY_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="overdue">Overdue</option>
            <option value="none">No due date</option>
          </select>
          <select className="filter-select" value={dueSlotFilter} onChange={(e) => setDueSlotFilter(e.target.value)}>
            <option value="all">All times</option>
            <option value="any">Has time of day</option>
            {DUE_TIME_SLOTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
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
