import { NextRequest, NextResponse } from 'next/server'
import { deleteRecord } from '@/lib/storage'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  deleteRecord(params.id)
  return NextResponse.json({ ok: true })
}
