/** TMS workspace uses dedicated @123.com logins — not legacy @malconnexus.com directory. */
export const TMS_TEAM_EMAIL_SUFFIX = '@123.com'

export function isTmsTeamEmail(email) {
  return (email || '').toLowerCase().endsWith(TMS_TEAM_EMAIL_SUFFIX)
}

export function isTmsTeamProfile(profile) {
  return profile && isTmsTeamEmail(profile.email)
}
