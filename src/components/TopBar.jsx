import logoIcon from '../assets/logo-icon.png';

export default function TopBar({ title, right }) {
  return (
    <header className="safe-top sticky top-0 z-20 bg-surface/90 backdrop-blur px-5 pt-4 pb-3 border-b border-outline">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="" className="h-8 w-8 object-contain shrink-0" />
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
        </div>
        <div className="flex items-center gap-3">{right}</div>
      </div>
    </header>
  );
}
