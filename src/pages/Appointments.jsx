import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import TopBar from '../components/TopBar';
import StatusBadge from '../components/StatusBadge';
import { getAppointments, cancelAppointment } from '../api/endpoints';
import Icon from '../components/Icon';

const TABS = ['upcoming', 'past', 'all'];

export default function Appointments() {
  const [tab, setTab] = useState('upcoming');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load(filter) {
    setLoading(true);
    try {
      const res = await getAppointments(filter);
      setList(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  async function handleCancel(id) {
    if (!confirm('Cancel this appointment?')) return;
    await cancelAppointment(id);
    load(tab);
  }

  return (
    <AppLayout>
      <TopBar title="Appointments" />

      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">My Appointments</h2>
            <p className="text-xs text-ink-muted">Keep track of your health consultations & visits</p>
          </div>
          <button
            onClick={() => navigate('/book')}
            className="h-11 w-11 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0"
          >
            <Icon name="add" />
          </button>
        </div>

        <div className="flex gap-2 bg-surface-subdued rounded-[var(--radius-field)] p-1 mb-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-[calc(var(--radius-field)-2px)] text-sm font-semibold capitalize transition ${
                tab === t ? 'bg-surface-raised text-primary shadow-sm' : 'text-ink-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-28 rounded-[var(--radius-card)] bg-surface-subdued animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">
            No {tab !== 'all' ? tab : ''} appointments
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((a) => (
              <div
                key={a.appointment_id}
                className={`bg-surface-raised border border-outline rounded-[var(--radius-card)] p-4 ${
                  tab === 'upcoming' ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink">{a.doctor_name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{a.branch_name}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="bg-surface-subdued rounded-[var(--radius-nested)] mt-3 p-3 text-sm space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon name="event" className="text-[16px] text-primary" />
                    {a.appointment_date} at{' '}
                    {new Date(`1970-01-01T${a.appointment_time}`).toLocaleTimeString('en-IN', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {a.status !== 'Cancelled' && tab !== 'past' && (
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => navigate('/book', { state: { rescheduleAppointment: a } })}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary font-semibold text-sm rounded-[var(--radius-field)] py-2.5"
                    >
                      <Icon name="edit_calendar" className="text-[16px]" />
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(a.appointment_id)}
                      className="flex-1 flex items-center justify-center gap-1.5 border-[1.5px] border-danger text-danger font-semibold text-sm rounded-[var(--radius-field)] py-2.5"
                    >
                      <Icon name="cancel" className="text-[16px]" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
