import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import EditUserModal, { PasswordModal, DeleteModal } from './Modals';

const TABS = ['All', 'Active', 'Inactive', 'Superusers'];

export default function Dashboard() {
  const { user: adminUser, signOut } = useAuth();
  const { users, loading, error, fetchUsers, toggleActive, removeUser } = useUsers();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const [editUser, setEditUser] = useState(null);
  const [pwUser, setPwUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (tab === 'Active') list = list.filter(u => u.is_active);
    if (tab === 'Inactive') list = list.filter(u => !u.is_active);
    if (tab === 'Superusers') list = list.filter(u => u.is_superuser);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va = a[sortBy] ?? '';
      let vb = b[sortBy] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, tab, search, sortBy, sortDir]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    superusers: users.filter(u => u.is_superuser).length,
  }), [users]);

  const handleToggleActive = async (u) => {
    const res = await toggleActive(u.id, u.is_active);
    if (res.ok) toast(`${u.username} ${u.is_active ? 'deactivated' : 'activated'}`);
    else toast(`Error: ${res.error}`);
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const sortIcon = (col) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logoRow}>
            <div style={s.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span style={s.logoText}>Admin Console</span>
          </div>

          <nav style={s.nav}>
            <div style={s.navItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Overview
            </div>
            <div style={{ ...s.navItem, ...s.navActive }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Users
            </div>
          </nav>
        </div>

        <div style={s.sideBottom}>
          <div style={s.adminChip}>
            <div style={s.adminAvatar}>{(adminUser?.username || 'A').slice(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 500 }}>{adminUser?.username}</div>
              <div style={{ fontSize: 11, color: '#52525b' }}>Superadmin</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={signOut}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Users</h1>
            <p style={s.pageSub}>Manage all registered accounts</p>
          </div>
          <button style={s.refreshBtn} onClick={fetchUsers}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </header>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { label: 'Total users', value: stats.total, color: '#818cf8' },
            { label: 'Active', value: stats.active, color: '#34d399' },
            { label: 'Inactive', value: stats.inactive, color: '#f87171' },
            { label: 'Superusers', value: stats.superusers, color: '#fbbf24' },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{ fontSize: 11, color: '#52525b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{st.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: st.color, letterSpacing: '-0.04em' }}>{st.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.tabs}>
            {TABS.map(t => (
              <button key={t} style={{ ...s.tabBtn, ...(tab === t ? s.tabActive : {}) }} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <input
            style={s.search}
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && <div style={s.errorBanner}>{error}</div>}

        {/* Table */}
        <div style={s.tableWrap}>
          {loading ? (
            <div style={s.empty}>Loading users…</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>No users found</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {[
                    { key: 'username', label: 'User' },
                    { key: 'email', label: 'Email' },
                    { key: 'is_active', label: 'Status' },
                    { key: 'created_at', label: 'Joined' },
                    { key: 'last_login', label: 'Last login' },
                  ].map(col => (
                    <th key={col.key} style={s.th} onClick={() => handleSort(col.key)}>
                      {col.label}{sortIcon(col.key)}
                    </th>
                  ))}
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{ ...s.tr, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ ...s.avatar, background: u.is_superuser ? '#451a03' : '#1e1b4b', color: u.is_superuser ? '#fbbf24' : '#818cf8' }}>
                          {u.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {u.username}
                            {u.is_superuser && <span style={s.badgeAdmin}>admin</span>}
                          </div>
                          {u.full_name && <div style={{ fontSize: 11, color: '#52525b' }}>{u.full_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: '#a1a1aa', fontSize: 13 }}>{u.email}</td>
                    <td style={s.td}>
                      <span style={u.is_active ? s.badgeActive : s.badgeInactive}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#52525b', fontSize: 12 }}>{fmtDate(u.created_at)}</td>
                    <td style={{ ...s.td, color: '#52525b', fontSize: 12 }}>{u.last_login ? fmtDate(u.last_login) : '—'}</td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <ActionBtn title="Edit profile" onClick={() => setEditUser(u)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </ActionBtn>
                        <ActionBtn title="Reset password" color="#b45309" onClick={() => setPwUser(u)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </ActionBtn>
                        <ActionBtn
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                          color={u.is_active ? '#52525b' : '#16a34a'}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.is_active
                            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          }
                        </ActionBtn>
                        <ActionBtn title="Delete user" color="#991b1b" onClick={() => setDeleteUser(u)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={s.tableFooter}>
          Showing {filtered.length} of {users.length} users
        </div>
      </main>

      {/* Modals */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={(u) => { toast(`${u.username} updated`); setEditUser(null); fetchUsers(); }}
        />
      )}
      {pwUser && <PasswordModal user={pwUser} onClose={() => setPwUser(null)} />}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={(id) => { removeUser(id); toast('User deleted'); }}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={s.toast}>{toastMsg}</div>
      )}
    </div>
  );
}

function ActionBtn({ children, title, color = '#6c47ff', onClick }) {
  return (
    <button
      title={title}
      style={{ ...s.actionBtn, '--btn-color': color }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = color + '22'; e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a'; }}
    >
      {children}
    </button>
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const s = {
  root: {
    display: 'flex', minHeight: '100vh', background: '#0f0f10',
    fontFamily: "'DM Sans', system-ui, sans-serif", color: '#e4e4e7',
  },
  sidebar: {
    width: 220, background: '#18181b', borderRight: '1px solid #27272a',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  sideTop: { padding: 20, flex: 1 },
  sideBottom: { padding: 16, borderTop: '1px solid #27272a' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: { width: 32, height: 32, background: '#6c47ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  logoText: { fontSize: 14, fontWeight: 600, color: '#e4e4e7' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, fontSize: 13, color: '#71717a', cursor: 'pointer' },
  navActive: { background: '#27272a', color: '#e4e4e7' },
  adminChip: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  adminAvatar: { width: 32, height: 32, borderRadius: '50%', background: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#818cf8', flexShrink: 0 },
  logoutBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#71717a', cursor: 'pointer' },
  main: { flex: 1, overflow: 'auto', padding: '32px 36px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 },
  pageTitle: { margin: '0 0 4px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: '#fafafa' },
  pageSub: { margin: 0, fontSize: 13, color: '#52525b' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: 7, background: '#27272a', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#a1a1aa', cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard: { background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '16px 20px' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 16 },
  tabs: { display: 'flex', gap: 2, background: '#18181b', border: '1px solid #27272a', borderRadius: 10, padding: 3 },
  tabBtn: { background: 'transparent', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#71717a', cursor: 'pointer' },
  tabActive: { background: '#27272a', color: '#e4e4e7' },
  search: { background: '#18181b', border: '1px solid #27272a', borderRadius: 9, padding: '8px 14px', fontSize: 13, color: '#e4e4e7', outline: 'none', width: 220 },
  errorBanner: { background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 16 },
  tableWrap: { background: '#18181b', border: '1px solid #27272a', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #27272a', cursor: 'pointer', userSelect: 'none' },
  tr: { borderBottom: '1px solid #1f1f23', transition: 'background 0.1s' },
  td: { padding: '13px 16px', verticalAlign: 'middle' },
  avatar: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  badgeActive: { background: '#052e16', color: '#86efac', border: '1px solid #14532d', borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 600 },
  badgeInactive: { background: '#1c1917', color: '#78716c', border: '1px solid #292524', borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 600 },
  badgeAdmin: { background: '#451a03', color: '#fbbf24', borderRadius: 5, padding: '1px 6px', fontSize: 10, fontWeight: 700 },
  actions: { display: 'flex', gap: 5, alignItems: 'center' },
  actionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: 'transparent', border: '1px solid #27272a', color: '#71717a', cursor: 'pointer', transition: 'all 0.15s' },
  tableFooter: { padding: '12px 16px', fontSize: 12, color: '#3f3f46', borderTop: '1px solid #27272a' },
  empty: { padding: '48px 24px', textAlign: 'center', color: '#52525b', fontSize: 14 },
  toast: {
    position: 'fixed', bottom: 24, right: 24,
    background: '#18181b', border: '1px solid #27272a', borderRadius: 10,
    padding: '12px 18px', fontSize: 13, color: '#e4e4e7',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 2000,
    animation: 'fadeIn 0.2s ease',
  },
};
