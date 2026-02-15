import { NextRequest, NextResponse } from 'next/server';
import { getAppByShareCode, getDataItems, getForms } from '@/lib/google-sheets';

// GET - Get app by share code (public access)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shareCode: string }> }
) {
    try {
        const { shareCode } = await params;

        // Get the app first
        const app = await getAppByShareCode(shareCode);

        if (!app) {
            return NextResponse.json({ error: 'App not found' }, { status: 404 });
        }

        // Get related data with error handling
        let dataItems: Array<{
            id: string;
            appId: string;
            data: Record<string, unknown>;
            isFavorite: boolean;
            displayOrder: number;
            createdAt: string;
            updatedAt: string;
        }> = [];
        let forms: Array<{
            id: string;
            appId: string;
            name: string;
            description: string | null;
            fields: unknown;
            submitText: string;
            successMsg: string;
            isPublished: boolean;
        }> = [];

        try {
            dataItems = await getDataItems(app.id);
        } catch (e) {
            console.log('No data items:', e);
        }

        try {
            forms = await getForms(app.id);
        } catch (e) {
            console.log('No forms:', e);
        }

        return NextResponse.json({
            app: {
                ...app,
                dataItems,
                forms,
            },
        });
    } catch (error) {
        console.error('Error fetching app by share code:', error);
        return NextResponse.json(
            { error: 'Failed to fetch app', details: String(error) },
            { status: 500 }
        );
    }
}