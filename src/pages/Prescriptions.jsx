import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import TopBar from '../components/TopBar';
import { getPrescriptions } from '../api/endpoints';
import Icon from '../components/Icon';

export default function Prescriptions() {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrescriptions()
      .then((res) => setList(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = list.filter((rx) =>
    `${rx.doctor_name} ${rx.notes_preview}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppLayout>
      <TopBar title="Prescriptions" />

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 bg-surface-raised border border-outline rounded-[var(--radius-field)] px-3 py-2.5 mb-4">
          <Icon name="search" className="text-ink-muted text-[20px]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctor, condition, or medicine..."
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-success-bg text-success rounded-[var(--radius-nested)] px-3 py-2.5 mb-4">
          <Icon name="verified_user" className="text-[18px]" />
          <div className="text-xs">
            <p className="font-semibold">Verified Health Records</p>
            <p>{list.length} consultation{list.length === 1 ? '' : 's'} logged · Auto-synced</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 rounded-[var(--radius-card)] bg-surface-subdued animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">No prescriptions found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((rx) => (
              <div
                key={rx.prescription_id}
                className="bg-surface-raised border border-outline rounded-[var(--radius-card)] p-4 border-l-4 border-l-primary"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink text-sm">{rx.doctor_name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{rx.prescription_date}</p>
                  </div>
                  <span className="text-[11px] font-semibold bg-primary/10 text-primary rounded-full px-2.5 py-1">
                    {rx.record_type || 'Visit'}
                  </span>
                </div>

                <div className="bg-surface-subdued rounded-[var(--radius-nested)] mt-3 p-3">
                  <p className="text-[11px] font-semibold text-ink-muted tracking-wide">NOTES</p>
                  <p className="text-sm text-ink mt-1 line-clamp-3">{rx.notes_preview}</p>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-ink-muted">
                  <span>Fee: ₹{rx.amount} · Paid via {rx.payment_type}</span>
                </div>

                <Link
                  to={`/prescriptions/${rx.prescription_id}`}
                  className="flex items-center justify-center gap-1.5 bg-primary text-on-primary font-semibold text-sm rounded-[var(--radius-field)] py-2.5 mt-3"
                >
                  <Icon name="visibility" className="text-[16px]" />
                  View Full Prescription
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
