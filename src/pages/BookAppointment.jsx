import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';
import Button from '../components/Button';
import {
  getBranches,
  getDoctors,
  getAvailableSlots,
  getDateAvailability,
  rescheduleAppointment,
  createPaymentOrder,
  verifyAndBookAppointment,
} from '../api/endpoints';
import { ApiError } from '../api/client';
import Icon from '../components/Icon';

function nextDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function toDateStr(d) {
  // local-timezone-safe yyyy-mm-dd (avoids the UTC-shift bug of toISOString())
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BookAppointment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rescheduling = state?.rescheduleAppointment;

  const [step, setStep] = useState(rescheduling ? 2 : 1);
  const [branches, setBranches] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [branchId, setBranchId] = useState(rescheduling?.branch_id || '');
  const [doctorId, setDoctorId] = useState(rescheduling?.doctor_id || '');
  const [dateAvailability, setDateAvailability] = useState({}); // { 'yyyy-mm-dd': boolean }
  const [date, setDate] = useState(nextDays(14)[0]);
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payingStatus, setPayingStatus] = useState(''); // '', 'creating_order', 'awaiting_payment', 'verifying'
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState(null);

  const days = useMemo(() => nextDays(14), []);
  const dateStr = toDateStr(date);

  useEffect(() => {
    getBranches().then((res) => setBranches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!branchId) return;
    getDoctors(branchId).then((res) => setDoctors(res.data)).catch(() => {});
  }, [branchId]);

  // Fetch which of the next 14 days have any free slot at all, so the date
  // strip can grey out + disable fully-booked days before the user taps them.
  useEffect(() => {
    if (!branchId || !doctorId) return;
    getDateAvailability(branchId, doctorId, 14)
      .then((res) => {
        const map = {};
        (res.dates || []).forEach((d) => { map[d.date] = d.has_availability; });
        setDateAvailability(map);
      })
      .catch(() => setDateAvailability({}));
  }, [branchId, doctorId]);

  useEffect(() => {
    if (step !== 2 || !branchId || !dateStr) return;
    setLoadingSlots(true);
    setTime('');
    getAvailableSlots(branchId, dateStr, doctorId || undefined)
      .then((res) => setSlots(res.doctors?.[0]?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [step, branchId, dateStr, doctorId]);

  const selectedBranch = branches.find((b) => String(b.branch_id) === String(branchId));
  const selectedDoctor = doctors.find((d) => String(d.doctor_id) === String(doctorId)) || {
    name: rescheduling?.doctor_name,
  };
  const fee = selectedDoctor?.fee;

  async function handleReschedule() {
    setSubmitting(true);
    setError('');
    try {
      await rescheduleAppointment(rescheduling.appointment_id, dateStr, time);
      setConfirmedAppt({ doctor_name: selectedDoctor?.name, appointment_date: dateStr, appointment_time: time });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reschedule. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // New bookings go through Cashfree first - nothing is booked until payment
  // is confirmed. Reschedule (handled above) never needs a new payment.
  async function handlePayAndBook() {
    setSubmitting(true);
    setError('');
    try {
      setPayingStatus('creating_order');
      const order = await createPaymentOrder({
        doctor_id: doctorId,
        branch_id: branchId,
        appointment_date: dateStr,
        appointment_time: time,
      });

      const cashfree = await loadCashfree({ mode: order.cashfree_mode === 'production' ? 'production' : 'sandbox' });

      setPayingStatus('awaiting_payment');
      await cashfree.checkout({
        paymentSessionId: order.payment_session_id,
        redirectTarget: '_modal',
      });
      // Whatever the popup reports, the only source of truth is our own
      // server re-checking with Cashfree directly - never trust the
      // client-side checkout() result alone for something as important as
      // "did the patient actually pay".
      setPayingStatus('verifying');
      const result = await verifyAndBookAppointment(order.order_id);
      setConfirmedAppt(result.appointment);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
      setPayingStatus('');
    }
  }

  if (done) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <span className="h-16 w-16 rounded-full bg-success-bg text-success flex items-center justify-center mb-4">
          <Icon name="check" className="text-[32px]" />
        </span>
        <h1 className="text-xl font-semibold text-ink">
          {rescheduling ? 'Appointment rescheduled!' : 'Appointment booked!'}
        </h1>
        <p className="text-ink-muted text-sm mt-1.5">
          {confirmedAppt?.doctor_name} · {confirmedAppt?.appointment_date} · {confirmedAppt?.appointment_time?.slice(0, 5)}
        </p>
        <Button className="mt-6" onClick={() => navigate('/appointments')}>
          View Appointments
        </Button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="safe-top sticky top-0 z-20 bg-surface/90 backdrop-blur px-5 pt-4 pb-3 border-b border-outline flex items-center gap-3">
        <button onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))} className="text-ink" disabled={submitting}>
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-lg font-semibold text-ink">{rescheduling ? 'Reschedule' : 'Book Appointment'}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 && (
          <>
            <h2 className="font-semibold text-ink mb-2">Choose a branch</h2>
            <div className="space-y-2 mb-6">
              {branches.map((b) => (
                <button
                  key={b.branch_id}
                  onClick={() => setBranchId(b.branch_id)}
                  className={`w-full text-left px-4 py-3 rounded-[var(--radius-nested)] border-[1.5px] ${
                    String(branchId) === String(b.branch_id)
                      ? 'border-primary bg-primary/5'
                      : 'border-outline bg-surface-raised'
                  }`}
                >
                  {b.branch}
                </button>
              ))}
            </div>

            {branchId && (
              <>
                <h2 className="font-semibold text-ink mb-2">Choose a doctor</h2>
                <div className="space-y-2">
                  {doctors.map((d) => (
                    <button
                      key={d.doctor_id}
                      onClick={() => setDoctorId(d.doctor_id)}
                      className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-[var(--radius-nested)] border-[1.5px] ${
                        String(doctorId) === String(d.doctor_id)
                          ? 'border-primary bg-primary/5'
                          : 'border-outline bg-surface-raised'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon name="stethoscope" className="text-primary" />
                        {d.name}
                      </span>
                      <span className="text-xs font-semibold text-ink-muted">₹{d.fee}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <Button className="mt-8" disabled={!branchId || !doctorId} onClick={() => setStep(2)}>
              Next
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-ink mb-2">Choose a date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
              {days.map((d) => {
                const dStr = toDateStr(d);
                const active = dStr === dateStr;
                // Only treat a date as "known unavailable" once we've actually
                // loaded availability for it - undefined means "not checked yet",
                // which must NOT be treated as unavailable (that would disable
                // every date for a moment on every render before data arrives).
                const isKnownUnavailable = dateAvailability[dStr] === false;
                return (
                  <button
                    key={dStr}
                    onClick={() => !isKnownUnavailable && setDate(d)}
                    disabled={isKnownUnavailable}
                    className={`shrink-0 flex flex-col items-center w-14 py-2.5 rounded-[var(--radius-nested)] border-[1.5px] transition ${
                      isKnownUnavailable
                        ? 'border-danger/30 bg-danger-bg text-danger opacity-60 cursor-not-allowed'
                        : active
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline bg-surface-raised text-ink'
                    }`}
                  >
                    <span className="text-[11px] opacity-80">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                    <span className="font-semibold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            <h2 className="font-semibold text-ink mb-2">Choose a time</h2>
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-[var(--radius-field)] bg-surface-subdued animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-ink-muted py-6 text-center">No slots scheduled on this date. Try another day.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    onClick={() => !s.booked && setTime(s.time)}
                    disabled={s.booked}
                    title={s.booked ? 'Already booked' : undefined}
                    className={`relative py-2.5 rounded-[var(--radius-field)] text-sm font-medium border-[1.5px] transition ${
                      s.booked
                        ? 'border-danger/30 bg-danger-bg text-danger/70 opacity-60 cursor-not-allowed line-through'
                        : time === s.time
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline bg-surface-raised text-ink'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <Button className="mt-8" disabled={!time} onClick={() => setStep(3)}>
              Continue
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-semibold text-ink mb-3">Review {rescheduling ? '' : '& pay'}</h2>
            <div className="bg-surface-raised border border-outline rounded-[var(--radius-card)] p-4 space-y-3 text-sm">
              <Row icon="stethoscope" label="Doctor" value={selectedDoctor?.name} />
              <Row icon="location_on" label="Branch" value={selectedBranch?.branch || rescheduling?.branch_name} />
              <Row icon="event" label="Date" value={dateStr} />
              <Row icon="schedule" label="Time" value={time.slice(0, 5)} />
            </div>

            {!rescheduling && (
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-[var(--radius-card)] px-4 py-3.5 mt-3">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Icon name="rupee" className="text-primary" />
                  Consultation fee
                </span>
                <span className="text-lg font-semibold text-primary">₹{fee ?? '--'}</span>
              </div>
            )}

            {error && <p className="text-danger text-sm bg-danger-bg rounded-[var(--radius-field)] px-3 py-2 mt-4">{error}</p>}

            {payingStatus && (
              <p className="text-xs text-ink-muted text-center mt-3">
                {payingStatus === 'creating_order' && 'Setting up payment…'}
                {payingStatus === 'awaiting_payment' && 'Complete the payment in the window above…'}
                {payingStatus === 'verifying' && 'Confirming your payment…'}
              </p>
            )}

            <Button
              className="mt-6"
              loading={submitting}
              onClick={rescheduling ? handleReschedule : handlePayAndBook}
            >
              {rescheduling ? 'Confirm Reschedule' : `Pay ₹${fee ?? ''} & Confirm`}
            </Button>

            {!rescheduling && (
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted mt-3">
                <Icon name="lock" className="text-[12px]" />
                Secured by Cashfree · Your appointment is only booked after payment succeeds
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon name={icon} className="text-primary text-[18px]" />
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
