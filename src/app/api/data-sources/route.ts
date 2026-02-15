import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/data-sources - Get all data sources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    const where = appId ? { appId } : {};

    const dataSources = await db.dataSource.findMany({
      where,
      include: {
        dataItems: true,
      },
    });

    return NextResponse.json(dataSources);
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    );
  }
}

// POST /api/data-sources - Create a new data source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, config, appId } = body;

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    // Create data source
    const dataSource = await db.dataSource.create({
      data: {
        type,
        config: JSON.stringify(config || {}),
        appId,
      },
    });

    // For Google Sheets type, simulate fetching data
    if (type === 'google_sheets') {
      const mockData = generateMockSheetData();
      await Promise.all(
        mockData.map((item) =>
          db.dataItem.create({
            data: {
              data: JSON.stringify(item),
              dataSourceId: dataSource.id,
            },
          })
        )
      );
    }

    return NextResponse.json(dataSource, { status: 201 });
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    );
  }
}

// Generate mock Google Sheets data for demo
function generateMockSheetData() {
  const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
  const emails = ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com', 'charlie@example.com'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];

  return names.map((name, index) => ({
    Name: name,
    Email: emails[index],
    Department: departments[index],
    Status: index % 2 === 0 ? 'Active' : 'Pending',
    Score: Math.floor(Math.random() * 100),
    JoinDate: new Date(2024, index, 15).toISOString().split('T')[0],
  }));
}
