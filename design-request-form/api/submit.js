import { google } from 'googleapis'

/**
 * POST /api/submit
 * Appends one row to the configured Google Sheet.
 *
 * Expected env vars (set in Vercel dashboard):
 *   GOOGLE_SPREADSHEET_ID
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_PRIVATE_KEY
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    name,
    email,
    businessName,
    businessDescription,
    hasWebsite,
    // existing website branch
    websiteUrl,
    currentPlatform,
    keepPlatform,
    // no website branch
    preferredPlatform,
    platformBudget,
    // shared
    purpose,
    style,
    inspiration,
    brandAssets,
  } = req.body ?? {}

  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const timestamp = new Date().toISOString()

  const row = [
    timestamp,
    name              ?? '',
    email             ?? '',
    businessName      ?? '',
    businessDescription ?? '',
    hasWebsite        ?? '',
    websiteUrl        ?? '',
    currentPlatform   ?? '',
    keepPlatform      ?? '',
    preferredPlatform ?? '',
    platformBudget    ?? '',
    purpose           ?? '',
    style             ?? '',
    inspiration       ?? '',
    brandAssets       ?? '',
    '',  // Notes — blank, for your use
  ]

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Sheet1!A:P',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Sheets API error:', err?.message ?? err)
    return res.status(500).json({ error: 'Failed to write to sheet' })
  }
}
