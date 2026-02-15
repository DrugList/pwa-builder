import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List forms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    const where = appId ? { appId } : {};

    const forms = await db.form.findMany({
      where,
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

// POST - Create form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, name, description, fields, submitText, successMsg, isPublished } = body;

    const form = await db.form.create({
      data: {
        appId,
        name,
        description: description || null,
        fields: JSON.stringify(fields || []),
        submitText: submitText || 'Submit',
        successMsg: successMsg || 'Thank you for your submission!',
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json({ form });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}
