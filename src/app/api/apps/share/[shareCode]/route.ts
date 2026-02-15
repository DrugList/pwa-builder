import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get app by share code (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;
    const app = await db.app.findUnique({
      where: { shareCode },
      include: {
        dataSources: true,
        forms: {
          where: { isPublished: true },
        },
        dataItems: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!app || !app.isPublished) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ app });
  } catch (error) {
    console.error('Error fetching app by share code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    );
  }
}
