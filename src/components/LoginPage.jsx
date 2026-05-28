import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { signIn, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(username, password);
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={styles.logoText}>Admin Console</span>
        </div>

        <h1 style={styles.heading}>Sign in</h1>
        <p style={styles.sub}>Superadmin access only</p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              placeholder="your_username"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.pwWrap}>
              <input
                style={{ ...styles.input, paddingRight: 44 }}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPw(p => !p)}
                tabIndex={-1}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f10',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  card: {
    width: 400,
    background: '#18181b',
    border: '1px solid #2a2a2f',
    borderRadius: 16,
    padding: '40px 40px 36px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: '#6c47ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  logoText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#e4e4e7',
    letterSpacing: '-0.01em',
  },
  heading: {
    margin: '0 0 6px',
    fontSize: 26,
    fontWeight: 700,
    color: '#fafafa',
    letterSpacing: '-0.03em',
  },
  sub: {
    margin: '0 0 28px',
    fontSize: 13,
    color: '#71717a',
  },
  errorBanner: {
    background: '#2d1515',
    border: '1px solid #7f1d1d',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#fca5a5',
    marginBottom: 20,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: '#a1a1aa' },
  input: {
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    color: '#e4e4e7',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  pwWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },
  submitBtn: {
    marginTop: 6,
    background: '#6c47ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '-0.01em',
    transition: 'opacity 0.15s',
  },
};
