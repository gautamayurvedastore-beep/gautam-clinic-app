import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { sendOtp } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import logoFull from '../../assets/logo-full.png';

export default function MobileEntry() {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValid = /^[6-9]\d{9}$/.test(mobile);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await sendOtp(mobile);
      navigate('/verify-otp', { state: { mobile, isExistingUser: res.is_existing_user } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell justify-center px-6 py-10">
      <div className="flex flex-col items-center mb-8">
        <img src={logoFull} alt="" className="h-28 object-contain" />
      </div>

      <h1 className="text-2xl font-semibold text-center text-ink">Welcome back</h1>
      <p className="text-center text-ink-muted mt-1.5 mb-8">
        Login or register with your mobile number
      </p>

      <form onSubmit={handleSubmit} className="bg-surface-raised rounded-[var(--radius-card)] border border-outline p-5">

        <label className="text-xs font-semibold tracking-wide text-ink-muted">MOBILE NUMBER</label>
        <div className="mt-2 flex items-center gap-2 rounded-[var(--radius-field)] border-[1.5px] border-input-border focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10 px-3">
          <span className="flex items-center gap-1 text-sm font-medium text-ink border-r border-input-border pr-2 py-3">
            <span className="text-xs text-ink-muted">IN</span> +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="flex-1 py-3 bg-transparent outline-none text-base tracking-wide"
            autoFocus
          />
        </div>

        {error && <p className="text-danger text-sm mt-3">{error}</p>}

        <Button type="submit" className="mt-6" loading={loading} disabled={!isValid}>
          Send OTP
        </Button>
      </form>

      <p className="text-center text-xs text-ink-muted mt-8 px-4">
        By continuing you agree to our{' '}
        <span className="text-primary font-medium">Terms</span> &{' '}
        <span className="text-primary font-medium">Privacy Policy</span>
      </p>
    </div>
  );
}
