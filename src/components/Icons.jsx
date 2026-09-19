function S({ size = 20, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function LogoMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tflogo" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2997ff" />
          <stop offset="1" stopColor="#0055d4" />
        </linearGradient>
      </defs>
      <rect width="22" height="22" rx="6" fill="url(#tflogo)" />
      <rect x="4.2" y="5" width="3.4" height="12" rx="1.2" fill="#fff" />
      <rect x="9.3" y="5" width="3.4" height="8.2" rx="1.2" fill="#fff" opacity="0.92" />
      <rect x="14.4" y="5" width="3.4" height="10.2" rx="1.2" fill="#fff" opacity="0.85" />
    </svg>
  )
}

export const PlusIcon = (p) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
)

export const HomeIcon = (p) => (
  <S {...p}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 9.8V21h5.5v-6h3v6H19V9.8" />
  </S>
)

export const BoardIcon = (p) => (
  <S {...p}>
    <rect x="3.5" y="4" width="4.6" height="16" rx="1.6" />
    <rect x="9.7" y="4" width="4.6" height="10" rx="1.6" />
    <rect x="15.9" y="4" width="4.6" height="13" rx="1.6" />
  </S>
)

export const UsersIcon = (p) => (
  <S {...p}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.8 20c.9-3.1 3.3-4.9 6.2-4.9s5.3 1.8 6.2 4.9" />
    <path d="M15.6 4.9a3.4 3.4 0 0 1 0 6.2" />
    <path d="M17.5 15.6c2 .8 3.2 2.3 3.7 4.4" />
  </S>
)

export const SearchIcon = (p) => (
  <S {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </S>
)

export const CheckIcon = (p) => (
  <S {...p} strokeWidth="2.2">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </S>
)

export const TrashIcon = (p) => (
  <S {...p}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.2a1.7 1.7 0 0 1 1.7-1.7h1.6a1.7 1.7 0 0 1 1.7 1.7V7" />
    <path d="m6.8 7 .7 11.3a2 2 0 0 0 2 1.9h5a2 2 0 0 0 2-1.9L17.2 7" />
    <path d="M10.2 11v5.5M13.8 11v5.5" />
  </S>
)

export const XIcon = (p) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
)

export const ChevronLeftIcon = (p) => (
  <S {...p} strokeWidth="2.2">
    <path d="m14.5 6-6 6 6 6" />
  </S>
)

export const ChevronRightIcon = (p) => (
  <S {...p} strokeWidth="2.2">
    <path d="m9.5 6 6 6-6 6" />
  </S>
)

export const LogoutIcon = (p) => (
  <S {...p}>
    <path d="M9.5 4H6.5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="m14.5 8 4 4-4 4" />
    <path d="M18.5 12h-9" />
  </S>
)

export const CopyIcon = (p) => (
  <S {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.2" />
    <path d="M5.5 15V6.5a2 2 0 0 1 2-2H16" />
  </S>
)
