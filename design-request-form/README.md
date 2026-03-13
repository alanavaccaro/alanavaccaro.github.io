# Design Request Form

A Typeform-style, single-question-at-a-time design inquiry form built with React + Vite, deployed to Vercel, and wired to a private Google Sheet.

---

## Stack

| Layer | Tech |
|---|---|
| UI | React 18 + Vite |
| Hosting | Vercel (frontend + serverless API) |
| Data | Google Sheets API v4 (service account) |
| Font | Geist via Google Fonts |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy the env example and fill in your credentials
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

The Vercel API function (`api/submit.js`) also runs locally when you use the **Vercel CLI**:

```bash
npm install -g vercel
vercel dev   # runs both the Vite frontend and the /api routes
```

---

## Google Sheets Setup

### 1. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and click **New Project**.
2. Give it a name (e.g. `design-request-form`) and click **Create**.

### 2. Enable the Sheets API

1. In your new project, go to **APIs & Services → Library**.
2. Search for **Google Sheets API** and click **Enable**.

### 3. Create a Service Account

1. Go to **APIs & Services → Credentials**.
2. Click **+ Create Credentials → Service account**.
3. Give it a name (e.g. `sheets-writer`) — the email will be generated automatically.
4. Click **Done** (no need to grant project roles here).

### 4. Generate a JSON key

1. Click your new service account in the list.
2. Go to the **Keys** tab → **Add key → Create new key → JSON**.
3. A `.json` file will download. Keep it safe — you won't be able to download it again.

### 5. Create your Google Sheet

1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. In **Row 1**, add these headers (one per column, A through J):

   | A | B | C | D | E | F | G | H | I | J |
   |---|---|---|---|---|---|---|---|---|---|
   | Timestamp | Project Type | Pages | Timeline | Budget | Brand Assets | Copy Ready | Inspiration | Anything Else | Notes |

3. **Share** the sheet with the service account email you created (give it **Editor** access). The email looks like: `something@your-project.iam.gserviceaccount.com`

4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
   ```

### 6. Fill in your `.env.local`

Open `.env.local` and set:

```env
GOOGLE_SPREADSHEET_ID=paste-your-id-here

GOOGLE_SERVICE_ACCOUNT_EMAIL=something@your-project.iam.gserviceaccount.com

# From the downloaded JSON key — copy the "private_key" value exactly,
# keeping the literal \n characters (do not expand them)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

---

## Deploy to Vercel

### Option A — Vercel CLI (quickest)

```bash
npm install -g vercel
vercel            # follow the prompts; choose the design-request-form directory
```

### Option B — GitHub integration

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Set the **Root Directory** to `design-request-form` if it's inside a larger repo.
4. Click **Deploy** — Vercel auto-detects Vite.

### Add environment variables in Vercel

1. In your Vercel project, go to **Settings → Environment Variables**.
2. Add the three variables from `.env.example`:
   - `GOOGLE_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
3. For `GOOGLE_PRIVATE_KEY`, paste the full value including the `-----BEGIN PRIVATE KEY-----` header/footer. Vercel stores it safely and the API function handles the `\n` → newline conversion at runtime.
4. **Redeploy** after adding env vars (or they won't take effect).

---

## Project Structure

```
design-request-form/
├── api/
│   └── submit.js          # Vercel serverless function — posts to Google Sheets
├── src/
│   ├── components/
│   │   ├── MultiChoice.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Step.jsx
│   │   ├── TextInput.jsx
│   │   └── ThankYou.jsx
│   ├── App.jsx            # Main form state and navigation
│   ├── index.css          # All styles
│   ├── main.jsx
│   └── questions.js       # Form questions config — edit here to change questions
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vercel.json
```

---

## Customisation

### Changing questions

Edit `src/questions.js`. Each question has:

```js
{
  id: 'uniqueId',           // used as the column key
  label: 'Question text',
  type: 'choice' | 'text',
  options: [...],           // for type: 'choice'
  optional: true,           // skip validation
  multiline: true,          // textarea instead of input
  placeholder: '...',
}
```

If you add or remove questions, update the column headers in your Google Sheet and adjust the row array in `api/submit.js` to match.

### Accent colour

Change `--accent` in `src/index.css`:

```css
:root {
  --accent: #6d6aff;   /* swap for any colour you like */
}
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| 500 error on submit | Missing or wrong env vars | Double-check all three variables in Vercel |
| `DECODER routines::unsupported` | Private key newlines broken | Make sure `\n` are literal (not real newlines) in the Vercel env var |
| Sheet not updating | Sheet not shared with service account | Share the sheet with the service account email as Editor |
| `googleapis` not found | Dependencies not installed | Run `npm install` |
