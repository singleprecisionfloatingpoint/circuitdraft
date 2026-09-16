const SESSION_KEY = 'voltpad.session.v1';
const USER_KEY = 'voltpad.user.v1';

/** 12 months, per spec. */
export const SESSION_TTL = 1000 * 60 * 60 * 24 * 365;

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function write(key, data) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ ...data, savedAt: Date.now(), expiresAt: Date.now() + SESSION_TTL })
    );
    return true;
  } catch {
    return false;
  }
}

/* ---------------- session (the diagram workspace) ---------------- */

export function saveSession(snapshot) {
  return write(SESSION_KEY, { payload: snapshot });
}

export function loadSession() {
  const rec = read(SESSION_KEY);
  return rec?.payload ?? null;
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function sessionExpiry() {
  const rec = read(SESSION_KEY);
  return rec?.expiresAt ?? null;
}

/* ---------------- account ---------------- */

export function saveUser(user) {
  return write(USER_KEY, { payload: user });
}

export function loadUser() {
  const rec = read(USER_KEY);
  return rec?.payload ?? null;
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}
