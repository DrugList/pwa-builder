import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = Promise<{ id: string }>;

// GET /api/data-sources/[id] - Get a single data source
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const dataSource = await db.dataSource.findUnique({
      where: { id },
      include: {
        dataItems: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!dataSource) {
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
    }

    return NextResponse.json(dataSource);
  } catch (error) {
    console.error('Error fetching data source:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data source' },
      { status: 500 }
    );
  }
}

// PUT /api/data-sources/[id] - Update a data source
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { config } = body;

    const dataSource = await db.dataSource.update({
      where: { id },
      data: {
        config: config ? JSON.stringify(config) : undefined,
      },
    });

    return NextResponse.json(dataSource);
  } catch (error) {
    console.error('Error updating data source:', error);
    return NextResponse.json(
      { error: 'Failed to update data source' },
      { status: 500 }
    );
  }
}

// DELETE /api/data-sources/[id] - Delete a data source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    
    await db.dataSource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data source:', error);
    return NextResponse.json(
      { error: 'Failed to delete data source' },
      { status: 500 }
    );
  }
}
