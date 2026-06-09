import { VentaPerdida } from './types'
import { put } from '@vercel/blob'

const BLOB_KEY = 'ventas-perdidas/data.json'

export async function readAll(): Promise<VentaPerdida[]> {
  try {
    const url = `https://9dtuwfa5ufzcfoe5.private.blob.vercel-storage.com/${BLOB_KEY}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function writeAll(records: VentaPerdida[]) {
  await put(BLOB_KEY, JSON.stringify(records), {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  } as Parameters<typeof put>[2])
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
