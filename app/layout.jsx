import './globals.css'

export const metadata = {
  title: 'TaskFlow — Work, beautifully organized',
  description: 'Shared task management for your team.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f5f5f7',
}

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230071e3'/%3E%3Crect x='6' y='8' width='5' height='16' rx='2' fill='white'/%3E%3Crect x='13.5' y='8' width='5' height='11' rx='2' fill='white' opacity='.9'/%3E%3Crect x='21' y='8' width='5' height='14' rx='2' fill='white' opacity='.8'/%3E%3C/svg%3E"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href={favicon} />
      </head>
      <body>{children}</body>
    </html>
  )
}
