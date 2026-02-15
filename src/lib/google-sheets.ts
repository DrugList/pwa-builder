import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const APPS_SHEET = 'Apps';
const DATA_SHEET = 'Data';
const FORMS_SHEET = 'Forms';
const ENTRIES_SHEET = 'Entries';

function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: SERVICE_EMAIL,
            private_key: PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function getApps() {
    try {
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${APPS_SHEET}!A:G`,
        });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];
        return rows.slice(1).map((row) => ({
            id: row[0] || '',
            name: row[1] || '',
            description: row[2] || null,
            icon: row[3] || '/icons/default-app.svg',
            iconType: row[4] || 'default',
            appType: row[5] || 'data',
            shareCode: row[6] || '',
            createdAt: row[7] || new Date().toISOString(),
        }));
    } catch (error) {
        console.error('Error getting apps:', error);
        return [];
    }
}

export async function createApp(data: { name: string; description?: string; icon: string; iconType: string; appType: string }) {
    const sheets = getGoogleSheetsClient();
    const id = generateId();
    const shareCode = generateId().substring(0, 8);
    const now = new Date().toISOString();
    const row = [id, data.name, data.description || '', data.icon, data.iconType, data.appType, shareCode, now];
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${APPS_SHEET}!A:H`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
    });
    return { id, ...data, shareCode, createdAt: now };
}

export async function getAppByShareCode(shareCode: string) {
    const apps = await getApps();
    return apps.find((app) => app.shareCode === shareCode) || null;
}

export async function updateApp(id: string, data: Partial<{ name: string; description: string; icon: string; iconType: string; appType: string }>) {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${APPS_SHEET}!A:A` });
    const rows = response.data.values;
    if (!rows) throw new Error('No data');
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) throw new Error('Not found');
    const current = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${APPS_SHEET}!A${rowIndex + 1}:H${rowIndex + 1}` });
    const currentRow = current.data.values?.[0] || [];
    const updatedRow = [id, data.name ?? currentRow[1], data.description ?? currentRow[2], data.icon ?? currentRow[3], data.iconType ?? currentRow[4], data.appType ?? currentRow[5], currentRow[6], currentRow[7]];
    await sheets.spreadsheets.values.update({ spreadsheetId: SPREADSHEET_ID, range: `${APPS_SHEET}!A${rowIndex + 1}:H${rowIndex + 1}`, valueInputOption: 'USER_ENTERED', requestBody: { values: [updatedRow] } });
    return { id, ...data };
}

export async function deleteApp(id: string) {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${APPS_SHEET}!A:A` });
    const rows = response.data.values;
    if (!rows) return;
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) return;
    await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: `${APPS_SHEET}!A${rowIndex + 1}:H${rowIndex + 1}` });
    return { success: true };
}

export async function getDataItems(appId?: string) {
    try {
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${DATA_SHEET}!A:G` });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];
        let items = rows.slice(1).map((row) => ({ id: row[0] || '', appId: row[1] || '', data: JSON.parse(row[2] || '{}'), isFavorite: row[3] === 'TRUE', displayOrder: parseInt(row[4]) || 0, createdAt: row[5] || new Date().toISOString() }));
        if (appId) items = items.filter((item) => item.appId === appId);
        return items;
    } catch { return []; }
}

export async function createDataItem(data: { appId: string; data: Record<string, unknown>; isFavorite?: boolean }) {
    const sheets = getGoogleSheetsClient();
    const id = generateId();
    const now = new Date().toISOString();
    const items = await getDataItems(data.appId);
    const row = [id, data.appId, JSON.stringify(data.data), data.isFavorite ? 'TRUE' : 'FALSE', items.length.toString(), now];
    await sheets.spreadsheets.values.append({ spreadsheetId: SPREADSHEET_ID, range: `${DATA_SHEET}!A:F`, valueInputOption: 'USER_ENTERED', requestBody: { values: [row] } });
    return { id, ...data, displayOrder: items.length, createdAt: now };
}

export async function updateDataItem(id: string, data: Partial<{ data: Record<string, unknown>; isFavorite: boolean }>) {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${DATA_SHEET}!A:A` });
    const rows = response.data.values;
    if (!rows) throw new Error('No data');
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) throw new Error('Not found');
    const current = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${DATA_SHEET}!A${rowIndex + 1}:F${rowIndex + 1}` });
    const currentRow = current.data.values?.[0] || [];
    const updatedRow = [id, currentRow[1], data.data ? JSON.stringify(data.data) : currentRow[2], (data.isFavorite ?? (currentRow[3] === 'TRUE')) ? 'TRUE' : 'FALSE', currentRow[4], currentRow[5]];
    await sheets.spreadsheets.values.update({ spreadsheetId: SPREADSHEET_ID, range: `${DATA_SHEET}!A${rowIndex + 1}:F${rowIndex + 1}`, valueInputOption: 'USER_ENTERED', requestBody: { values: [updatedRow] } });
    return { id, ...data };
}

export async function deleteDataItem(id: string) {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${DATA_SHEET}!A:A` });
    const rows = response.data.values;
    if (!rows) return;
    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) return;
    await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: `${DATA_SHEET}!A${rowIndex + 1}:F${rowIndex + 1}` });
    return { success: true };
}

export async function getForms(appId?: string) {
    try {
        const sheets = getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${FORMS_SHEET}!A:H` });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];
        let forms = rows.slice(1).map((row) => ({ id: row[0] || '', appId: row[1] || '', name: row[2] || '', description: row[3] || null, fields: JSON.parse(row[4] || '[]'), submitText: row[5] || 'Submit', successMsg: row[6] || 'Thank you!', isPublished: row[7] === 'TRUE' }));
        if (appId) forms = forms.filter((form) => form.appId === appId);
        return forms;
    } catch { return []; }
}

export async function createEntry(data: { formId: string; data: Record<string, unknown> }) {
    const sheets = getGoogleSheetsClient();
    const id = generateId();
    const now = new Date().toISOString();
    const row = [id, data.formId, JSON.stringify(data.data), now];
    await sheets.spreadsheets.values.append({ spreadsheetId: SPREADSHEET_ID, range: `${ENTRIES_SHEET}!A:D`, valueInputOption: 'USER_ENTERED', requestBody: { values: [row] } });
    return { id, ...data, createdAt: now };
}