import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { COLUMNS, PRIORITIES } from '../lib/store'
import { XIcon, TrashIcon } from './Icons'

export default function TaskModal() {
  const { modalTask, closeTaskModal, tasks, users, currentUser, addTask, updateTask, deleteTask, canDeleteTask } =
    useApp()
  const editing =
    modalTask && modalTask.id !== 'new' ? tasks.find((t) => t.id === modalTask.id) : null
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (!modalTask) {
      setForm(null)
      return
    }
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description,
        status: editing.status,
        priority: editing.priority,
        due: editing.due || '',
        assigneeId: editing.assigneeId || '',
        tags: (editing.tags || []).join(', '),
      })
    } else {
      setForm({
        title: '',
        description: '',
        status: modalTask.status || 'todo',
        priority: 'medium',
        due: '',
        assigneeId: '',
        tags: '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalTask])

  if (!modalTask || !form) return null
  const f = form
  const creator = editing ? users.find((u) => u.id === editing.createdBy) : null
  const mayDelete = editing && canDeleteTask(editing)

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function submit(e) {
    e.preventDefault()
    if (!f.title.trim()) return
    const data = {
      title: f.title,
      description: f.description,
      status: f.status,
      priority: f.priority,
      due: f.due || null,
      assigneeId: f.assigneeId || null,
      tags: f.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    if (editing) await updateTask(editing.id, data)
    else await addTask(data)
    closeTaskModal()
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeTaskModal()
      }}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h3>{editing ? 'Edit task' : 'New task'}</h3>
          <button type="button" className="icon-btn" onClick={closeTaskModal} aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>

        <label className="field-label">
          Title
          <input
            className="field"
            autoFocus
            value={f.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="What needs to be done?"
          />
        </label>

        <label className="field-label">
          Notes
          <textarea
            className="field textarea"
            rows={3}
            value={f.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Add a little context…"
          />
        </label>

        <div className="field-label">
          Column
          <div className="segmented">
            {COLUMNS.map((c) => (
              <button
                type="button"
                key={c.id}
                className={f.status === c.id ? 'active' : ''}
                onClick={() => set('status', c.id)}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        <div className="field-label">
          Priority
          <div className="segmented">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p.id}
                className={f.priority === p.id ? 'active' : ''}
                style={f.priority === p.id ? { color: p.color } : undefined}
                onClick={() => set('priority', p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <label className="field-label">
            Due date
            <input className="field" type="date" value={f.due} onChange={(e) => set('due', e.target.value)} />
          </label>
          <label className="field-label">
            Assignee
            <select className="field" value={f.assigneeId} onChange={(e) => set('assigneeId', e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field-label">
          Tags
          <input
            className="field"
            value={f.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="Design, Marketing (comma separated)"
          />
        </label>

        {editing && creator && (
          <p className="modal-meta">
            Created by <strong>{creator.id === currentUser?.id ? 'you' : creator.name}</strong>
            {!mayDelete && ' · only they can delete this task'}
          </p>
        )}

        <div className="modal-foot">
          {mayDelete ? (
            <button type="button" className="btn-danger" onClick={() => deleteTask(editing.id)}>
              <TrashIcon size={15} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="modal-foot-right">
            <button type="button" className="btn-ghost" onClick={closeTaskModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save task
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
