import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single data item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.dataItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching data item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data item' },
      { status: 500 }
    );
  }
}

// PUT - Update data item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, isFavorite, displayOrder } = body;

    const item = await db.dataItem.update({
      where: { id },
      data: {
        ...(data !== undefined && { data: JSON.stringify(data) }),
        ...(isFavorite !== undefined && { isFavorite }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating data item:', error);
    return NextResponse.json(
      { error: 'Failed to update data item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete data item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.dataItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data item:', error);
    return NextResponse.json(
      { error: 'Failed to delete data item' },
      { status: 500 }
    );
  }
}
