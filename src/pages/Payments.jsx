import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import TopBar from '../components/TopBar';
import { getPayments } from '../api/endpoints';

const STATUS_STYLES = {
  PAID: 'bg-success-bg text-success',
  PENDING: 'bg-surface-subdued text-ink-muted',
  FAILED: 'bg-danger-bg text-danger',
  EXPIRED: 'bg-danger-bg text-danger',
};

export default function Payments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayments()
      .then((res) => setList(res.data))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = list.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);

  return (
    <AppLayout>
      <TopBar title="Payments" />

      <div className="px-5 pt-4">
        <div className="bg-primary text-on-primary rounded-[var(--radius-card)] p-5 mb-5">
          <p className="text-xs opacity-80">Total paid</p>
          <p className="text-2xl font-semibold mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 rounded-[var(--radius-card)] bg-surface-subdued animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">No payments yet</div>
        ) : (
          <div className="space-y-3">
            {list.map((p) => (
              <div key={p.payment_id} className="bg-surface-raised border border-outline rounded-[var(--radius-card)] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink text-sm">{p.doctor_name || 'Consultation'}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{p.branch_name}</p>
                  </div>
                  <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${STATUS_STYLES[p.status] || STATUS_STYLES.PENDING}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-ink-muted">
                    {p.appointment_date} · {p.appointment_time?.slice(0, 5)}
                  </span>
                  <span className="font-semibold text-ink">₹{p.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
