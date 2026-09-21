import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import TopBar from '../components/TopBar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { updateProfile, logout as apiLogout } from '../api/endpoints';
import Icon from '../components/Icon';

export default function Profile() {
  const { patient, refreshProfile, logoutLocal } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: patient?.name || '',
    email: patient?.email || '',
    address: patient?.address || '',
    date_ob: patient?.date_ob || '',
  });

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshProfile();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (!confirm('Log out of your account?')) return;
    try {
      await apiLogout();
    } catch {
      /* even if the API call fails, clear local session */
    }
    await logoutLocal();
    navigate('/login', { replace: true });
  }

  const inputClass =
    'w-full mt-1 rounded-[var(--radius-field)] border-[1.5px] border-input-border focus:border-primary outline-none px-3 py-2.5 bg-surface-raised text-sm';

  return (
    <AppLayout>
      <TopBar title="Profile" />

      <div className="px-5 pt-5">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-20 w-20 rounded-full bg-surface-subdued flex items-center justify-center text-primary mb-3">
            <Icon name="person" className="text-[36px]" />
          </div>
          <h2 className="text-lg font-semibold text-ink">{patient?.name}</h2>
          <div className="flex items-center gap-1.5 text-ink-muted text-sm mt-0.5">
            +91 {patient?.mobile}
            <Icon name="verified" className="text-success text-[16px]" />
          </div>
        </div>

        <div className="bg-surface-raised border border-outline rounded-[var(--radius-card)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink">Personal details</h3>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-primary">
                <Icon name="edit" className="text-[20px]" />
              </button>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-3">
              <label className="text-sm">
                <span className="text-ink-muted text-xs">Name</span>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="text-ink-muted text-xs">Email</span>
                <input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="text-ink-muted text-xs">Date of birth</span>
                <input type="date" className={inputClass} value={form.date_ob || ''} onChange={(e) => setForm({ ...form, date_ob: e.target.value })} />
              </label>
              <label className="text-sm">
                <span className="text-ink-muted text-xs">Address</span>
                <textarea className={inputClass} rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </label>
              <div className="flex gap-2 mt-1">
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                <Button loading={saving} onClick={handleSave}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <Row label="Email" value={patient?.email || '—'} />
              <Row label="Date of birth" value={patient?.date_ob || '—'} />
              <Row label="Address" value={patient?.address || '—'} />
            </div>
          )}
        </div>

        <Button variant="danger" className="mt-6" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </AppLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-outline pb-2.5 last:border-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}
