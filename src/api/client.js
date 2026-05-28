const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

let _token = null;

export const setToken = (t) => { _token = t; };
export const getToken = () => _token;
export const clearToken = () => { _token = null; };

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.detail || `Request failed (${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

// Internal/escape-hatch request helper for endpoints not yet wrapped above.
// Prefer adding a dedicated exported function for each endpoint when possible.
export const request_internal = (path, options = {}) => request(path, options);

// Auth
export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const logout = () => request('/auth/logout', { method: 'POST' });

// Users (admin)
export const listUsers = (skip = 0, limit = 100) =>
  request(`/users/?skip=${skip}&limit=${limit}`);

export const getUser = (id) => request(`/users/${id}`);

export const setUserActive = (id, is_active) =>
  request(`/users/${id}/activate?is_active=${is_active}`, { method: 'PATCH' });

export const deleteUser = (id) =>
  request(`/users/${id}`, { method: 'DELETE' });

export const getMe = () => request('/users/me');

export const updateMe = (payload) =>
  request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) });

export const adminResetPassword = async (userId, newPassword) => {
  // Backend expects a POST with `new_password` (see README).
  return request(`/users/${userId}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ new_password: newPassword }),
  });
};
