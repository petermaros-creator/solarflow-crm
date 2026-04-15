import '../styles/globals.css'

export const metadata = {
  title: 'SolarFlow CRM',
  description: 'Residential Solar CRM & Project Management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
