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

export const updateMe = (payload) =>
  request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) });

// Admin password reset — done by deleting + re-creating isn't ideal;
// the cleanest approach with this API is a dedicated admin endpoint.
// We expose a helper that calls the user's own change-password route
// by temporarily impersonating via a provided admin-supplied new password.
// Since the backend doesn't have an admin reset endpoint, we document this
// and leave the function ready to wire up when added.
export const adminResetPassword = async (userId, newPassword) => {
  // NOTE: Wire this up to a real admin endpoint like:
  // PATCH /users/{id}/reset-password  when added to the backend.
  throw new Error('Admin password reset endpoint not yet implemented in backend. See api.js for details.');
};
