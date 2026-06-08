import { NextRequest, NextResponse } from 'next/server'
import { readAll } from '@/lib/storage'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { tienda, desde, hasta } = await req.json()

  let records = await readAll()
  if (tienda && tienda !== 'Todas') records = records.filter(r => r.tienda === tienda)
  if (desde) records = records.filter(r => r.fecha >= desde)
  if (hasta) records = records.filter(r => r.fecha <= hasta)

  if (records.length === 0) {
    return NextResponse.json({ report: 'No hay registros para el período seleccionado.' })
  }

  const summary = records.map(r =>
    `[${r.fecha}] ${r.tienda} | Tipo: ${r.producto || '?'} | Modelo: ${r.modelo || '?'} | Talla: ${r.talla || '?'} | Comentario: ${r.comentario || '-'}`
  ).join('\n')

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Eres analista de una tienda de ropa íntima femenina llamada Demarie con locales en 
Alto Las Condes, Parque Arauco y Casa Costanera.

Analiza estos ${records.length} registros de ventas perdidas y genera un reporte ejecutivo con:
1. **Productos más demandados** (ranking por tipo y modelo)
2. **Tallas con mayor quiebre de stock**
3. **Patrones por tienda**
4. **Acciones recomendadas** (reposición urgente, ajuste de compra, etc.)
5. **Clientes a contactar** cuando llegue stock (si hay emails/teléfonos)

Registros:
${summary}

Sé directo y accionable. Usa bullets. Responde en español.`
    }]
  })

  const report = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return NextResponse.json({ report, total: records.length })
}
