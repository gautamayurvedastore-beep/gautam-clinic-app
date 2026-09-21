import { Preferences } from '@capacitor/preferences';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const TOKEN_KEY = 'gautam_auth_token';

export async function getToken() {
  const { value } = await Preferences.get({ key: TOKEN_KEY });
  return value;
}

export async function setToken(token) {
  if (!token) {
    await Preferences.remove({ key: TOKEN_KEY });
    return;
  }
  await Preferences.set({ key: TOKEN_KEY, value: token });
}

export class ApiError extends Error {
  constructor(message, errorCode, status, extra = {}) {
    super(message);
    this.errorCode = errorCode;
    this.status = status;
    this.extra = extra;
  }
}

/**
 * Core request helper.
 * @param {string} path - e.g. "send_otp.php"
 * @param {object} options
 * @param {'GET'|'POST'} options.method
 * @param {object} [options.params]  - query string params (GET)
 * @param {object} [options.body]    - form body (POST)
 * @param {boolean} [options.auth]   - attach Bearer token
 */
export async function apiRequest(path, { method = 'GET', params, body, auth = false } = {}) {
  let url = `${BASE_URL}/${path}`;

  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = { 'X-API-KEY': API_KEY };

  if (auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let fetchBody;
  if (body) {
    fetchBody = new URLSearchParams(
      Object.entries(body).filter(([, v]) => v !== undefined && v !== null)
    );
  }

  const res = await fetch(url, { method, headers, body: fetchBody });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new ApiError('Unexpected server response', 'BAD_RESPONSE', res.status);
  }

  if (!data.success) {
    throw new ApiError(data.message || 'Something went wrong', data.error_code, res.status, data);
  }

  return data;
}
