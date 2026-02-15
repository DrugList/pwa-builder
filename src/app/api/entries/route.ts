import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List form entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');

    const where = formId ? { formId } : {};

    const entries = await db.formEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// POST - Create form entry (public submission)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, data } = body;

    // Verify form exists and is published
    const form = await db.form.findUnique({
      where: { id: formId },
    });

    if (!form || !form.isPublished) {
      return NextResponse.json(
        { error: 'Form not found or not published' },
        { status: 404 }
      );
    }

    const entry = await db.formEntry.create({
      data: {
        formId,
        data: JSON.stringify(data || {}),
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
