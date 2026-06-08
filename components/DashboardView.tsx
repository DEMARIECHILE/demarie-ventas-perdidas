'use client'
import { useState, useEffect } from 'react'
import { VentaPerdida, Tienda } from '@/lib/types'

interface Props {
  onBack: () => void
}

const TIENDAS = ['Todas', 'Alto Las Condes', 'Parque Arauco', 'Casa Costanera']

const TIENDA_BADGE: Record<string, string> = {
  'Alto Las Condes': 'bg-pink-100 text-pink-700',
  'Parque Arauco':   'bg-purple-100 text-purple-700',
  'Casa Costanera':  'bg-rose-100 text-rose-700',
}

export default function DashboardView({ onBack }: Props) {
  const [registros, setRegistros]     = useState<VentaPerdida[]>([])
  const [loading, setLoading]         = useState(true)
  const [tiendaFiltro, setTiendaFiltro] = useState('Todas')
  const [desde, setDesde]             = useState('')
  const [hasta, setHasta]             = useState('')
  const [report, setReport]           = useState('')
  const [loadingReport, setLoadingReport] = useState(false)
  const [activeTab, setActiveTab]     = useState<'lista' | 'reporte' | 'clientes'>('lista')

  useEffect(() => { fetchData() }, [tiendaFiltro, desde, hasta])

  async function fetchData() {
    setLoading(true)
    const params = new URLSearchParams()
    if (tiendaFiltro !== 'Todas') params.set('tienda', tiendaFiltro)
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    const res = await fetch(`/api/ventas?${params}`)
    setRegistros(await res.json())
    setLoading(false)
  }

  async function generateReport() {
    setLoadingReport(true)
    setActiveTab('reporte')
    try {
      const res = await fetch('/api/reporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tienda: tiendaFiltro, desde, hasta }),
      })
      const data = await res.json()
      setReport(data.report)
    } finally {
      setLoadingReport(false)
    }
  }

  function exportExcel() {
    const params = new URLSearchParams()
    if (tiendaFiltro !== 'Todas') params.set('tienda', tiendaFiltro)
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    window.open(`/api/export?${params}`, '_blank')
  }

  // Stats
  const totalRegistros = registros.length
  const conEmail       = registros.filter(r => r.email).length
  const productoTop    = (() => {
    const counts: Record<string, number> = {}
    registros.forEach(r => { if (r.producto) counts[r.producto] = (counts[r.producto] || 0) + 1 })
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || '—'
  })()
  const tallaTop = (() => {
    const counts: Record<string, number> = {}
    registros.forEach(r => { if (r.talla) counts[r.talla] = (counts[r.talla] || 0) + 1 })
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || '—'
  })()

  // Clientes con email, grouped by product
  const clientesPorProducto: Record<string, VentaPerdida[]> = {}
  registros.filter(r => r.email).forEach(r => {
    const key = `${r.producto || 'Sin producto'}${r.talla ? ` talla ${r.talla}` : ''}`
    if (!clientesPorProducto[key]) clientesPorProducto[key] = []
    clientesPorProducto[key].push(r)
  })

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-5 pt-10 pb-6">
        <button onClick={onBack} className="text-white/70 hover:text-white text-sm mb-3 flex items-center gap-1">
          ← Volver
        </button>
        <h1 className="text-2xl font-bold">Reporte consolidado</h1>
        <p className="text-white/70 text-sm mt-0.5">Demarie – Ventas perdidas</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-5">

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtros</h3>
          <div className="flex flex-wrap gap-2">
            {TIENDAS.map(t => (
              <button key={t} onClick={() => setTiendaFiltro(t)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  tiendaFiltro === t
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >{t}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400">Desde</label>
              <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 mt-0.5" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400">Hasta</label>
              <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 mt-0.5" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Registros', value: totalRegistros },
            { label: 'Con contacto', value: conEmail },
            { label: 'Producto top', value: productoTop },
            { label: 'Talla top', value: tallaTop },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={generateReport}
            className="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl transition-all">
            ✦ Generar análisis IA
          </button>
          <button onClick={exportExcel}
            className="flex-1 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-sm font-semibold py-3 rounded-xl transition-all">
            ↓ Exportar Excel
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['lista','reporte','clientes'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'lista' ? 'Lista' : tab === 'reporte' ? 'Análisis' : 'Clientes'}
            </button>
          ))}
        </div>

        {/* Tab: Lista */}
        {activeTab === 'lista' && (
          <div className="space-y-2">
            {loading && <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>}
            {!loading && registros.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Sin registros</p>
            )}
            {registros.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{r.producto || '—'}</span>
                    {r.talla && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Talla {r.talla}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIENDA_BADGE[r.tienda] || 'bg-gray-100 text-gray-600'}`}>
                      {r.tienda}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{r.fecha}</span>
                </div>
                {r.comentario && (
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">"{r.comentario}"</p>
                )}
                {r.insights && (
                  <p className="text-brand-600 text-xs mt-2 italic border-l-2 border-brand-200 pl-2">{r.insights}</p>
                )}
                <div className="flex gap-3 mt-2 flex-wrap">
                  {r.nombre    && <span className="text-xs text-gray-400">👤 {r.nombre}</span>}
                  {r.email     && <span className="text-xs text-gray-400">📧 {r.email}</span>}
                  {r.telefono  && <span className="text-xs text-gray-400">📱 {r.telefono}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Análisis IA */}
        {activeTab === 'reporte' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {loadingReport && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-3">✦</div>
                <p className="text-sm">Analizando registros...</p>
              </div>
            )}
            {!loadingReport && !report && (
              <p className="text-sm text-gray-400 text-center py-6">
                Haz clic en "Generar análisis IA" para ver el reporte
              </p>
            )}
            {!loadingReport && report && (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {report}
              </div>
            )}
          </div>
        )}

        {/* Tab: Clientes a contactar */}
        {activeTab === 'clientes' && (
          <div className="space-y-3">
            {Object.keys(clientesPorProducto).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-100">
                Sin clientes con datos de contacto
              </p>
            )}
            {Object.entries(clientesPorProducto).map(([producto, clientes]) => (
              <div key={producto} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">{producto}</h3>
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                    {clientes.length} cliente{clientes.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {clientes.map(c => (
                    <div key={c.id} className="flex items-start gap-2 text-sm">
                      <div>
                        {c.nombre && <p className="font-medium text-gray-700">{c.nombre}</p>}
                        {c.email   && (
                          <a href={`mailto:${c.email}`} className="text-brand-500 hover:underline text-xs">
                            {c.email}
                          </a>
                        )}
                        {c.telefono && <p className="text-gray-400 text-xs">{c.telefono}</p>}
                        <p className="text-gray-300 text-xs">{c.tienda} · {c.fecha}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Copy all emails button */}
                {clientes.filter(c=>c.email).length > 0 && (
                  <button
                    onClick={() => {
                      const emails = clientes.filter(c=>c.email).map(c=>c.email).join(', ')
                      navigator.clipboard.writeText(emails)
                    }}
                    className="mt-3 text-xs text-brand-500 hover:text-brand-700 font-medium"
                  >
                    Copiar todos los emails →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
