import { NextRequest, NextResponse } from 'next/server';
import { getDataItems, createDataItem } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const items = await getDataItems(appId || undefined);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching data items:', error);
    return NextResponse.json({ error: 'Failed to fetch data items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, data, isFavorite } = body;
    const item = await createDataItem({
      appId,
      data: data || {},
      isFavorite: isFavorite || false,
    });
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error creating data item:', error);
    return NextResponse.json({ error: 'Failed to create data item' }, { status: 500 });
  }
}