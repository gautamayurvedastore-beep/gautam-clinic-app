import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { verifyOtp, sendOtp } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import logoFull from '../../assets/logo-full.png';

const RESEND_SECONDS = 45;

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const mobile = state?.mobile;
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!mobile) navigate('/login', { replace: true });
  }, [mobile, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleDigit(i, val) {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 3) inputsRef.current[i + 1]?.focus();
    if (next.every((d) => d) && next.join('').length === 4) {
      handleVerify(next.join(''));
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  async function handleVerify(code) {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(mobile, code);
      if (res.is_existing_user) {
        await login(res.token, res.patient);
        navigate('/home', { replace: true });
      } else {
        navigate('/register', { state: { mobile, verifyToken: res.verify_token }, replace: true });
      }
    } catch (err) {
      setDigits(['', '', '', '']);
      inputsRef.current[0]?.focus();
      if (err instanceof ApiError) {
        setError(
          err.extra?.attempts_remaining !== undefined
            ? `${err.message}, ${err.extra.attempts_remaining} attempts remaining`
            : err.message
        );
      } else {
        setError('Could not verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    try {
      await sendOtp(mobile);
      setCooldown(RESEND_SECONDS);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend OTP.');
    }
  }

  const maskedMobile = mobile ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}` : '';

  return (
    <div className="app-shell justify-center px-6 py-10">
      <div className="flex flex-col items-center mb-6">
        <img src={logoFull} alt="" className="h-20 object-contain" />
      </div>

      <h1 className="text-2xl font-semibold text-center text-ink">Almost there</h1>
      <p className="text-center text-ink-muted mt-1.5 mb-8">Login or register with your mobile number</p>

      <div className="bg-surface-raised rounded-[var(--radius-card)] border border-outline p-5 mb-4">
        <p className="text-xs font-semibold tracking-wide text-ink-muted">MOBILE NUMBER</p>
        <div className="mt-2 flex items-center justify-between rounded-[var(--radius-field)] border-[1.5px] border-input-border px-3 py-3">
          <span className="text-base font-medium">{maskedMobile}</span>
          <span className="text-xs font-semibold text-success bg-success-bg px-2.5 py-1 rounded-full">
            Verified
          </span>
        </div>
      </div>

      <div className="bg-surface-raised rounded-[var(--radius-card)] border border-outline p-5">
        <h2 className="text-lg font-semibold">Verify your number</h2>
        <p className="text-sm text-ink-muted mt-1">
          Enter the 4-digit code sent to <span className="font-medium text-ink">{maskedMobile}</span>
        </p>

        <div className="flex gap-3 mt-5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-14 h-14 text-center text-xl font-semibold rounded-[var(--radius-field)] border-[1.5px] border-input-border focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none bg-surface-subdued"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-danger text-sm bg-danger-bg rounded-[var(--radius-field)] px-3 py-2 mt-4">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-5">
          <span className="text-sm text-ink-muted">Didn't receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-sm font-semibold text-primary disabled:text-ink-muted"
          >
            Resend OTP {cooldown > 0 && `(0:${String(cooldown).padStart(2, '0')})`}
          </button>
        </div>

        <Button className="mt-6" loading={loading} onClick={() => handleVerify(digits.join(''))} disabled={digits.some((d) => !d)}>
          Verify &amp; Continue
        </Button>
      </div>
    </div>
  );
}
