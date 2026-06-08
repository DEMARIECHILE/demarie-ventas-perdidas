import { NextRequest, NextResponse } from 'next/server'
import { readAll } from '@/lib/storage'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tienda = searchParams.get('tienda')
  const desde  = searchParams.get('desde')
  const hasta  = searchParams.get('hasta')

  let records = readAll()
  if (tienda && tienda !== 'Todas') records = records.filter(r => r.tienda === tienda)
  if (desde) records = records.filter(r => r.fecha >= desde)
  if (hasta) records = records.filter(r => r.fecha <= hasta)

  const rows = records.map(r => ({
    Fecha:      r.fecha,
    Tienda:     r.tienda,
    Producto:   r.producto   || '',
    Modelo:     r.modelo     || '',
    Color:      r.color      || '',
    Talla:      r.talla      || '',
    Nombre:     r.nombre     || '',
    Email:      r.email      || '',
    Teléfono:   r.telefono   || '',
    Comentario: r.comentario || '',
    Insights:   r.insights   || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 8 },
    { wch: 20 }, { wch: 28 }, { wch: 14 }, { wch: 40 }, { wch: 50 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas Perdidas')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ventas-perdidas-${new Date().toISOString().split('T')[0]}.xlsx"`,
    }
  })
}
