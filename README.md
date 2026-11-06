# Password Gate

A simple password page: enter a password, get redirected to a link. Deployed on
Vercel, with attempts optionally logged to a Google Sheet.

## Folder structure

```
password-gate/
├── index.html              the login page
├── assets/
│   └── style.css           styling
├── src/
│   └── app.js               client-side logic (calls /api/verify)
├── api/
│   └── verify.js            serverless function — checks the password
├── apps-script-webhook/
│   └── Code.gs               optional: separate Apps Script that logs to a Sheet
├── .env.example
└── package.json
```

Note: Vercel only auto-detects serverless functions inside an `/api` folder at
the project root, so `verify.js` has to live there rather than under `src/`.
`src/` holds the browser-side script and `assets/` holds the CSS, as requested.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Password gate"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 2. Deploy on Vercel

1. Go to vercel.com → **Add New Project** → import the GitHub repo.
2. Framework preset: **Other** (it's static + a serverless function, no build step needed).
3. Before deploying, add Environment Variables (Project Settings → Environment Variables):
   - `GATE_PASSWORD` — the password visitors must type
   - `TARGET_URL` — the link they're sent to once correct
   - `LOG_WEBHOOK_URL` — (optional) the Apps Script web app URL from step 3 below
4. Deploy.

The password and link never appear in the page source — they only exist as
environment variables read by `api/verify.js` on the server.

## 3. (Optional) Log attempts to a Google Sheet

Vercel can't run Google Apps Script's `SpreadsheetApp` directly, so logging
uses a small, separate Apps Script that just receives a result and writes it
to a Sheet:

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Replace the default code with `apps-script-webhook/Code.gs`.
3. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the deployment URL it gives you.
5. In Vercel, set `LOG_WEBHOOK_URL` to that URL, then redeploy (Vercel
   redeploys automatically when you change env vars and click **Redeploy**).
6. Run `showLogUrl` once from the Apps Script editor to get the link to the
   created "Password Attempts Log" sheet.

If you skip this step, the gate still works — it just won't log attempts
anywhere.

## Changing the password or link later

Edit the `GATE_PASSWORD` / `TARGET_URL` environment variables in Vercel's
dashboard and click **Redeploy** — no code change needed.
