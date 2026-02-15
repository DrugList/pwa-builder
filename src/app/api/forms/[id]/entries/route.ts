import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = Promise<{ id: string }>;

// GET /api/forms/[id]/entries - Get all entries for a form
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const entries = await db.formEntry.findMany({
      where: { formId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.formEntry.count({
      where: { formId: id },
    });

    // Parse JSON data
    const parsedEntries = entries.map((entry) => ({
      ...entry,
      data: JSON.parse(entry.data),
    }));

    return NextResponse.json({
      entries: parsedEntries,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching form entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form entries' },
      { status: 500 }
    );
  }
}

// POST /api/forms/[id]/entries - Create a new form entry
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data } = body;

    // Verify form exists
    const form = await db.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const entry = await db.formEntry.create({
      data: {
        data: JSON.stringify(data),
        formId: id,
      },
    });

    return NextResponse.json({
      ...entry,
      data: JSON.parse(entry.data),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating form entry:', error);
    return NextResponse.json(
      { error: 'Failed to create form entry' },
      { status: 500 }
    );
  }
}
