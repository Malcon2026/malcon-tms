import { useApp } from '../context/AppContext'
import Avatar from './Avatar'
import { COLUMNS, PRIORITIES, dueLabel, isOverdue, timeAgo, todayStr } from '../lib/store'

function Ring({ pct }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <svg className="ring" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2997ff" />
          <stop offset="1" stopColor="#bf5af2" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r={r} stroke="#e8e8ed" strokeWidth="11" fill="none" />
      <circle
        cx="60"
        cy="60"
        r={r}
        stroke="url(#ringg)"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`}
        transform="rotate(-90 60 60)"
        className="ring-progress"
      />
      <text x="60" y="57" textAnchor="middle" className="ring-num">
        {pct}%
      </text>
      <text x="60" y="74" textAnchor="middle" className="ring-cap">
        complete
      </text>
    </svg>
  )
}

export default function Dashboard() {
  const { tasks, users, activity, currentUser, openEditTask, setView } = useApp()

  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const open = total - done
  const inProgress = tasks.filter((t) => t.status === 'inprogress').length
  const overdue = tasks.filter(isOverdue)
  const pct = total ? Math.round((done / total) * 100) : 0
  const myOpen = tasks.filter((t) => t.assigneeId === currentUser.id && t.status !== 'done')

  const h = new Date().getHours()
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  const attention = tasks
    .filter((t) => t.status !== 'done' && t.due && t.due <= todayStr())
    .sort((a, b) => a.due.localeCompare(b.due))

  const statusCounts = COLUMNS.map((c) => ({
    ...c,
    count: tasks.filter((t) => t.status === c.id).length,
  }))
  const maxStatus = Math.max(1, ...statusCounts.map((s) => s.count))

  const priorityCounts = PRIORITIES.map((p) => ({
    ...p,
    count: tasks.filter((t) => t.priority === p.id && t.status !== 'done').length,
  }))
  const maxPriority = Math.max(1, ...priorityCounts.map((p) => p.count))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>
            {greet}, {currentUser.name.split(' ')[0]}.
          </h1>
          <p className="page-sub">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}You have {myOpen.length} open task{myOpen.length === 1 ? '' : 's'}
            {open === 0 && ' · nice and quiet out there.'}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total tasks</span>
          <span className="stat-num">{total}</span>
          <span className="stat-sub">{open} still open</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In progress</span>
          <span className="stat-num">{inProgress}</span>
          <span className="stat-sub">moving right now</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-num">{done}</span>
          <span className="stat-sub">{pct}% of everything</span>
        </div>
        <div className={'stat-card' + (overdue.length ? ' alert' : '')}>
          <span className="stat-label">Overdue</span>
          <span className="stat-num">{overdue.length}</span>
          <span className="stat-sub">{overdue.length ? 'needs your attention' : 'all clear'}</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Progress at a glance</h3>
          <div className="progress-wrap">
            <Ring pct={pct} />
            <div className="status-bars">
              {statusCounts.map((s) => (
                <div key={s.id} className="status-row">
                  <span className="status-name">
                    <i style={{ background: s.dot }} />
                    {s.title}
                  </span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(s.count / maxStatus) * 100}%`, background: s.dot }}
                    />
                  </div>
                  <span className="status-count">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">
            Priority mix <span className="card-note">open tasks only</span>
          </h3>
          <div className="priority-bars">
            {priorityCounts.map((p) => (
              <div key={p.id} className="status-row">
                <span className="status-name">
                  <i style={{ background: p.color }} />
                  {p.label}
                </span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(p.count / maxPriority) * 100}%`, background: p.color }}
                  />
                </div>
                <span className="status-count">{p.count}</span>
              </div>
            ))}
          </div>
          <p className="card-foot">
            {overdue.length
              ? `${overdue.length} task${overdue.length === 1 ? '' : 's'} past due — a quick pass over the board will help.`
              : 'Nothing overdue. Keep it up.'}
          </p>
        </div>

        <div className="card">
          <h3 className="card-title">Needs attention</h3>
          {attention.length === 0 ? (
            <p className="empty-inline">Nothing due today or overdue. Enjoy the calm.</p>
          ) : (
            <div className="attention-list">
              {attention.slice(0, 6).map((t) => {
                const p = PRIORITIES.find((x) => x.id === t.priority)
                const a = users.find((u) => u.id === t.assigneeId)
                return (
                  <button key={t.id} className="attention-row" onClick={() => openEditTask(t)}>
                    <span className="dot" style={{ background: p.color }} />
                    <span className="attention-main">
                      <span className="attention-title">{t.title}</span>
                      <span className={'attention-due' + (isOverdue(t) ? ' overdue' : '')}>
                        {dueLabel(t)}
                      </span>
                    </span>
                    <Avatar user={a} size={26} />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Recent activity</h3>
          {activity.length === 0 ? (
            <p className="empty-inline">Activity will show up here as your team works.</p>
          ) : (
            <div className="activity-list">
              {activity.slice(0, 7).map((a) => {
                const u = users.find((x) => x.id === a.userId)
                return (
                  <div key={a.id} className="activity-row">
                    <Avatar user={u} size={26} />
                    <span className="activity-text">
                      <strong>{u ? u.name.split(' ')[0] : 'Someone'}</strong> {a.detail}
                    </span>
                    <span className="activity-time">{timeAgo(a.at)}</span>
                  </div>
                )
              })}
            </div>
          )}
          <button className="card-link" onClick={() => setView('board')}>
            Open the board →
          </button>
        </div>
      </div>
    </div>
  )
}
