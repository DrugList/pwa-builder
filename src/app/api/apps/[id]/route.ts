import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single app
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const app = await db.app.findUnique({
      where: { id },
      include: {
        dataSources: true,
        forms: true,
        dataItems: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ app });
  } catch (error) {
    console.error('Error fetching app:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    );
  }
}

// PUT - Update app
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, iconType, appType, config, isPublished } = body;

    const app = await db.app.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(iconType !== undefined && { iconType }),
        ...(appType !== undefined && { appType }),
        ...(config !== undefined && { config: JSON.stringify(config) }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ app });
  } catch (error) {
    console.error('Error updating app:', error);
    return NextResponse.json(
      { error: 'Failed to update app' },
      { status: 500 }
    );
  }
}

// DELETE - Delete app
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.app.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting app:', error);
    return NextResponse.json(
      { error: 'Failed to delete app' },
      { status: 500 }
    );
  }
}
