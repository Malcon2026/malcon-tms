import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { COLUMN_MAP, canDeleteTask } from '../lib/store'
import {
  mapActivity,
  mapProfile,
  mapTask,
  firebaseConfigured,
  auth,
  db,
  secondaryAuth,
  taskToRow,
  tagsWithDueSlot,
} from '../lib/firebase'
import { isTmsTeamEmail, normalizeTmsTeamProfile } from '../lib/workspace'
import { onAuthStateChange, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { collection, query, orderBy, limit, onSnapshot, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState('month')
  const [modalTask, setModalTask] = useState(null)
  const [sessionProfile, setSessionProfile] = useState(null)
  const [authResolved, setAuthResolved] = useState(false)

  const currentUser =
    users.find((u) => u.id === sessionUserId) ||
    (sessionProfile?.id === sessionUserId ? sessionProfile : null)

  const refreshWorkspaceEmpty = useCallback(async () => {
    if (!db) return
    const q = query(collection(db, 'malcon_tms_profiles'), limit(1))
    const snap = await getDocs(q)
    setWorkspaceEmpty(snap.empty)
  }, [])

  useEffect(() => {
    if (!firebaseConfigured || !auth || !db) {
      setReady(true)
      return
    }

    let mounted = true
    let unsubs = []

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      setSessionUserId(user?.uid ?? null)
      if (user) {
        await refreshWorkspaceEmpty()
        
        const profilesQuery = query(collection(db, 'malcon_tms_profiles'), orderBy('created_at'))
        unsubs.push(onSnapshot(profilesQuery, (snap) => {
          setUsers(
            snap.docs
              .map(mapProfile)
              .map(normalizeTmsTeamProfile)
              .filter(Boolean)
          )
        }, (err) => console.error("Profiles sync error:", err)))

        const tasksQuery = query(collection(db, 'malcon_tms_tasks'), orderBy('created_at', 'desc'))
        unsubs.push(onSnapshot(tasksQuery, (snap) => {
          setTasks(snap.docs.map(mapTask))
        }, (err) => console.error("Tasks sync error:", err)))

        const activityQuery = query(collection(db, 'malcon_tms_activity'), orderBy('at', 'desc'), limit(80))
        unsubs.push(onSnapshot(activityQuery, (snap) => {
          setActivity(snap.docs.map(mapActivity))
        }, (err) => console.error("Activity sync error:", err)))

      } else {
        setUsers([])
        setTasks([])
        setActivity([])
        unsubs.forEach(fn => fn())
        unsubs = []
        await refreshWorkspaceEmpty()
      }
      setReady(true)
    })

    return () => {
      mounted = false
      unsubscribeAuth()
      unsubs.forEach(fn => fn())
    }
  }, [refreshWorkspaceEmpty])

  useEffect(() => {
    if (!db) {
      setSessionProfile(null)
      setAuthResolved(true)
      return
    }
    if (!sessionUserId) {
      setSessionProfile(null)
      setAuthResolved(true)
      return
    }

    let cancelled = false
    setAuthResolved(false)

    ;(async () => {
      try {
        const docRef = doc(db, 'malcon_tms_profiles', sessionUserId)
        const snap = await getDoc(docRef)
        if (cancelled) return
        
        const team = snap.exists() ? normalizeTmsTeamProfile(mapProfile(snap)) : null
        if (!team) {
          setSessionProfile(null)
          await signOut(auth)
          if (!cancelled) setSessionUserId(null)
        } else {
          setSessionProfile(team)
        }
      } catch (err) {
        console.error("Error in auth resolving:", err)
        setSessionProfile(null)
      } finally {
        if (!cancelled) setAuthResolved(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [sessionUserId])

  async function log(action, detail, userId = null, taskId = null) {
    const who = userId || sessionUserId
    if (!who || !db) return
    await addDoc(collection(db, 'malcon_tms_activity'), {
      user_id: who,
      action,
      detail,
      task_id: taskId || null,
      at: new Date().toISOString(),
    })
  }

  const avatar_colors = [
    '#0071e3', '#bf5af2', '#ff375f', '#ff9500', '#34c759', '#5e5ce6', '#00a8c5', '#8e8e93'
  ]

  async function register(name, email, password) {
    if (!auth || !db) return { error: 'Firebase is not configured.' }
    const e = (email || '').trim().toLowerCase()
    if (!name.trim()) return { error: 'Please enter your full name.' }
    if (!/^\S+@\S+\.\S+$/.test(e)) return { error: 'Please enter a valid email address.' }
    if ((password || '').length < 6) return { error: 'Password must be at least 6 characters.' }
    if (!isTmsTeamEmail(e)) {
      return { error: 'Use your Malcon TMS email (ending in @123.com).' }
    }

    await refreshWorkspaceEmpty()
    if (!workspaceEmpty) return { error: 'Ask a workspace admin to create your account.' }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, e, password)
      const uid = userCredential.user.uid

      const color = avatar_colors[0]
      await setDoc(doc(db, 'malcon_tms_profiles', uid), {
        id: uid,
        name: name.trim(),
        email: e,
        role: 'admin',
        color,
        created_at: new Date().toISOString()
      })

      setSessionUserId(uid)
      await log('joined', 'joined the workspace', uid)
      return { ok: true }
    } catch (err) {
      return { error: err.message }
    }
  }

  async function login(email, password) {
    if (!auth) return { error: 'Firebase is not configured.' }
    const e = (email || '').trim().toLowerCase()
    if (!isTmsTeamEmail(e)) {
      return { error: 'Use your Malcon TMS email (ending in @123.com).' }
    }
    try {
      await signInWithEmailAndPassword(auth, e, password)
      return { ok: true }
    } catch (err) {
      return { error: 'Incorrect email or password.' }
    }
  }

  async function logout() {
    if (auth) await signOut(auth)
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
    if (!db || !currentUser) return null
    const row = {
      title: data.title.trim(),
      description: (data.description || '').trim(),
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      tags: tagsWithDueSlot(data.tags || [], data.dueSlot || null),
      due: data.due || null,
      assignee_id: data.assigneeId || null,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: data.status === 'done' ? new Date().toISOString() : null,
    }
    const docRef = await addDoc(collection(db, 'malcon_tms_tasks'), row)
    const task = mapTask({ id: docRef.id, ...row })
    await log('created', `created "${task.title}"`, null, task.id)
    return { task }
  }

  async function updateTask(id, patch) {
    if (!db) return
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return

    const row = taskToRow(patch, prev)
    if (patch.status === 'done' && prev.status !== 'done') row.completed_at = new Date().toISOString()
    if (patch.status && patch.status !== 'done') row.completed_at = null

    const docRef = doc(db, 'malcon_tms_tasks', id)
    await updateDoc(docRef, row)

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
    if (!db) return { error: 'Firebase is not configured.' }
    
    await deleteDoc(doc(db, 'malcon_tms_tasks', id))
    await log('deleted', `deleted "${prev.title}"`)
    closeTaskModal()
    return { ok: true }
  }

  async function addMember(name, email, passwordInput = '', role = 'store_manager') {
    if (!db || !secondaryAuth) return { error: 'Firebase is not configured.' }
    const e = (email || '').trim().toLowerCase()
    if (!isTmsTeamEmail(e)) {
      return { error: 'TMS users must use an @123.com email.' }
    }
    
    const pwd = (passwordInput || '').trim() || Math.random().toString(36).slice(-8)
    
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, e, pwd)
      const uid = userCredential.user.uid
      await signOut(secondaryAuth)
      
      const pCount = users.length
      const color = avatar_colors[(pCount % avatar_colors.length)]
      
      const profile = {
        id: uid,
        name,
        email: e,
        role,
        color,
        created_at: new Date().toISOString()
      }
      await setDoc(doc(db, 'malcon_tms_profiles', uid), profile)
      
      await log('invited', `created account for ${name}`)
      return {
        ok: true,
        user: mapProfile(profile),
        password: pwd,
        generated: !passwordInput,
      }
    } catch (err) {
      return { error: err.message }
    }
  }

  async function removeMember(id) {
    if (!db) return
    const member = users.find((u) => u.id === id)
    if (!member || member.id === currentUser?.id) return
    
    // Without admin SDK, we can't easily delete the auth user here.
    // We will just remove their profile document, which will block their access because of team membership check.
    await deleteDoc(doc(db, 'malcon_tms_profiles', id))
    await log('removed', `removed ${member.name} from the team`)
  }

  const value = {
    ready,
    authResolved,
    firebaseConfigured,
    workspaceEmpty,
    users,
    currentUser,
    tasks,
    activity,
    view,
    setView,
    searchQuery,
    setSearchQuery,
    timeRange,
    setTimeRange,
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
