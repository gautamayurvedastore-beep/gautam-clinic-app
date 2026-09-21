import {
  Hospital, ArrowRight, ArrowLeft, HeartPulse, FileText, FlaskConical, Siren,
  Calendar, MapPin, CalendarClock, Stethoscope, ScrollText, User, CheckCircle2,
  Search, ShieldCheck, Eye, Plus, XCircle, Pencil, Check, Clock, Zap, BadgeCheck,
  Bell, Home,
} from 'lucide-react';

// Maps the icon names used throughout the app to a bundled lucide-react
// component. Bundled (not loaded from a font CDN at runtime) so icons
// always render correctly offline / inside the native Capacitor app.
const ICONS = {
  local_hospital: Hospital,
  arrow_forward: ArrowRight,
  arrow_back: ArrowLeft,
  monitor_heart: HeartPulse,
  description: FileText,
  lab_panel: FlaskConical,
  emergency: Siren,
  event: Calendar,
  calendar_month: Calendar,
  location_on: MapPin,
  edit_calendar: CalendarClock,
  stethoscope: Stethoscope,
  history_edu: ScrollText,
  person: User,
  check_circle: CheckCircle2,
  search: Search,
  verified_user: ShieldCheck,
  verified: BadgeCheck,
  visibility: Eye,
  add: Plus,
  cancel: XCircle,
  edit: Pencil,
  check: Check,
  schedule: Clock,
  bolt: Zap,
  notifications: Bell,
  home: Home,
};

// Pulls an explicit "text-[20px]" size out of a className string, if present.
function sizeFromClassName(className = '') {
  const match = className.match(/text-\[(\d+)px\]/);
  return match ? parseInt(match[1], 10) : 20;
}

export default function Icon({ name, className = '', strokeWidth = 2, ...props }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return (
    <Cmp
      size={sizeFromClassName(className)}
      strokeWidth={strokeWidth}
      className={`inline-block shrink-0 align-middle ${className}`}
      {...props}
    />
  );
}
