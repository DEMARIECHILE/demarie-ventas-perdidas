'use client'
import { useState } from 'react'
import { Tienda, VentaPerdida } from '@/lib/types'

interface Props {
  tienda: Tienda
  onBack: () => void
  onDashboard: () => void
}

const TIENDA_GRADIENT: Record<Tienda, string> = {
  'Alto Las Condes': 'from-brand-500 to-brand-700',
  'Parque Arauco':   'from-purple-500 to-purple-700',
  'Casa Costanera':  'from-rose-500 to-rose-700',
}

const TIPOS     = ['BRALETTE', 'PIJAMA', 'BRAMI', 'CALZÓN', 'ACCESORIO', 'OTRO']
const TALLAS    = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'U']

export default function RegistroView({ tienda, onBack, onDashboard }: Props) {
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    producto: '', modelo: '', talla: '', comentario: '',
  })
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [recientes, setRecientes] = useState<VentaPerdida[]>([])
  const [loadingRec, setLoadingRec] = useState(false)
  const [showRecientes, setShowRecientes] = useState(false)

  const grad = TIENDA_GRADIENT[tienda]

  function update(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function toggle(field: string, val: string) {
    setForm(f => ({ ...f, [field]: (f as any)[field] === val ? '' : val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tienda, ...form }),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ nombre: '', email: '', telefono: '', producto: '', modelo: '', talla: '', comentario: '' })
        setTimeout(() => setSuccess(false), 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadRecientes() {
    setLoadingRec(true)
    setShowRecientes(true)
    try {
      const res = await fetch(`/api/ventas?tienda=${encodeURIComponent(tienda)}`)
      const data = await res.json()
      setRecientes(data.slice(0, 10))
    } finally {
      setLoadingRec(false)
    }
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className={`bg-gradient-to-r ${grad} text-white px-5 pt-10 pb-6`}>
        <button onClick={onBack} className="text-white/70 hover:text-white text-sm mb-3 flex items-center gap-1">
          ← Cambiar tienda
        </button>
        <h1 className="text-2xl font-bold">Demarie</h1>
        <p className="text-white/80 text-sm mt-0.5">{tienda}</p>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-5">

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium">
            ✓ Venta perdida registrada correctamente
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-brand-100 p-5 space-y-5">
          <h2 className="font-semibold text-gray-700 text-base">Nueva venta perdida</h2>

          {/* 1. Tipo de producto */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de producto</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TIPOS.map(t => (
                <button key={t} type="button"
                  onClick={() => toggle('producto', t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    form.producto === t
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* 2. Nombre del producto */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nombre del producto <span className="normal-case font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.modelo}
              onChange={e => update('modelo', e.target.value)}
              placeholder='Ej: NALA, LUNA, SOFÍA...'
              className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* 3. Talla */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Talla</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TALLAS.map(t => (
                <button key={t} type="button"
                  onClick={() => toggle('talla', t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    form.talla === t
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* 4. Comentario */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Comentario <span className="normal-case font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={form.comentario}
              onChange={e => update('comentario', e.target.value)}
              placeholder='Ej: "Quería pack x3", "Preguntó si llega pronto"'
              rows={3}
              className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>

          {/* Datos clienta (colapsado) */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-semibold text-brand-500 hover:text-brand-700 select-none list-none flex items-center gap-1">
              <span className="group-open:hidden">+ Agregar datos de clienta</span>
              <span className="hidden group-open:inline">– Datos de clienta</span>
            </summary>
            <div className="mt-3 space-y-3">
              <input type="text" value={form.nombre}
                onChange={e => update('nombre', e.target.value)}
                placeholder="Nombre"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <input type="email" value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="Email"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <input type="tel" value={form.telefono}
                onChange={e => update('telefono', e.target.value)}
                placeholder="Teléfono"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          </details>

          <button type="submit" disabled={loading}
            className={`w-full bg-gradient-to-r ${grad} text-white font-semibold py-3 rounded-xl shadow hover:shadow-md transition-all disabled:opacity-60`}
          >
            {loading ? 'Guardando...' : 'Registrar venta perdida'}
          </button>
        </form>

        {/* Recientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-base">Registros recientes</h2>
            <button onClick={loadRecientes} className="text-brand-500 hover:text-brand-700 text-sm font-medium">
              {showRecientes ? 'Actualizar' : 'Ver'}
            </button>
          </div>
          {showRecientes && (
            <div className="mt-3 space-y-2">
              {loadingRec && <p className="text-sm text-gray-400">Cargando...</p>}
              {!loadingRec && recientes.length === 0 && (
                <p className="text-sm text-gray-400">Sin registros aún</p>
              )}
              {recientes.map(r => (
                <div key={r.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="font-medium text-gray-700">{r.producto || '—'}</span>
                      {r.modelo && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.modelo}</span>}
                      {r.talla  && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">T {r.talla}</span>}
                    </div>
                    <span className="text-gray-400 text-xs shrink-0 ml-2">{r.fecha}</span>
                  </div>
                  {r.comentario && <p className="text-gray-500 mt-1 text-xs leading-relaxed">"{r.comentario}"</p>}
                  {r.insights   && <p className="text-brand-600 mt-1 text-xs italic border-l-2 border-brand-200 pl-2">{r.insights}</p>}
                  {r.email      && <p className="text-gray-400 text-xs mt-1">📧 {r.email}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={onDashboard}
          className="w-full text-center text-brand-400 hover:text-brand-600 text-sm py-2 underline underline-offset-4">
          Ver reporte consolidado →
        </button>
      </div>
    </div>
  )
}
