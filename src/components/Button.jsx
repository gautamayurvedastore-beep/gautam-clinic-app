export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  const base =
    'w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] px-6 py-3.5 text-[15px] font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-dark',
    secondary: 'bg-secondary text-on-secondary',
    outline: 'border-[1.5px] border-primary text-primary bg-transparent hover:bg-primary/5',
    ghost: 'text-primary bg-transparent',
    danger: 'border-[1.5px] border-danger text-danger bg-transparent',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
