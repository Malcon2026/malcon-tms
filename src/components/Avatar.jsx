import { initials } from '../lib/store'

export default function Avatar({ user, size = 28 }) {
  if (!user) {
    return (
      <span className="avatar avatar-empty" style={{ width: size, height: size, fontSize: size * 0.4 }}>
        ?
      </span>
    )
  }
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: user.color, fontSize: size * 0.38 }}
      title={user.name}
    >
      {initials(user.name)}
    </span>
  )
}
