import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPrescriptionDetail } from '../api/endpoints';
import Icon from '../components/Icon';

export default function PrescriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrescriptionDetail(id)
      .then((res) => setRx(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="app-shell">
      <header className="safe-top sticky top-0 z-20 bg-surface/90 backdrop-blur px-5 pt-4 pb-3 border-b border-outline flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-ink">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-lg font-semibold text-ink">Prescription</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5">
        {loading ? (
          <div className="h-64 rounded-[var(--radius-card)] bg-surface-subdued animate-pulse" />
        ) : !rx ? (
          <p className="text-center text-ink-muted py-16">Prescription not found.</p>
        ) : (
          <div className="bg-surface-raised border border-outline rounded-[var(--radius-card)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">{rx.doctor_name}</p>
                <p className="text-xs text-ink-muted">{rx.prescription_date}</p>
              </div>
              <span className="text-[11px] font-semibold bg-primary/10 text-primary rounded-full px-2.5 py-1">
                {rx.record_type || 'Visit'}
              </span>
            </div>

            <div
              className="prose prose-sm max-w-none mt-4 bg-surface-subdued rounded-[var(--radius-nested)] p-4 text-ink"
              dangerouslySetInnerHTML={{ __html: rx.prescription_html }}
            />

            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="text-xs text-ink-muted">Fee</p>
                <p className="font-semibold">₹{rx.amount} ({rx.payment_type})</p>
              </div>
              {rx.next_visit_date && (
                <div>
                  <p className="text-xs text-ink-muted">Next visit</p>
                  <p className="font-semibold">{rx.next_visit_date}</p>
                </div>
              )}
            </div>

            {rx.remarks && (
              <div className="mt-4">
                <p className="text-xs text-ink-muted">Remarks</p>
                <p className="text-sm text-ink mt-0.5">{rx.remarks}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
