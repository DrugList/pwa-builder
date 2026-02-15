import { NextRequest, NextResponse } from 'next/server';
import { getDataItems, createDataItem, updateDataItem, deleteDataItem } from '@/lib/google-sheets';

type Params = Promise<{ id: string }>;

// GET /api/data-sources/[id]/items - Get all items for a data source (app)
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const favorites = searchParams.get('favorites') === 'true';

    const items = await getDataItems(id);

    // Filter favorites if requested
    const filteredItems = favorites
      ? items.filter((item) => item.isFavorite)
      : items;

    return NextResponse.json(filteredItems);
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

    const item = await createDataItem({
      appId: id,
      data: data || {},
      isFavorite: isFavorite || false,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating data item:', error);
    return NextResponse.json(
      { error: 'Failed to create data item' },
      { status: 500 }
    );
  }
}

// PUT /api/data-sources/[id]/items - Update a data item
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itemId, data, isFavorite, displayOrder } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await updateDataItem(itemId, {
      data,
      isFavorite,
      displayOrder,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating data item:', error);
    return NextResponse.json(
      { error: 'Failed to update data item' },
      { status: 500 }
    );
  }
}

// DELETE /api/data-sources/[id]/items - Delete a data item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await deleteDataItem(itemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data item:', error);
    return NextResponse.json(
      { error: 'Failed to delete data item' },
      { status: 500 }
    );
  }
}