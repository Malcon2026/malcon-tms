export const COLUMNS = [
  { id: 'todo', title: 'To Do', dot: '#8e8e93' },
  { id: 'inprogress', title: 'In Progress', dot: '#0071e3' },
  { id: 'review', title: 'In Review', dot: '#ff9500' },
  { id: 'done', title: 'Done', dot: '#34c759' },
]

export const COLUMN_MAP = Object.fromEntries(COLUMNS.map((c) => [c.id, c]))

export const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: '#ff3b30', bg: 'rgba(255,59,48,0.12)' },
  { id: 'high', label: 'High', color: '#ff9500', bg: 'rgba(255,149,0,0.15)' },
  { id: 'medium', label: 'Medium', color: '#0071e3', bg: 'rgba(0,113,227,0.12)' },
  { id: 'low', label: 'Low', color: '#34c759', bg: 'rgba(52,199,89,0.15)' },
]

export const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]))

export const AVATAR_COLORS = [
  '#0071e3', '#bf5af2', '#ff375f', '#ff9500', '#34c759', '#5e5ce6', '#00a8c5', '#8e8e93',
]

export const KEYS = {
  users: 'tf_users',
  session: 'tf_session',
  tasks: 'tf_tasks',
  activity: 'tf_activity',
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  return 'h' + h.toString(36)
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export const DUE_DAY_PRESETS = [
  { id: 'yesterday', label: 'Yesterday', offset: -1 },
  { id: 'today', label: 'Today', offset: 0 },
  { id: 'tomorrow', label: 'Tomorrow', offset: 1 },
]

export const DUE_TIME_SLOTS = [
  { id: 'start_of_day', label: 'Start of day', short: '9:00 AM' },
  { id: 'morning', label: 'Morning', short: '10:30 AM' },
  { id: 'afternoon', label: 'Afternoon', short: '2:00 PM' },
  { id: 'end_of_day', label: 'End of day', short: '6:00 PM' },
]

export const DUE_TIME_SLOT_MAP = Object.fromEntries(DUE_TIME_SLOTS.map((s) => [s.id, s]))

export function todayStr(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function dueDayPresetForDate(dateStr) {
  if (!dateStr) return null
  for (const preset of DUE_DAY_PRESETS) {
    if (dateStr === todayStr(preset.offset)) return preset.id
  }
  return null
}

export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export function isOverdue(task) {
  return !!(task.due && task.status !== 'done' && task.due < todayStr())
}

export function dueSlotLabel(slotId) {
  if (!slotId) return ''
  const slot = DUE_TIME_SLOT_MAP[slotId]
  return slot ? slot.label : ''
}

export function dueLabel(task) {
  if (!task.due) return ''
  const slot = dueSlotLabel(task.dueSlot)
  const slotPart = slot ? ` · ${slot}` : ''
  if (task.status === 'done') return fmtDate(task.due) + slotPart
  if (task.due < todayStr()) {
    const days = Math.round((new Date(todayStr()) - new Date(task.due)) / 86400000)
    const base = days === 1 ? '1 day overdue' : `${days} days overdue`
    return base + slotPart
  }
  if (task.due === todayStr()) return 'Due today' + slotPart
  const preset = DUE_DAY_PRESETS.find((p) => task.due === todayStr(p.offset))
  if (preset) return `Due ${preset.label.toLowerCase()}${slotPart}`
  return 'Due ' + fmtDate(task.due) + slotPart
}

export function taskMatchesDueFilter(task, dueFilter) {
  if (!dueFilter || dueFilter === 'all') return true
  if (!task.due) return dueFilter === 'none'
  if (dueFilter === 'none') return false
  if (dueFilter === 'overdue') return task.due < todayStr() && task.status !== 'done'
  const preset = DUE_DAY_PRESETS.find((p) => p.id === dueFilter)
  if (preset) return task.due === todayStr(preset.offset)
  return true
}

export function taskMatchesDueSlotFilter(task, slotFilter) {
  if (!slotFilter || slotFilter === 'all') return true
  if (slotFilter === 'any') return !!task.dueSlot
  return task.dueSlot === slotFilter
}

export function timeAgo(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export function initials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function canDeleteTask(task, user) {
  if (!task || !user) return false
  return task.createdBy === user.id
}
