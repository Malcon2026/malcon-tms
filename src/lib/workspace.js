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

/** Normalize a mapped profile for TMS team lists (defaults missing role to admin for @123.com). */
export function normalizeTmsTeamProfile(profile) {
  if (!profile?.email || !isTmsTeamEmail(profile.email)) return null
  const role = TMS_ROLES.includes(profile.role) ? profile.role : 'admin'
  return { ...profile, role }
}

export function isTmsTeamProfile(profile) {
  return normalizeTmsTeamProfile(profile) != null
}

export function canManageTeam(profile) {
  return profile?.role === 'admin'
}

/** Kanban column id for the preparation stage */
export const PREPARATION_STATUS = 'todo'
