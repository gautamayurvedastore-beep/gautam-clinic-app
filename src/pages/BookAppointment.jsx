import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import {
  getBranches,
  getDoctors,
  getAvailableSlots,
  bookAppointment,
  rescheduleAppointment,
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

export default function BookAppointment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rescheduling = state?.rescheduleAppointment;

  const [step, setStep] = useState(rescheduling ? 2 : 1);
  const [branches, setBranches] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [branchId, setBranchId] = useState(rescheduling?.branch_id || '');
  const [doctorId, setDoctorId] = useState(rescheduling?.doctor_id || '');
  const [date, setDate] = useState(nextDays(14)[0]);
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const days = useMemo(() => nextDays(14), []);
  const dateStr = date.toISOString().slice(0, 10);

  useEffect(() => {
    getBranches().then((res) => setBranches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!branchId) return;
    getDoctors(branchId).then((res) => setDoctors(res.data)).catch(() => {});
  }, [branchId]);

  useEffect(() => {
    if (step !== 2 || !branchId || !dateStr) return;
    setLoadingSlots(true);
    setTime('');
    getAvailableSlots(branchId, dateStr, doctorId || undefined)
      .then((res) => setSlots(res.doctors?.[0]?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [step, branchId, dateStr, doctorId]);

  async function handleConfirm() {
    setSubmitting(true);
    setError('');
    try {
      if (rescheduling) {
        await rescheduleAppointment(rescheduling.appointment_id, dateStr, time);
      } else {
        await bookAppointment({ doctor_id: doctorId, branch_id: branchId, appointment_date: dateStr, appointment_time: time });
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not complete booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedBranch = branches.find((b) => String(b.branch_id) === String(branchId));
  const selectedDoctor = doctors.find((d) => String(d.doctor_id) === String(doctorId)) || {
    name: rescheduling?.doctor_name,
  };

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
          {selectedDoctor?.name} · {dateStr} · {time && time.slice(0, 5)}
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
        <button onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))} className="text-ink">
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
                      className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-[var(--radius-nested)] border-[1.5px] ${
                        String(doctorId) === String(d.doctor_id)
                          ? 'border-primary bg-primary/5'
                          : 'border-outline bg-surface-raised'
                      }`}
                    >
                      <Icon name="stethoscope" className="text-primary" />
                      {d.name}
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
                const active = d.toDateString() === date.toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setDate(d)}
                    className={`shrink-0 flex flex-col items-center w-14 py-2.5 rounded-[var(--radius-nested)] border-[1.5px] ${
                      active ? 'border-primary bg-primary text-on-primary' : 'border-outline bg-surface-raised text-ink'
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
              <p className="text-sm text-ink-muted py-6 text-center">No free slots on this date. Try another day.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    onClick={() => setTime(s.time)}
                    className={`py-2.5 rounded-[var(--radius-field)] text-sm font-medium border-[1.5px] ${
                      time === s.time ? 'border-primary bg-primary text-on-primary' : 'border-outline bg-surface-raised text-ink'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <Button className="mt-8" disabled={!time} onClick={() => setStep(3)}>
              Confirm Slot
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-semibold text-ink mb-3">Review & confirm</h2>
            <div className="bg-surface-raised border border-outline rounded-[var(--radius-card)] p-4 space-y-3 text-sm">
              <Row icon="stethoscope" label="Doctor" value={selectedDoctor?.name} />
              <Row icon="location_on" label="Branch" value={selectedBranch?.branch || rescheduling?.branch_name} />
              <Row icon="event" label="Date" value={dateStr} />
              <Row icon="schedule" label="Time" value={time.slice(0, 5)} />
            </div>

            {error && <p className="text-danger text-sm bg-danger-bg rounded-[var(--radius-field)] px-3 py-2 mt-4">{error}</p>}

            <Button className="mt-8" loading={submitting} onClick={handleConfirm}>
              {rescheduling ? 'Confirm Reschedule' : 'Confirm Appointment'}
            </Button>
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
