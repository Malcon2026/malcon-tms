import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseConfigured = !!(url && anonKey)

const DUE_SLOT_TAG_PREFIX = '__due:'

export function dueSlotFromTags(tags) {
  const hit = (tags || []).find((t) => t.startsWith(DUE_SLOT_TAG_PREFIX))
  return hit ? hit.slice(DUE_SLOT_TAG_PREFIX.length) : null
}

export function tagsWithDueSlot(tags, dueSlot) {
  const base = (tags || []).filter((t) => !t.startsWith(DUE_SLOT_TAG_PREFIX))
  if (dueSlot) base.push(`${DUE_SLOT_TAG_PREFIX}${dueSlot}`)
  return base
}

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export function mapProfile(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    color: row.color,
    createdAt: new Date(row.created_at).getTime(),
  }
}

export function mapTask(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    tags: (row.tags || []).filter((t) => !t.startsWith(DUE_SLOT_TAG_PREFIX)),
    due: row.due || null,
    dueSlot: row.due_slot || dueSlotFromTags(row.tags),
    assigneeId: row.assignee_id || null,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
  }
}

export function mapActivity(row) {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    detail: row.detail,
    taskId: row.task_id || null,
    at: new Date(row.at).getTime(),
  }
}

export function taskToRow(patch, prev = null) {
  const row = { updated_at: new Date().toISOString() }
  if (patch.title !== undefined) row.title = patch.title.trim()
  if (patch.description !== undefined) row.description = (patch.description || '').trim()
  if (patch.status !== undefined) row.status = patch.status
  if (patch.priority !== undefined) row.priority = patch.priority
  if (patch.tags !== undefined || patch.dueSlot !== undefined) {
    const baseTags = patch.tags !== undefined ? patch.tags : prev?.tags || []
    const slot = patch.dueSlot !== undefined ? patch.dueSlot : prev?.dueSlot || null
    row.tags = tagsWithDueSlot(baseTags, slot)
  }
  if (patch.due !== undefined) row.due = patch.due || null
  if (patch.assigneeId !== undefined) row.assignee_id = patch.assigneeId || null
  return row
}
