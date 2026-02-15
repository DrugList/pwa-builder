import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = Promise<{ id: string }>;

// GET /api/data-sources/[id]/items - Get all items for a data source
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const favorites = searchParams.get('favorites') === 'true';

    const where: { dataSourceId: string; isFavorite?: boolean } = { dataSourceId: id };
    if (favorites) {
      where.isFavorite = true;
    }

    const items = await db.dataItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON data
    const parsedItems = items.map((item) => ({
      ...item,
      data: JSON.parse(item.data),
    }));

    return NextResponse.json(parsedItems);
  } catch (error) {
    console.error('Error fetching data items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data items' },
      { status: 500 }
    );
  }
}

// POST /api/data-sources/[id]/items - Create a new data item
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, isFavorite } = body;

    const item = await db.dataItem.create({
      data: {
        data: JSON.stringify(data),
        isFavorite: isFavorite || false,
        dataSourceId: id,
      },
    });

    return NextResponse.json({
      ...item,
      data: JSON.parse(item.data),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating data item:', error);
    return NextResponse.json(
      { error: 'Failed to create data item' },
      { status: 500 }
    );
  }
}
