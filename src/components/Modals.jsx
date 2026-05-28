import { useState, useEffect } from 'react';
import * as api from '../api/client';

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(user?.email || '');
    setFullName(user?.full_name || '');
    setError('');
  }, [user]);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // NOTE: This calls /users/me — backend needs a superadmin PATCH /users/{id} endpoint
      // for editing other users. Wire this up when that endpoint is added.
      // For now the UI shape is complete and ready.
      const payload = {};
      if (email !== user.email) payload.email = email;
      if (fullName !== (user.full_name || '')) payload.full_name = fullName;
      if (Object.keys(payload).length === 0) { onClose(); return; }

      const updated = await api.request_internal(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <h2 style={s.title}>Edit user</h2>
      <div style={s.usernameRow}>
        <Avatar name={user.username} />
        <div>
          <div style={s.uname}>{user.username}</div>
          <div style={s.uid}>ID: {user.id.slice(0, 8)}…</div>
        </div>
      </div>

      {error && <div style={s.err}>{error}</div>}

      <form onSubmit={handleSave} style={s.form}>
        <Field label="Full name">
          <input style={s.input} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" />
        </Field>
        <Field label="Email">
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </Field>

        <div style={s.actions}>
          <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" style={s.saveBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

export function PasswordModal({ user, onClose }) {
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (newPw !== confirm) { setError('Passwords do not match'); return; }
    setSaving(true);
    setError('');
    try {
      await api.adminResetPassword(user.id, newPw);
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <h2 style={s.title}>Reset password</h2>
      <div style={s.usernameRow}>
        <Avatar name={user.username} color="#b45309" bg="#451a03" />
        <div>
          <div style={s.uname}>{user.username}</div>
          <div style={s.uid}>{user.email}</div>
        </div>
      </div>

      {error && <div style={s.err}>{error}</div>}
      {success && <div style={s.success}>Password updated!</div>}

      <form onSubmit={handleSave} style={s.form}>
        <Field label="New password">
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...s.input, paddingRight: 42 }}
              type={show ? 'text' : 'password'}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              minLength={8}
              required
              placeholder="Min 8 chars, upper + lower + digit"
            />
            <button type="button" style={s.eye} onClick={() => setShow(p => !p)} tabIndex={-1}>
              {show ? '🙈' : '👁'}
            </button>
          </div>
        </Field>
        <Field label="Confirm password">
          <input
            style={s.input}
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </Field>

        <StrengthMeter password={newPw} />

        <div style={s.actions}>
          <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" style={{ ...s.saveBtn, background: '#b45309' }} disabled={saving || success}>
            {saving ? 'Resetting…' : 'Reset password'}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

export function DeleteModal({ user, onClose, onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleDelete = async () => {
    setConfirming(true);
    setError('');
    try {
      await api.deleteUser(user.id);
      onDeleted(user.id);
      onClose();
    } catch (err) {
      setError(err.message);
      setConfirming(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
      <h2 style={{ ...s.title, textAlign: 'center', color: '#fca5a5' }}>Delete user?</h2>
      <p style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', margin: '0 0 20px' }}>
        This will permanently delete <strong style={{ color: '#e4e4e7' }}>{user.username}</strong> and all their data. This cannot be undone.
      </p>

      {error && <div style={s.err}>{error}</div>}

      <Field label={`Type "${user.username}" to confirm`}>
        <input
          style={s.input}
          value={typed}
          onChange={e => setTyped(e.target.value)}
          placeholder={user.username}
        />
      </Field>

      <div style={{ ...s.actions, marginTop: 24 }}>
        <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
        <button
          type="button"
          style={{ ...s.saveBtn, background: typed === user.username ? '#991b1b' : '#3f3f46', cursor: typed === user.username ? 'pointer' : 'not-allowed' }}
          disabled={typed !== user.username || confirming}
          onClick={handleDelete}
        >
          {confirming ? 'Deleting…' : 'Delete permanently'}
        </button>
      </div>
    </Overlay>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function Overlay({ onClose, children }) {
  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function Avatar({ name = '?', color = '#818cf8', bg = '#1e1b4b' }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function StrengthMeter({ password }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['#3f3f46', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  const color = colors[score] || '#3f3f46';

  if (!password) return null;
  return (
    <div style={{ marginTop: -4 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? color : '#27272a', transition: 'background 0.2s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color }}>{labels[score]}</span>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: 16,
    padding: '32px 32px 28px',
    width: 420,
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  title: { margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.03em' },
  usernameRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '14px 16px', background: '#09090b', borderRadius: 10, border: '1px solid #27272a' },
  uname: { fontSize: 14, fontWeight: 600, color: '#e4e4e7' },
  uid: { fontSize: 11, color: '#52525b', marginTop: 2 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { fontSize: 12, fontWeight: 500, color: '#a1a1aa' },
  input: {
    background: '#09090b', border: '1px solid #27272a', borderRadius: 8,
    padding: '9px 12px', fontSize: 14, color: '#e4e4e7', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  eye: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { background: 'transparent', border: '1px solid #3f3f46', borderRadius: 8, padding: '9px 18px', fontSize: 13, color: '#a1a1aa', cursor: 'pointer' },
  saveBtn: { background: '#6c47ff', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#fca5a5', marginBottom: 14 },
  success: { background: '#052e16', border: '1px solid #14532d', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#86efac', marginBottom: 14 },
};
