import { NextRequest, NextResponse } from 'next/server';
import { getApps, createApp } from '@/lib/google-sheets';

// GET - List all apps
export async function GET() {
  try {
    const apps = await getApps();
    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 });
  }
}

// POST - Create new app
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, iconType, appType } = body;

    const app = await createApp({
      name,
      description: description || '',
      icon: icon || '/icons/default-app.svg',
      iconType: iconType || 'default',
      appType: appType || 'data',
    });

    return NextResponse.json({ app });
  } catch (error) {
    console.error('Error creating app:', error);
    return NextResponse.json({ error: 'Failed to create app' }, { status: 500 });
  }
}