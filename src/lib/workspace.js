/** TMS workspace team — @123.com logins and manager roles (not legacy @malconnexus.com directory). */
export const TMS_TEAM_EMAIL_SUFFIX = '@123.com'

export const TMS_ROLES = ['admin', 'store_manager', 'case_manager']

export const TMS_ROLE_LABELS = {
  admin: 'Admin',
  store_manager: 'Store manager',
  case_manager: 'Case manager',
}

export function isTmsTeamEmail(email) {
  return (email || '').toLowerCase().endsWith(TMS_TEAM_EMAIL_SUFFIX)
}

export function isTmsTeamProfile(profile) {
  if (!profile) return false
  if (TMS_ROLES.includes(profile.role)) return isTmsTeamEmail(profile.email)
  return false
}

export function canManageTeam(profile) {
  return profile?.role === 'admin'
}

/** Kanban column id for the preparation stage */
export const PREPARATION_STATUS = 'todo'
