import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import {
  getAppointments,
  getPrescriptions,
  cancelAppointment,
} from "../api/endpoints";
import Icon from "../components/Icon";

const QUICK_ACTIONS = [
  { icon: "monitor_heart", label: "Vitals", to: "/appointments" },
  { icon: "description", label: "Prescriptions", to: "/prescriptions" },
  { icon: "lab_panel", label: "Reports" },
  { icon: "emergency", label: "Emergency", accent: true },
];

function prettyDate(dateStr, timeStr) {
  const d = new Date(`${dateStr}T${timeStr || "00:00:00"}`);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();

  const dayLabel = sameDay(d, today)
    ? "Today"
    : sameDay(d, tomorrow)
      ? "Tomorrow"
      : d.toLocaleDateString("en-IN", { weekday: "long" });

  const time = timeStr
    ? new Date(`1970-01-01T${timeStr}`).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return `${dayLabel}, ${time}`;
}

export default function Home() {
  const { patient } = useAuth();
  const navigate = useNavigate();
  const [nextAppt, setNextAppt] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [apptRes, rxRes] = await Promise.allSettled([
      getAppointments("upcoming"),
      getPrescriptions(),
    ]);
    if (apptRes.status === "fulfilled")
      setNextAppt(apptRes.value.data[0] || null);
    if (rxRes.status === "fulfilled")
      setPrescriptions(rxRes.value.data.slice(0, 2));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel() {
    if (!nextAppt) return;
    if (!confirm("Cancel this appointment?")) return;
    await cancelAppointment(nextAppt.appointment_id);
    load();
  }

  const firstName = patient?.name?.split(" ")[0] || "there";

  return (
    <AppLayout>
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              Hi, {firstName} 👋
            </h1>
            <p className="text-ink-muted text-sm mt-0.5">
              How are you feeling today?
            </p>
          </div>
          <div className="h-11 w-11 rounded-full bg-surface-subdued flex items-center justify-center text-primary">
            <Icon name="person" />
          </div>
        </div>

        {/* Book appointment hero */}
        <button
          onClick={() => navigate("/book")}
          className="mt-5 w-full text-left relative overflow-hidden rounded-[var(--radius-card)] bg-primary text-on-primary p-5"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 rounded-full px-3 py-1">
            <Icon name="bolt" className="text-[14px]" />
            Easy Online Care
          </span>
          <h2 className="text-xl font-semibold mt-3">Book an Appointment</h2>
          <p className="text-sm text-white/80 mt-1 max-w-[220px]">
            Consult general physician or specialists in clinic or video
          </p>
          <span className="inline-flex items-center gap-1.5 bg-white text-primary font-semibold text-sm rounded-[var(--radius-field)] px-4 py-2.5 mt-4">
            Book Now <Icon name="arrow_forward" className="text-[16px]" />
          </span>
        </button>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2.5 mt-5">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to || "#"}
              className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-nested)] border border-outline py-3 ${
                a.accent ? "bg-danger-bg border-danger/20" : "bg-surface-raised"
              }`}
            >
              <Icon
                name={a.icon}
                className={a.accent ? "text-danger" : "text-primary"}
              />
              <span className="text-[11px] font-medium text-ink text-center">
                {a.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Upcoming appointment */}
        <div className="flex items-center justify-between mt-6 mb-2">
          <h3 className="font-semibold text-ink">Upcoming Appointment</h3>
          {nextAppt && (
            <span className="text-xs text-ink-muted">1 Scheduled</span>
          )}
        </div>

        {loading ? (
          <div className="h-32 rounded-[var(--radius-card)] bg-surface-subdued animate-pulse" />
        ) : nextAppt ? (
          <div className="bg-surface-raised border border-outline rounded-[var(--radius-card)] p-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-surface-subdued flex items-center justify-center text-primary">
                  <Icon name="stethoscope" className="text-[20px]" />
                </span>
                <div>
                  <p className="font-semibold text-ink text-sm">
                    {nextAppt.doctor_name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {nextAppt.branch_name}
                  </p>
                </div>
              </div>
              <StatusBadge status={nextAppt.status} />
            </div>

            <div className="bg-surface-subdued rounded-[var(--radius-nested)] mt-3 p-3 text-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <Icon name="event" className="text-[16px] text-primary" />
                {prettyDate(
                  nextAppt.appointment_date,
                  nextAppt.appointment_time,
                )}
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Icon name="location_on" className="text-[16px] text-primary" />
                {nextAppt.branch_name}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() =>
                  navigate("/book", {
                    state: { rescheduleAppointment: nextAppt },
                  })
                }
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 text-primary font-semibold text-sm rounded-[var(--radius-field)] py-2.5"
              >
                <Icon name="edit_calendar" className="text-[16px]" />
                Reschedule
              </button>
              <button
                onClick={handleCancel}
                className="text-sm font-medium text-ink-muted px-3"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface-raised border border-dashed border-outline rounded-[var(--radius-card)] p-6 text-center">
            <p className="text-sm text-ink-muted">No upcoming appointments</p>
            <Link to="/book" className="text-primary text-sm font-semibold">
              Book now
            </Link>
          </div>
        )}

        {/* Recent prescriptions */}
        <div className="flex items-center justify-between mt-6 mb-2">
          <h3 className="font-semibold text-ink">Recent Prescriptions</h3>
          <Link
            to="/prescriptions"
            className="text-xs font-semibold text-primary"
          >
            View all
          </Link>
        </div>

        <div className="space-y-2.5">
          {prescriptions.map((rx) => (
            <Link
              key={rx.prescription_id}
              to={`/prescriptions/${rx.prescription_id}`}
              className="flex items-center gap-3 bg-surface-raised border border-outline rounded-[var(--radius-nested)] p-3"
            >
              <span className="h-10 w-10 rounded-full bg-surface-subdued flex items-center justify-center text-primary shrink-0">
                <Icon name="history_edu" className="text-[18px]" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink truncate">
                  {rx.doctor_name}
                </p>
                <p className="text-xs text-ink-muted truncate">
                  {rx.notes_preview}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {rx.prescription_date}
                </p>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5 shrink-0">
                View Rx
              </span>
            </Link>
          ))}
          {!loading && prescriptions.length === 0 && (
            <p className="text-sm text-ink-muted text-center py-4">
              No prescriptions yet
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
