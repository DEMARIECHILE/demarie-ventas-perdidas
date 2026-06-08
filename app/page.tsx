'use client'
import { useState } from 'react'
import { Tienda } from '@/lib/types'
import RegistroView from '@/components/RegistroView'
import DashboardView from '@/components/DashboardView'

const TIENDAS: Tienda[] = ['Alto Las Condes', 'Parque Arauco', 'Casa Costanera']

const TIENDA_COLORS: Record<Tienda, string> = {
  'Alto Las Condes': 'from-brand-400 to-brand-600',
  'Parque Arauco':   'from-purple-400 to-purple-600',
  'Casa Costanera':  'from-rose-400 to-rose-600',
}

export default function Home() {
  const [tienda, setTienda]   = useState<Tienda | null>(null)
  const [vista,  setVista]    = useState<'registro' | 'dashboard'>('registro')
  const [isDashboard, setIsDashboard] = useState(false)

  // Admin dashboard (no tienda selected)
  if (isDashboard) {
    return (
      <DashboardView onBack={() => setIsDashboard(false)} />
    )
  }

  // Tienda not selected yet
  if (!tienda) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-brand-800 tracking-tight">Demarie</h1>
          <p className="text-brand-500 mt-1">Registro de ventas perdidas</p>
        </div>

        <div className="grid gap-4 w-full max-w-sm">
          {TIENDAS.map(t => (
            <button
              key={t}
              onClick={() => setTienda(t)}
              className={`bg-gradient-to-r ${TIENDA_COLORS[t]} text-white font-semibold py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] text-lg`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsDashboard(true)}
          className="mt-10 text-brand-400 hover:text-brand-600 text-sm underline underline-offset-4 transition-colors"
        >
          Ver reporte consolidado →
        </button>
      </div>
    )
  }

  // Tienda selected — show registro view
  return (
    <RegistroView
      tienda={tienda}
      onBack={() => setTienda(null)}
      onDashboard={() => setIsDashboard(true)}
    />
  )
}
