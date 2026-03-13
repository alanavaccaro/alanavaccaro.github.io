import { google } from 'googleapis'

/**
 * POST /api/submit
 * Appends one row to the configured Google Sheet.
 *
 * Expected env vars (set in Vercel dashboard):
 *   GOOGLE_SPREADSHEET_ID     — the ID from your sheet's URL
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL — service account email
 *   GOOGLE_PRIVATE_KEY        — private key (with literal \n for newlines)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    projectType,
    pageCount,
    timeline,
    budget,
    brandAssets,
    copyReady,
    inspiration,
    anythingElse,
  } = req.body ?? {}

  // ── Auth ──────────────────────────────────────────────────────────
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  // ── Build row ─────────────────────────────────────────────────────
  const timestamp = new Date().toISOString()

  const row = [
    timestamp,
    projectType   ?? '',
    pageCount     ?? '',
    timeline      ?? '',
    budget        ?? '',
    brandAssets   ?? '',
    copyReady     ?? '',
    inspiration   ?? '',
    anythingElse  ?? '',
    '',  // Notes column — blank, for your use
  ]

  // ── Append ────────────────────────────────────────────────────────
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Sheets API error:', err?.message ?? err)
    return res.status(500).json({ error: 'Failed to write to sheet' })
  }
}
