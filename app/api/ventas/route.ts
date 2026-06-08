import { NextRequest, NextResponse } from 'next/server'
import { addRecord, readAll } from '@/lib/storage'
import { VentaPerdida, Tienda } from '@/lib/types'
import Anthropic from '@anthropic-ai/sdk'
import { randomUUID } from 'crypto'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TIENDAS: Tienda[] = ['Alto Las Condes', 'Parque Arauco', 'Casa Costanera']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tienda = searchParams.get('tienda') as Tienda | null
  const desde  = searchParams.get('desde')
  const hasta  = searchParams.get('hasta')

  let records = readAll()

  if (tienda && TIENDAS.includes(tienda)) {
    records = records.filter(r => r.tienda === tienda)
  }
  if (desde) {
    records = records.filter(r => r.fecha >= desde)
  }
  if (hasta) {
    records = records.filter(r => r.fecha <= hasta)
  }

  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tienda, nombre, email, telefono, producto, talla, comentario } = body

  if (!tienda || !TIENDAS.includes(tienda)) {
    return NextResponse.json({ error: 'Tienda inválida' }, { status: 400 })
  }

  // Use Claude to extract insights from the free-text comentario
  let insights = ''
  const textToAnalyze = [
    producto && `Producto: ${producto}`,
    talla    && `Talla: ${talla}`,
    comentario && `Comentario: ${comentario}`,
  ].filter(Boolean).join('. ')

  if (textToAnalyze) {
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Eres asistente de una tienda de ropa íntima femenina llamada Demarie. 
Analiza este registro de venta perdida y extrae en 1-2 oraciones cortas los insights clave 
(qué producto, talla, patrón de demanda, acción recomendada). Sé conciso y directo.

Registro: ${textToAnalyze}

Responde SOLO con el insight, sin introducción.`
        }]
      })
      insights = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    } catch {
      insights = ''
    }
  }

  const record: VentaPerdida = {
    id:         randomUUID(),
    tienda,
    fecha:      new Date().toISOString().split('T')[0],
    nombre:     nombre    || undefined,
    email:      email     || undefined,
    telefono:   telefono  || undefined,
    producto:   producto  || undefined,
    talla:      talla     || undefined,
    comentario: comentario || undefined,
    insights,
    createdAt:  new Date().toISOString(),
  }

  addRecord(record)
  return NextResponse.json(record, { status: 201 })
}
