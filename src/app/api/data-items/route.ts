import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List data items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    const where = appId ? { appId } : {};

    const items = await db.dataItem.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching data items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data items' },
      { status: 500 }
    );
  }
}

// POST - Create data item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, data, isFavorite, dataSourceId } = body;

    const count = await db.dataItem.count({ where: { appId } });

    const item = await db.dataItem.create({
      data: {
        appId,
        data: JSON.stringify(data || {}),
        isFavorite: isFavorite || false,
        displayOrder: count,
        dataSourceId,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error creating data item:', error);
    return NextResponse.json(
      { error: 'Failed to create data item' },
      { status: 500 }
    );
  }
}
