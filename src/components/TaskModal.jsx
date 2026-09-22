import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  COLUMNS,
  DUE_DAY_PRESETS,
  DUE_TIME_SLOTS,
  PRIORITIES,
  dueDayPresetForDate,
  todayStr,
} from '../lib/store'
import { PREPARATION_STATUS } from '../lib/workspace'
import { XIcon, TrashIcon } from './Icons'

export default function TaskModal() {
  const { modalTask, closeTaskModal, tasks, users, currentUser, addTask, updateTask, deleteTask, canDeleteTask } =
    useApp()
  const editing =
    modalTask && modalTask.id !== 'new' ? tasks.find((t) => t.id === modalTask.id) : null
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!modalTask) {
      setForm(null)
      setError('')
      return
    }
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description,
        status: editing.status,
        priority: editing.priority,
        due: editing.due || '',
        dueSlot: editing.dueSlot || '',
        assigneeId: editing.assigneeId || '',
        tags: (editing.tags || []).join(', '),
      })
    } else {
      setForm({
        title: '',
        description: '',
        status: modalTask.status || 'todo',
        priority: 'medium',
        due: todayStr(),
        dueSlot: '',
        assigneeId: currentUser?.id || '',
        tags: '',
      })
    }
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalTask, currentUser?.id])

  useEffect(() => {
    if (!modalTask) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e) {
      if (e.key === 'Escape') closeTaskModal()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [modalTask, closeTaskModal])

  const assigneeOptions = useMemo(() => {
    const list = [...users]
    if (currentUser && !list.some((u) => u.id === currentUser.id)) {
      list.unshift(currentUser)
    }
    return list
  }, [users, currentUser])

  if (!modalTask || !form) return null
  const f = form
  const creator = editing ? users.find((u) => u.id === editing.createdBy) : null
  const mayDelete = editing && canDeleteTask(editing)
  const assigneeMissingFromList =
    f.assigneeId && !assigneeOptions.some((u) => u.id === f.assigneeId)

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }))
    setError('')
  }

  function setDueSlot(slot) {
    setForm((prev) => ({ ...prev, dueSlot: slot }))
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!f.title.trim()) {
      setError('Please enter a title for this case.')
      return
    }
    setSaving(true)
    setError('')
    let assigneeId = f.assigneeId || currentUser?.id || null
    if (f.status === PREPARATION_STATUS && currentUser) {
      assigneeId = assigneeId || currentUser.id
    }
    const data = {
      title: f.title,
      description: f.description,
      status: f.status,
      priority: f.priority,
      due: f.due || null,
      dueSlot: f.dueSlot || null,
      assigneeId,
      tags: f.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    if (editing) {
      await updateTask(editing.id, data)
      closeTaskModal()
    } else {
      const result = await addTask(data)
      if (result?.error) {
        setError(result.error)
        setSaving(false)
        return
      }
      if (!result?.task) {
        setError('Could not save. Check your connection and try again.')
        setSaving(false)
        return
      }
      closeTaskModal()
    }
    setSaving(false)
  }

  return (
    <div className="modal-backdrop modal-backdrop--fullscreen" role="presentation">
      <form className="modal modal--fullscreen" onSubmit={submit} aria-labelledby="case-modal-title">
        <header className="modal-fullscreen-head">
          <div>
            <p className="modal-eyebrow">{editing ? 'Edit case' : 'New case'}</p>
            <h2 id="case-modal-title">{editing ? 'Update task details' : 'Create a case for your team'}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={closeTaskModal} aria-label="Close">
            <XIcon size={22} />
          </button>
        </header>

        <div className="modal-fullscreen-body">
          {error && (
            <div className="form-error modal-form-error" role="alert">
              {error}
            </div>
          )}

          <section className="modal-section">
            <h3 className="modal-section-title">Case details</h3>
            <label className="field-label">
              Title
              <input
                className="field field-lg"
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
                rows={4}
                value={f.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Context, hospital, patient notes, or handoff details…"
              />
            </label>
            <label className="field-label">
              Tags
              <input
                className="field"
                value={f.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="Urgent, follow-up (comma separated)"
              />
            </label>
          </section>

          <section className="modal-section">
            <h3 className="modal-section-title">Status & priority</h3>
            <div className="field-label">
              Board column
              <div className="segmented segmented-wrap">
                {COLUMNS.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={f.status === c.id ? 'active' : ''}
                    onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    status: c.id,
                    assigneeId:
                      c.id === PREPARATION_STATUS && currentUser
                        ? prev.assigneeId || currentUser.id
                        : prev.assigneeId,
                  }))
                  setError('')
                }}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="field-label">
              Priority
              <div className="segmented segmented-wrap">
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
          </section>

          <section className="modal-section">
            <h3 className="modal-section-title">Schedule</h3>
            <div className="due-picker">
              <div className="segmented segmented-wrap due-day-segmented">
                {DUE_DAY_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    className={dueDayPresetForDate(f.due) === preset.id ? 'active' : ''}
                    onClick={() => set('due', todayStr(preset.offset))}
                  >
                    {preset.label}
                  </button>
                ))}
                <button type="button" className={!f.due ? 'active' : ''} onClick={() => set('due', '')}>
                  No date
                </button>
              </div>
              <div className="field-row due-picker-row">
                <label className="field-label due-calendar">
                  Date
                  <input className="field" type="date" value={f.due} onChange={(e) => set('due', e.target.value)} />
                </label>
                <label className="field-label">
                  Time of day
                  <select
                    className="field"
                    value={f.dueSlot}
                    onChange={(e) => setDueSlot(e.target.value)}
                  >
                    <option value="">Any time</option>
                    {DUE_TIME_SLOTS.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.label} ({slot.short})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="segmented segmented-wrap due-slot-segmented">
                {DUE_TIME_SLOTS.map((slot) => (
                  <button
                    type="button"
                    key={slot.id}
                    className={f.dueSlot === slot.id ? 'active' : ''}
                    onClick={() => setDueSlot(f.dueSlot === slot.id ? '' : slot.id)}
                    title={slot.short}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="modal-section">
            <h3 className="modal-section-title">Assignment</h3>
            <div className="assignee-row">
              <label className="field-label assignee-field">
                Assign to
                <select
                  className="field"
                  value={assigneeMissingFromList ? '' : f.assigneeId}
                  onChange={(e) => set('assigneeId', e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {assigneeOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id === currentUser?.id ? `${u.name} (you)` : u.name}
                    </option>
                  ))}
                </select>
              </label>
              {currentUser && (
                <button
                  type="button"
                  className="btn-ghost assign-me-btn"
                  onClick={() => set('assigneeId', currentUser.id)}
                >
                  Assign to me
                </button>
              )}
            </div>
            {assigneeMissingFromList && (
              <p className="modal-meta">Previous assignee is no longer on the team — pick someone above.</p>
            )}
            {editing && creator && (
              <p className="modal-meta">
                Created by <strong>{creator.id === currentUser?.id ? 'you' : creator.name}</strong>
                {!mayDelete && ' · only they can delete this case'}
              </p>
            )}
          </section>
        </div>

        <footer className="modal-fullscreen-foot">
          {mayDelete ? (
            <button
              type="button"
              className="btn-danger"
              disabled={saving}
              onClick={() => deleteTask(editing.id)}
            >
              <TrashIcon size={15} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="modal-foot-right">
            <button type="button" className="btn-ghost" disabled={saving} onClick={closeTaskModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create case'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}
