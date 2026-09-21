import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { registerPatient, getBranches, getDoctors } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';

export default function Register() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const mobile = state?.mobile;
  const verifyToken = state?.verifyToken;

  const [form, setForm] = useState({
    name: '',
    sex: 'Female',
    date_ob: '',
    email: '',
    address: '',
    branch_id: '',
    doctor_id: '',
  });
  const [branches, setBranches] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mobile || !verifyToken) navigate('/login', { replace: true });
  }, [mobile, verifyToken, navigate]);

  useEffect(() => {
    getBranches().then((res) => setBranches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.branch_id) {
      setDoctors([]);
      return;
    }
    getDoctors(form.branch_id).then((res) => setDoctors(res.data)).catch(() => {});
  }, [form.branch_id]);

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.branch_id) {
      setError('Please fill in your name and choose a branch.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerPatient({ ...form, mobile, verify_token: verifyToken });
      await login(res.token, res.patient);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full mt-1.5 rounded-[var(--radius-field)] border-[1.5px] border-input-border focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none px-3 py-3 bg-surface-raised text-sm';

  return (
    <div className="app-shell px-6 py-8">
      <h1 className="text-2xl font-semibold text-ink">Tell us about you</h1>
      <p className="text-ink-muted mt-1 mb-2">Just a few details to set up your patient profile.</p>

      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success-bg rounded-full px-3 py-1 my-3">
        <Icon name="check_circle" className="text-[15px]" />
        +91 {mobile} verified
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <label className="text-sm">
          <span className="font-medium text-ink">Full name</span>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Priya Sharma"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-ink">Gender</span>
          <div className="mt-1.5 flex gap-2">
            {['Male', 'Female', 'Other'].map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => set('sex', g)}
                className={`flex-1 py-2.5 rounded-[var(--radius-field)] text-sm font-semibold border-[1.5px] ${
                  form.sex === g
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-outline text-ink-muted bg-surface-raised'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <label className="text-sm">
          <span className="font-medium text-ink">Date of birth</span>
          <input
            type="date"
            className={inputClass}
            value={form.date_ob}
            onChange={(e) => set('date_ob', e.target.value)}
          />
        </label>

        <label className="text-sm">
          <span className="font-medium text-ink">Email (optional)</span>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="text-sm">
          <span className="font-medium text-ink">Address (optional)</span>
          <textarea
            className={inputClass}
            rows={2}
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </label>

        <label className="text-sm">
          <span className="font-medium text-ink">Preferred branch</span>
          <select className={inputClass} value={form.branch_id} onChange={(e) => set('branch_id', e.target.value)}>
            <option value="">Select a branch</option>
            {branches.map((b) => (
              <option key={b.branch_id} value={b.branch_id}>{b.branch}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="font-medium text-ink">Preferred doctor (optional)</span>
          <select
            className={inputClass}
            value={form.doctor_id}
            onChange={(e) => set('doctor_id', e.target.value)}
            disabled={!form.branch_id}
          >
            <option value="">No preference</option>
            {doctors.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>
            ))}
          </select>
        </label>

        {error && <p className="text-danger text-sm bg-danger-bg rounded-[var(--radius-field)] px-3 py-2">{error}</p>}

        <Button type="submit" loading={loading} className="mt-2">
          Complete Registration
        </Button>
      </form>
    </div>
  );
}
