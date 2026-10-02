import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const firebaseConfigured = !!firebaseConfig.apiKey

export const app = getApps().length > 0 ? getApp() : (firebaseConfigured ? initializeApp(firebaseConfig) : null)
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

// Create a secondary app for admin actions like creating users
export const secondaryApp = firebaseConfigured ? initializeApp(firebaseConfig, 'Secondary') : null
export const secondaryAuth = secondaryApp ? getAuth(secondaryApp) : null

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

export function mapProfile(doc) {
  if (!doc) return null
  const data = doc.data ? doc.data() : doc
  return {
    id: doc.id || data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    color: data.color,
    createdAt: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().getTime() : new Date(data.created_at).getTime()) : Date.now(),
  }
}

export function mapTask(doc) {
  if (!doc) return null
  const data = doc.data ? doc.data() : doc
  return {
    id: doc.id || data.id,
    title: data.title,
    description: data.description || '',
    status: data.status,
    priority: data.priority,
    tags: (data.tags || []).filter((t) => !t.startsWith(DUE_SLOT_TAG_PREFIX)),
    due: data.due || null,
    dueSlot: data.due_slot || dueSlotFromTags(data.tags),
    assigneeId: data.assignee_id || null,
    createdBy: data.created_by,
    createdAt: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().getTime() : new Date(data.created_at).getTime()) : Date.now(),
    updatedAt: data.updated_at ? (data.updated_at.toDate ? data.updated_at.toDate().getTime() : new Date(data.updated_at).getTime()) : Date.now(),
    completedAt: data.completed_at ? (data.completed_at.toDate ? data.completed_at.toDate().getTime() : new Date(data.completed_at).getTime()) : null,
  }
}

export function mapActivity(doc) {
  if (!doc) return null
  const data = doc.data ? doc.data() : doc
  return {
    id: doc.id || data.id,
    userId: data.user_id,
    action: data.action,
    detail: data.detail,
    taskId: data.task_id || null,
    at: data.at ? (data.at.toDate ? data.at.toDate().getTime() : new Date(data.at).getTime()) : Date.now(),
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
