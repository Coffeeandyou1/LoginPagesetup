// /api/verify.js
// Runs on Vercel's server. The real password, the target link, and the log
// webhook URL all stay here as environment variables — never in the page.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const { password = '', vid = 'unknown', browser = 'unknown' } = req.body || {};
  const pw = String(password).trim().slice(0, 200);
  const ua = String(browser).slice(0, 300);

  const CORRECT_PASSWORD = process.env.GATE_PASSWORD;
  const TARGET_URL = process.env.TARGET_URL;
  const LOG_WEBHOOK_URL = process.env.LOG_WEBHOOK_URL; // optional

  const isCorrect = Boolean(CORRECT_PASSWORD) && pw === CORRECT_PASSWORD;

  // Fire-and-forget log to the Google Sheet via the Apps Script webhook.
  // A logging failure never blocks or breaks the login itself.
  if (LOG_WEBHOOK_URL) {
    fetch(LOG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: isCorrect ? 'CORRECT' : 'WRONG',
        text: pw,
        vid: String(vid).slice(0, 40),
        browser: ua
      })
    }).catch(() => {});
  }

  if (isCorrect) {
    return res.status(200).json({ status: 'ok', url: TARGET_URL });
  }
  return res.status(200).json({ status: 'wrong' });
}
