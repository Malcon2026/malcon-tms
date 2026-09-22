import { useApp } from '../context/AppContext'
import { COLUMNS, PRIORITY_MAP, dueLabel, isOverdue } from '../lib/store'
import Avatar from './Avatar'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

export default function TaskCard({ task, column, onDragStartCard, onDragEndCard }) {
  const { users, moveTask, openEditTask } = useApp()
  const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium
  const assignee = users.find((u) => u.id === task.assigneeId)
  const overdue = isOverdue(task)
  const due = dueLabel(task)

  return (
    <article
      className={'task-card' + (task.status === 'done' ? ' done' : '')}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStartCard(task.id)
      }}
      onDragEnd={onDragEndCard}
      onClick={() => openEditTask(task)}
    >
      <div className="card-top">
        <span className="pill" style={{ color: p.color, background: p.bg }}>
          <i style={{ background: p.color }} />
          {p.label}
        </span>
        {due && (
          <span className={'card-due' + (overdue ? ' overdue' : '')}>{due}</span>
        )}
      </div>

      <h4 className="card-title">{task.title}</h4>
      {task.description && <p className="card-desc">{task.description}</p>}

      {task.tags && task.tags.filter((tag) => !tag.startsWith('__due:')).length > 0 && (
        <div className="card-tags">
          {task.tags.filter((tag) => !tag.startsWith('__due:')).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-bottom">
        <Avatar user={assignee} size={24} />
        <div className="card-actions">
          {column > 0 && (
            <button
              className="move-btn"
              title={`Move to ${COLUMNS[column - 1].title}`}
              onClick={(e) => {
                e.stopPropagation()
                moveTask(task.id, COLUMNS[column - 1].id)
              }}
            >
              <ChevronLeftIcon size={14} />
            </button>
          )}
          {column < COLUMNS.length - 1 && (
            <button
              className="move-btn"
              title={`Move to ${COLUMNS[column + 1].title}`}
              onClick={(e) => {
                e.stopPropagation()
                moveTask(task.id, COLUMNS[column + 1].id)
              }}
            >
              <ChevronRightIcon size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
