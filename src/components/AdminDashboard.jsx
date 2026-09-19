import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from './Avatar'
import { TrashIcon, CopyIcon, PlusIcon } from './Icons'

export default function AdminDashboard() {
  const { users, currentUser, tasks, addMember, removeMember } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const res = await addMember(name, email, password)
    if (res.error) {
      setError(res.error)
      setCreated(null)
      return
    }
    setError('')
    setCreated({
      name: res.user.name,
      email: res.user.email,
      password: res.password,
      generated: res.generated,
    })
    setName('')
    setEmail('')
    setPassword('')
    setCopied(false)
  }

  function copyPassword() {
    if (!created) return
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(created.password)
        .then(() => setCopied(true))
        .catch(() => setCopied(true))
    } else {
      setCopied(true)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Admin.</h1>
          <p className="page-sub">
            Everyone is an admin — all tasks are visible across the workspace, but only the person
            who created a task can delete it. {users.length} {users.length === 1 ? 'person' : 'people'}{' '}
            signed in here.
          </p>
        </div>
      </div>

      <div className="team-grid">
        <div className="card">
          <h3 className="card-title">Create user</h3>
          <form onSubmit={submit}>
            <label className="field-label">
              Full name
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sofia Reyes"
              />
            </label>
            <label className="field-label">
              Work email
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sofia@company.com"
              />
            </label>
            <label className="field-label">
              Password
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters (or leave blank to generate)"
                autoComplete="new-password"
              />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary btn-block">
              <PlusIcon size={15} /> Create user
            </button>
          </form>

          {created && (
            <div className="credential-box">
              <p>
                <strong>{created.name}</strong> can sign in with:
              </p>
              <p className="credential-email">{created.email}</p>
              <div className="credential-row">
                <code>{created.password}</code>
                <button type="button" className="btn-ghost" onClick={copyPassword}>
                  <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy password'}
                </button>
              </div>
              {created.generated && (
                <p className="credential-note">This password was generated — share it securely.</p>
              )}
            </div>
          )}

          <p className="card-foot">
            New users get admin access and see every task on the board and dashboard. Accounts are
            stored in Supabase Auth.
          </p>
        </div>

        <div className="card">
          <h3 className="card-title">Workspace members</h3>
          <div className="member-list">
            {users.map((u) => {
              const openTasks = tasks.filter((t) => t.assigneeId === u.id && t.status !== 'done').length
              const createdTasks = tasks.filter((t) => t.createdBy === u.id).length
              const isSelf = u.id === currentUser.id
              return (
                <div key={u.id} className="member-row">
                  <Avatar user={u} size={38} />
                  <div className="member-main">
                    <span className="member-name">
                      {u.name}
                      {isSelf && <em className="chip chip-you">You</em>}
                      <em className="chip chip-admin">Admin</em>
                    </span>
                    <span className="member-email">{u.email}</span>
                  </div>
                  <div className="member-stats">
                    <span>
                      <strong>{openTasks}</strong> open
                    </span>
                    <span>
                      <strong>{createdTasks}</strong> created
                    </span>
                  </div>
                  {!isSelf && (
                    <button
                      className="icon-btn danger"
                      title="Remove from workspace"
                      onClick={() => removeMember(u.id)}
                    >
                      <TrashIcon size={16} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
