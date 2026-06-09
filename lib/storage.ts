import { VentaPerdida } from './types'
import { put, list, getDownloadUrl } from '@vercel/blob'

const BLOB_KEY = 'ventas-perdidas/data.json'

export async function readAll(): Promise<VentaPerdida[]> {
  try {
    const { blobs } = await list({ prefix: 'ventas-perdidas/' })
    const blob = blobs.find(b => b.pathname === BLOB_KEY)
    if (!blob) return []
    const res = await fetch(blob.downloadUrl)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function writeAll(records: VentaPerdida[]) {
  await put(BLOB_KEY, JSON.stringify(records), {
    access: 'public',
    addRandomSuffix: false,
  })
}

export async function addRecord(record: VentaPerdida) {
  const all = await readAll()
  all.unshift(record)
  await writeAll(all)
}

export async function deleteRecord(id: string) {
  const all = (await readAll()).filter(r => r.id !== id)
  await writeAll(all)
}
