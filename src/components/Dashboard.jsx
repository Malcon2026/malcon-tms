import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './Avatar'
import {
  COLUMNS,
  COLUMN_MAP,
  PRIORITIES,
  PRIORITY_MAP,
  TASK_CARD_TINTS,
  dueLabel,
  isOverdue,
  taskInTimeRange,
  taskMatchesSearch,
  timeAgo,
  todayStr,
} from '../lib/store'
import { CheckIcon, PlusIcon } from './Icons'

function StatusDonut({ segments }) {
  const total = segments.reduce((n, s) => n + s.count, 0) || 1
  let offset = 0
  const r = 54
  const c = 2 * Math.PI * r
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" className="donut-chart">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#eef0f4" strokeWidth="16" />
        {segments.map((s) => {
          const len = (s.count / total) * c
          const el = (
            <circle
              key={s.id}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              strokeLinecap="butt"
            />
          )
          offset += len
          return el
        })}
        <text x="70" y="66" textAnchor="middle" className="donut-center-num">
          {total}
        </text>
        <text x="70" y="82" textAnchor="middle" className="donut-center-cap">
          tasks
        </text>
      </svg>
      <ul className="donut-legend">
        {segments.map((s) => (
          <li key={s.id}>
            <i style={{ background: s.color }} />
            <span>{s.label}</span>
            <em>{s.count}</em>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Dashboard() {
  const {
    tasks,
    users,
    activity,
    currentUser,
    searchQuery,
    timeRange,
    openEditTask,
    openNewTask,
    updateTask,
    setView,
  } = useApp()
  const [myFilter, setMyFilter] = useState('ongoing')

  const scoped = useMemo(
    () => tasks.filter((t) => taskInTimeRange(t, timeRange) && taskMatchesSearch(t, users, searchQuery)),
    [tasks, timeRange, searchQuery, users]
  )

  const myTasks = useMemo(() => {
    let list = scoped.filter(
      (t) => t.assigneeId === currentUser.id || (!t.assigneeId && t.createdBy === currentUser.id)
    )
    if (myFilter === 'today') list = list.filter((t) => t.due === todayStr())
    else if (myFilter === 'tomorrow') list = list.filter((t) => t.due === todayStr(1))
    else list = list.filter((t) => t.status !== 'done')
    return list.sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
  }, [scoped, currentUser.id, myFilter])

  const statusSegments = [
    {
      id: 'open',
      label: 'Not started',
      color: '#9aa3b2',
      count: scoped.filter((t) => t.status === 'todo').length,
    },
    {
      id: 'active',
      label: 'In progress',
      color: '#ff9500',
      count: scoped.filter((t) => t.status === 'inprogress' || t.status === 'review').length,
    },
    {
      id: 'done',
      label: 'Completed',
      color: '#0071e3',
      count: scoped.filter((t) => t.status === 'done').length,
    },
  ]

  const priorityRows = PRIORITIES.map((p) => ({
    ...p,
    count: scoped.filter((t) => t.priority === p.id && t.status !== 'done').length,
  }))
  const maxPri = Math.max(1, ...priorityRows.map((p) => p.count))

  const upcoming = scoped
    .filter((t) => t.status !== 'done' && t.due && t.due >= todayStr())
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5)

  const overdue = scoped.filter(isOverdue)
  const ongoingCount = scoped.filter(
    (t) =>
      (t.assigneeId === currentUser.id || (!t.assigneeId && t.createdBy === currentUser.id)) &&
      t.status !== 'done'
  ).length

  return (
    <div className="studio-dashboard">
      <div className="studio-grid">
        <section className="studio-panel studio-my-tasks">
          <header className="studio-panel-head">
            <h2>My Tasks</h2>
            <button type="button" className="studio-icon-btn" onClick={() => openNewTask()} aria-label="Add task">
              <PlusIcon size={18} />
            </button>
          </header>
          <div className="studio-task-tabs">
            <button
              type="button"
              className={myFilter === 'today' ? 'active' : ''}
              onClick={() => setMyFilter('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={myFilter === 'tomorrow' ? 'active' : ''}
              onClick={() => setMyFilter('tomorrow')}
            >
              Tomorrow
            </button>
            <button
              type="button"
              className={myFilter === 'ongoing' ? 'active' : ''}
              onClick={() => setMyFilter('ongoing')}
            >
              {ongoingCount} ongoing
            </button>
          </div>
          <div className="studio-task-list">
            {myTasks.length === 0 ? (
              <p className="empty-inline">No tasks in this view. Create one or check the board.</p>
            ) : (
              myTasks.map((t, i) => {
                const pri = PRIORITY_MAP[t.priority]
                return (
                  <article
                    key={t.id}
                    className="studio-task-card"
                    style={{ background: TASK_CARD_TINTS[i % TASK_CARD_TINTS.length] }}
                  >
                    <div className="studio-task-card-top">
                      <span className="studio-task-col">{COLUMN_MAP[t.status]?.title}</span>
                      <button
                        type="button"
                        className={'studio-check' + (t.status === 'done' ? ' done' : '')}
                        onClick={() =>
                          updateTask(t.id, { status: t.status === 'done' ? 'todo' : 'done' })
                        }
                        aria-label={t.status === 'done' ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <CheckIcon size={14} />
                      </button>
                    </div>
                    <button type="button" className="studio-task-body" onClick={() => openEditTask(t)}>
                      <h3>{t.title}</h3>
                      {t.description && <p>{t.description}</p>}
                      <div className="studio-task-meta">
                        <span className="pill mini" style={{ color: pri.color, background: pri.bg }}>
                          {pri.label}
                        </span>
                        {t.due && (
                          <span className={'studio-due' + (isOverdue(t) ? ' overdue' : '')}>
                            {dueLabel(t)}
                          </span>
                        )}
                      </div>
                    </button>
                  </article>
                )
              })
            )}
          </div>
        </section>

        <div className="studio-center">
          <section className="studio-panel">
            <h2 className="studio-panel-title">Tasks overview</h2>
            <StatusDonut segments={statusSegments} />
          </section>
          <section className="studio-panel">
            <h2 className="studio-panel-title">
              Priority breakdown <span className="card-note">open tasks</span>
            </h2>
            <div className="studio-bars">
              {priorityRows.map((p) => (
                <div key={p.id} className="studio-bar-row">
                  <span className="studio-bar-label">
                    <i style={{ background: p.color }} />
                    {p.label}
                  </span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(p.count / maxPri) * 100}%`, background: p.color }}
                    />
                  </div>
                  <span className="status-count">{p.count}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="studio-panel studio-status-panel">
            <h2 className="studio-panel-title">Status summary</h2>
            <div className="studio-bars">
              {COLUMNS.map((c) => {
                const count = scoped.filter((t) => t.status === c.id).length
                const max = Math.max(1, ...COLUMNS.map((col) => scoped.filter((t) => t.status === col.id).length))
                return (
                  <div key={c.id} className="studio-bar-row">
                    <span className="studio-bar-label">
                      <i style={{ background: c.dot }} />
                      {c.title}
                    </span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(count / max) * 100}%`, background: c.dot }}
                      />
                    </div>
                    <span className="status-count">{count}</span>
                  </div>
                )
              })}
            </div>
            {overdue.length > 0 && (
              <p className="card-foot">{overdue.length} overdue — review on the board.</p>
            )}
            <button type="button" className="card-link" onClick={() => setView('board')}>
              Open Kanban board →
            </button>
          </section>
        </div>

        <div className="studio-right">
          <section className="studio-panel">
            <h2 className="studio-panel-title">Upcoming due dates</h2>
            {upcoming.length === 0 ? (
              <p className="empty-inline">No upcoming deadlines in this period.</p>
            ) : (
              <ul className="studio-meetings">
                {upcoming.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => openEditTask(t)}>
                      <span className="studio-meet-time">{dueLabel(t)}</span>
                      <span className="studio-meet-title">{t.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="studio-panel">
            <h2 className="studio-panel-title">Team activity</h2>
            {activity.length === 0 ? (
              <p className="empty-inline">Updates from your team will appear here.</p>
            ) : (
              <ul className="studio-tickets">
                {activity.slice(0, 6).map((a) => {
                  const u = users.find((x) => x.id === a.userId)
                  return (
                    <li key={a.id} className="studio-ticket">
                      <Avatar user={u} size={32} />
                      <div className="studio-ticket-body">
                        <strong>{u ? u.name : 'Someone'}</strong>
                        <p>{a.detail}</p>
                        <span>{timeAgo(a.at)}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
