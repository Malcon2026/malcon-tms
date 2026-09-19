import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { COLUMN_MAP, canDeleteTask } from '../lib/store'
import {
  mapActivity,
  mapProfile,
  mapTask,
  supabase,
  supabaseConfigured,
  taskToRow,
} from '../lib/supabase'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [workspaceEmpty, setWorkspaceEmpty] = useState(true)
  const [users, setUsers] = useState([])
  const [sessionUserId, setSessionUserId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [activity, setActivity] = useState([])
  const [view, setView] = useState('dashboard')
  const [modalTask, setModalTask] = useState(null)

  const currentUser = users.find((u) => u.id === sessionUserId) || null

  const refreshWorkspaceEmpty = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.rpc('malcon_tms_workspace_empty')
    if (!error) setWorkspaceEmpty(!!data)
  }, [])

  const loadAll = useCallback(async () => {
    if (!supabase) return
    const [profilesRes, tasksRes, activityRes] = await Promise.all([
      supabase.from('malcon_tms_profiles').select('*').order('created_at'),
      supabase.from('malcon_tms_tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('malcon_tms_activity').select('*').order('at', { ascending: false }).limit(80),
    ])
    if (profilesRes.data) setUsers(profilesRes.data.map(mapProfile))
    if (tasksRes.data) setTasks(tasksRes.data.map(mapTask))
    if (activityRes.data) setActivity(activityRes.data.map(mapActivity))
    await refreshWorkspaceEmpty()
  }, [refreshWorkspaceEmpty])

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setReady(true)
      return
    }

    let mounted = true

    async function init() {
      await refreshWorkspaceEmpty()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!mounted) return
      setSessionUserId(session?.user?.id ?? null)
      if (session?.user) await loadAll()
      setReady(true)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSessionUserId(session?.user?.id ?? null)
      if (session?.user) await loadAll()
      else {
        setUsers([])
        setTasks([])
        setActivity([])
        await refreshWorkspaceEmpty()
      }
    })

    const channel = supabase
      .channel('malcon-tms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'malcon_tms_profiles' }, () => {
        loadAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'malcon_tms_tasks' }, () => {
        loadAll()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'malcon_tms_activity' }, () => {
        loadAll()
      })
      .subscribe()

    return () => {
      mounted = false
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [loadAll, refreshWorkspaceEmpty])

  async function log(action, detail, userId = null, taskId = null) {
    const who = userId || sessionUserId
    if (!who || !supabase) return
    await supabase.from('malcon_tms_activity').insert({
      user_id: who,
      action,
      detail,
      task_id: taskId || null,
    })
  }

  async function register(name, email, password) {
    if (!supabase) return { error: 'Supabase is not configured.' }
    const e = (email || '').trim().toLowerCase()
    if (!name.trim()) return { error: 'Please enter your full name.' }
    if (!/^\S+@\S+\.\S+$/.test(e)) return { error: 'Please enter a valid email address.' }
    if ((password || '').length < 6) return { error: 'Password must be at least 6 characters.' }

    const { data: empty, error: emptyErr } = await supabase.rpc('malcon_tms_workspace_empty')
    if (emptyErr) return { error: emptyErr.message }
    if (!empty) return { error: 'Ask a workspace admin to create your account.' }

    const { data: boot, error: bootErr } = await supabase.functions.invoke('bootstrap-tms-user', {
      body: { name: name.trim(), email: e, password },
    })
    if (bootErr) return { error: bootErr.message }
    if (boot?.error) return { error: boot.error }

    const signIn = await supabase.auth.signInWithPassword({ email: e, password })
    if (signIn.error) return { error: signIn.error.message }

    setSessionUserId(signIn.data.session.user.id)
    await loadAll()
    await log('joined', 'joined the workspace', signIn.data.session.user.id)
    return { ok: true }
  }

  async function login(email, password) {
    if (!supabase) return { error: 'Supabase is not configured.' }
    const e = (email || '').trim().toLowerCase()
    const { error } = await supabase.auth.signInWithPassword({ email: e, password })
    if (error) return { error: 'Incorrect email or password.' }
    await loadAll()
    return { ok: true }
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut()
    setSessionUserId(null)
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

  async function addTask(data) {
    if (!supabase || !currentUser) return null
    const row = {
      title: data.title.trim(),
      description: (data.description || '').trim(),
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      tags: data.tags || [],
      due: data.due || null,
      assignee_id: data.assigneeId || null,
      created_by: currentUser.id,
      completed_at: data.status === 'done' ? new Date().toISOString() : null,
    }
    const { data: inserted, error } = await supabase.from('malcon_tms_tasks').insert(row).select().single()
    if (error) return null
    const task = mapTask(inserted)
    await log('created', `created "${task.title}"`, null, task.id)
    return task
  }

  async function updateTask(id, patch) {
    if (!supabase) return
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return

    const row = taskToRow(patch)
    if (patch.status === 'done' && prev.status !== 'done') row.completed_at = new Date().toISOString()
    if (patch.status && patch.status !== 'done') row.completed_at = null

    const { error } = await supabase.from('malcon_tms_tasks').update(row).eq('id', id)
    if (error) return

    const next = { ...prev, ...patch, updatedAt: Date.now() }
    if (patch.status === 'done' && prev.status !== 'done') next.completedAt = Date.now()
    if (patch.status && patch.status !== 'done') next.completedAt = null

    if (patch.status && patch.status !== prev.status) {
      if (patch.status === 'done') await log('completed', `completed "${next.title}"`, null, id)
      else await log('moved', `moved "${next.title}" to ${COLUMN_MAP[patch.status].title}`, null, id)
    } else {
      await log('updated', `updated "${next.title}"`, null, id)
    }
  }

  async function moveTask(id, status) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev || prev.status === status) return
    await updateTask(id, { status })
  }

  async function deleteTask(id) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return { error: 'Task not found.' }
    if (!canDeleteTask(prev, currentUser)) {
      return { error: 'Only the person who created this task can delete it.' }
    }
    if (!supabase) return { error: 'Supabase is not configured.' }
    const { error } = await supabase.from('malcon_tms_tasks').delete().eq('id', id)
    if (error) return { error: error.message }
    await log('deleted', `deleted "${prev.title}"`)
    closeTaskModal()
    return { ok: true }
  }

  async function addMember(name, email, passwordInput = '') {
    if (!supabase) return { error: 'Supabase is not configured.' }
    const pwd = (passwordInput || '').trim()
    const { data, error } = await supabase.functions.invoke('create-tms-user', {
      body: { name, email, password: pwd || undefined },
    })
    if (error) return { error: error.message }
    if (data?.error) return { error: data.error }
    await loadAll()
    await log('invited', `created account for ${data.user.name}`)
    return {
      ok: true,
      user: mapProfile(data.user),
      password: data.password,
      generated: data.generated,
    }
  }

  async function removeMember(id) {
    if (!supabase) return
    const member = users.find((u) => u.id === id)
    if (!member || member.id === currentUser?.id) return
    const { data, error } = await supabase.functions.invoke('remove-tms-user', {
      body: { userId: id },
    })
    if (error || data?.error) return
    await log('removed', `removed ${member.name} from the team`)
    await loadAll()
  }

  const value = {
    ready,
    supabaseConfigured,
    workspaceEmpty,
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
