const STYLES = {
  Confirmed: 'bg-success-bg text-success',
  Completed: 'bg-surface-subdued text-ink-muted',
  Cancelled: 'bg-danger-bg text-danger',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.Completed;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
