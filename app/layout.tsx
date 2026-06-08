import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Demarie – Ventas Perdidas',
  description: 'Registro de ventas perdidas por tienda',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-brand-50 min-h-screen">{children}</body>
    </html>
  )
}
