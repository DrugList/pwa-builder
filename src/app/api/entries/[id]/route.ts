import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = Promise<{ id: string }>;

// GET /api/entries/[id] - Get a single entry
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const entry = await db.formEntry.findUnique({
      where: { id },
      include: {
        form: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...entry,
      data: JSON.parse(entry.data),
      form: {
        ...entry.form,
        fields: JSON.parse(entry.form.fields),
      },
    });
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/entries/[id] - Delete an entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    
    await db.formEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
