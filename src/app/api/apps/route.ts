import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// GET - List all apps
export async function GET() {
  try {
    const apps = await db.app.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        dataSources: true,
        forms: true,
        _count: {
          select: { dataItems: true },
        },
      },
    });
    
    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

// POST - Create new app
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, iconType, appType, config } = body;

    const app = await db.app.create({
      data: {
        name,
        description: description || null,
        icon: icon || '/icons/default-app.svg',
        iconType: iconType || 'default',
        appType: appType || 'data',
        config: JSON.stringify(config || {}),
        shareCode: nanoid(8),
        isPublished: true,
      },
    });

    return NextResponse.json({ app });
  } catch (error) {
    console.error('Error creating app:', error);
    return NextResponse.json(
      { error: 'Failed to create app' },
      { status: 500 }
    );
  }
}
