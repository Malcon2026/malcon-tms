import { createContext, useContext, useEffect, useState } from 'react'
import { AVATAR_COLORS, COLUMN_MAP, KEYS, canDeleteTask, hash, load, save, uid } from '../lib/store'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => load(KEYS.users, []))
  const [session, setSession] = useState(() => load(KEYS.session, null))
  const [tasks, setTasks] = useState(() => load(KEYS.tasks, []))
  const [activity, setActivity] = useState(() => load(KEYS.activity, []))
  const [view, setView] = useState('dashboard')
  const [modalTask, setModalTask] = useState(null) // { id: 'new', status? } | { id: taskId }

  useEffect(() => { save(KEYS.users, users) }, [users])
  useEffect(() => { save(KEYS.session, session) }, [session])
  useEffect(() => { save(KEYS.tasks, tasks) }, [tasks])
  useEffect(() => { save(KEYS.activity, activity) }, [activity])

  const currentUser = users.find((u) => u.id === (session && session.userId)) || null

  function log(action, detail, userId = null, taskId = null) {
    const who = userId || (session && session.userId)
    if (!who) return
    setActivity((a) =>
      [{ id: uid(), userId: who, action, detail, taskId: taskId || null, at: Date.now() }, ...a].slice(0, 80)
    )
  }

  function register(name, email, password) {
    const e = (email || '').trim().toLowerCase()
    if (!name.trim()) return { error: 'Please enter your full name.' }
    if (!/^\S+@\S+\.\S+$/.test(e)) return { error: 'Please enter a valid email address.' }
    if ((password || '').length < 6) return { error: 'Password must be at least 6 characters.' }
    if (users.length > 0) return { error: 'Ask a workspace admin to create your account.' }
    if (users.some((u) => u.email === e)) return { error: 'An account with this email already exists.' }
    const user = {
      id: uid(),
      name: name.trim(),
      email: e,
      password: hash(password),
      role: 'admin',
      color: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
      createdAt: Date.now(),
    }
    setUsers((us) => [...us, user])
    setSession({ userId: user.id })
    log('joined', 'joined the workspace', user.id)
    return { ok: true }
  }

  function login(email, password) {
    const e = (email || '').trim().toLowerCase()
    const user = users.find((u) => u.email === e)
    if (!user || user.password !== hash(password)) return { error: 'Incorrect email or password.' }
    setSession({ userId: user.id })
    return { ok: true }
  }

  function logout() {
    setSession(null)
    setView('dashboard')
  }

  function openNewTask(defaults = {}) {
    setModalTask({ id: 'new', ...defaults })
  }
  function openEditTask(task) {
    setModalTask({ id: task.id })
  }
  function closeTaskModal() {
    setModalTask(null)
  }

  function addTask(data) {
    const now = Date.now()
    const task = {
      id: uid(),
      title: data.title.trim(),
      description: (data.description || '').trim(),
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      tags: data.tags || [],
      due: data.due || null,
      assigneeId: data.assigneeId || null,
      createdBy: currentUser ? currentUser.id : null,
      createdAt: now,
      updatedAt: now,
      completedAt: data.status === 'done' ? now : null,
    }
    setTasks((ts) => [task, ...ts])
    log('created', `created "${task.title}"`, null, task.id)
    return task
  }

  function updateTask(id, patch) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return
    const next = { ...prev, ...patch, updatedAt: Date.now() }
    if (next.status === 'done' && prev.status !== 'done') next.completedAt = Date.now()
    if (next.status !== 'done') next.completedAt = null
    setTasks((ts) => ts.map((t) => (t.id === id ? next : t)))
    if (patch.status && patch.status !== prev.status) {
      if (patch.status === 'done') log('completed', `completed "${next.title}"`, null, id)
      else log('moved', `moved "${next.title}" to ${COLUMN_MAP[patch.status].title}`, null, id)
    } else {
      log('updated', `updated "${next.title}"`, null, id)
    }
  }

  function moveTask(id, status) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev || prev.status === status) return
    updateTask(id, { status })
  }

  function deleteTask(id) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return { error: 'Task not found.' }
    if (!canDeleteTask(prev, currentUser)) {
      return { error: 'Only the person who created this task can delete it.' }
    }
    setTasks((ts) => ts.filter((t) => t.id !== id))
    log('deleted', `deleted "${prev.title}"`)
    closeTaskModal()
    return { ok: true }
  }

  function addMember(name, email, passwordInput = '') {
    const e = (email || '').trim().toLowerCase()
    const pwd = (passwordInput || '').trim()
    if (!name.trim()) return { error: 'Please enter a name.' }
    if (!/^\S+@\S+\.\S+$/.test(e)) return { error: 'Please enter a valid email address.' }
    if (pwd && pwd.length < 6) return { error: 'Password must be at least 6 characters.' }
    if (users.some((u) => u.email === e)) return { error: 'That email is already in the workspace.' }
    const generated = !pwd
    const password = generated ? 'flow-' + Math.random().toString(36).slice(2, 8) : pwd
    const user = {
      id: uid(),
      name: name.trim(),
      email: e,
      password: hash(password),
      role: 'admin',
      color: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
      createdAt: Date.now(),
    }
    setUsers((us) => [...us, user])
    log('invited', `created account for ${user.name}`)
    return { ok: true, user, password, generated }
  }

  function removeMember(id) {
    const member = users.find((u) => u.id === id)
    if (!member || member.id === currentUser.id) return
    setUsers((us) => us.filter((u) => u.id !== id))
    setTasks((ts) => ts.map((t) => (t.assigneeId === id ? { ...t, assigneeId: null } : t)))
    log('removed', `removed ${member.name} from the team`)
  }

  const value = {
    users,
    currentUser,
    tasks,
    activity,
    view,
    setView,
    modalTask,
    openNewTask,
    openEditTask,
    closeTaskModal,
    register,
    login,
    logout,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    canDeleteTask: (task) => canDeleteTask(task, currentUser),
    addMember,
    removeMember,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
