import { NextRequest, NextResponse } from 'next/server'
import { getIndexes, saveIndex, deleteIndex, IndexMetadata } from '@/lib/storage'

export async function GET() {
  try {
    const indexes = await getIndexes()
    return NextResponse.json({ indexes: indexes || [] })
  } catch {
    // Return empty array instead of error to allow app to function
    console.error('Failed to get indexes')
    return NextResponse.json({ indexes: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const indexData: IndexMetadata = await request.json()
    await saveIndex(indexData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save index:', error)
    return NextResponse.json(
      { error: 'Failed to save index' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { namespace } = await request.json()
    await deleteIndex(namespace)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete index:', error)
    return NextResponse.json(
      { error: 'Failed to delete index' },
      { status: 500 }
    )
  }
}