import { NextRequest, NextResponse } from 'next/server';
import { getApps, getDataItems, createDataItem } from '@/lib/google-sheets';

// GET /api/data-sources - Get all data sources (returns data grouped by app)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (appId) {
      const items = await getDataItems(appId);
      return NextResponse.json({
        id: appId,
        appId,
        type: 'google_sheets',
        dataItems: items,
      });
    }

    // Return all apps with their data
    const apps = await getApps();
    const dataSources = await Promise.all(
      apps.map(async (app) => {
        const items = await getDataItems(app.id);
        return {
          id: app.id,
          appId: app.id,
          type: 'google_sheets',
          dataItems: items,
        };
      })
    );

    return NextResponse.json(dataSources);
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    );
  }
}

// POST /api/data-sources - Create a new data item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, data, isFavorite } = body;

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    // Create a new data item
    const item = await createDataItem({
      appId,
      data: data || {},
      isFavorite: isFavorite || false,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    );
  }
}