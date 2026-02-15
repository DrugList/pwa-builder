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

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const appId = searchParams.get('appId');
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LINKS_SHEET}!A:F`,
        });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) return NextResponse.json({ links: [] });
        let links = rows.slice(1).map((row) => ({
            id: row[0] || '', appId: row[1] || '', title: row[2] || '',
            url: row[3] || '', icon: row[4] || '🔗', displayOrder: parseInt(row[5]) || 0,
        }));
        if (appId) links = links.filter((link) => link.appId === appId);
        return NextResponse.json({ links });
    } catch (error) {
        console.error('Error fetching links:', error);
        return NextResponse.json({ links: [] });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { appId, title, url, icon } = body;
        const sheets = getGoogleSheetsClient();
        const id = generateId();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID, range: `${LINKS_SHEET}!A:A`,
        });
        const displayOrder = response.data.values?.length || 0;
        const row = [id, appId, title, url, icon || '🔗', displayOrder.toString()];
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID, range: `${LINKS_SHEET}!A:F`,
            valueInputOption: 'USER_ENTERED', requestBody: { values: [row] },
        });
        return NextResponse.json({ link: { id, appId, title, url, icon: icon || '🔗', displayOrder } });
    } catch (error) {
        console.error('Error creating link:', error);
        return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
    }
}