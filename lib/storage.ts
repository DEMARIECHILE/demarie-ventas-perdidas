import { VentaPerdida } from './types'
import fs from 'fs'
import path from 'path'

// In production (Vercel) we use /tmp which is ephemeral but fine for demo.
// For persistence across deploys, swap this with Vercel KV or PlanetScale.
const DATA_FILE = process.env.NODE_ENV === 'production'
  ? '/tmp/ventas-perdidas.json'
  : path.join(process.cwd(), 'data', 'ventas-perdidas.json')

function ensureFile() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
}

export function readAll(): VentaPerdida[] {
  try {
    ensureFile()
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as VentaPerdida[]
  } catch {
    return []
  }
}

export function writeAll(records: VentaPerdida[]) {
  ensureFile()
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

export function addRecord(record: VentaPerdida) {
  const all = readAll()
  all.unshift(record)
  writeAll(all)
}

export function deleteRecord(id: string) {
  const all = readAll().filter(r => r.id !== id)
  writeAll(all)
}
