import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const form = await db.form.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

// PUT - Update form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, fields, submitText, successMsg, isPublished } = body;

    const form = await db.form.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(fields !== undefined && { fields: JSON.stringify(fields) }),
        ...(submitText !== undefined && { submitText }),
        ...(successMsg !== undefined && { successMsg }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ form });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

// DELETE - Delete form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.form.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}
