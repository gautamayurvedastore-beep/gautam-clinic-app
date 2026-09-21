import BottomNav from './BottomNav';

export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <main className="flex-1 overflow-y-auto pb-4">{children}</main>
      <BottomNav />
    </div>
  );
}
