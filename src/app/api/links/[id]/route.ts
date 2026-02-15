import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const LINKS_SHEET = 'Links';

function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: SERVICE_EMAIL, private_key: PRIVATE_KEY },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID, range: `${LINKS_SHEET}!A:A`,
        });
        const rows = response.data.values;
        if (!rows) return NextResponse.json({ success: true });
        const rowIndex = rows.findIndex((row) => row[0] === id);
        if (rowIndex === -1) return NextResponse.json({ success: true });
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID, range: `${LINKS_SHEET}!A${rowIndex + 1}:F${rowIndex + 1}`,
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting link:', error);
        return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
    }
}