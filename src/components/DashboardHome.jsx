import React from "react";
import { useApp } from "../App.jsx";
import {
  Building2,
  CalendarCheck,
  TrendingUp,
  Users,
  ArrowUpRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { SPACE_TYPE_LABELS } from "../data.jsx";

const formatPrice = (n) => Number(n).toLocaleString("it-IT");

function StatCard({ icon: Icon, label, value, delta, color, prefix = "" }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
      <div className="stat-value">
        {prefix}
        {value}
      </div>
      <div className="stat-label">{label}</div>
      {delta && (
        <div className={`stat-delta ${delta.up ? "up" : "down"}`}>
          <ArrowUpRight
            size={12}
            style={{ transform: delta.up ? "none" : "rotate(90deg)" }}
          />
          {delta.text}
        </div>
      )}
    </div>
  );
}

function RecentBookingRow({ booking }) {
  const date = new Date(booking.date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{booking.id}</div>
      </td>
      <td>{booking.customerName}</td>
      <td>{booking.spaceName}</td>
      <td>
        <span className={`badge badge-${booking.spaceType}`}>
          {SPACE_TYPE_LABELS[booking.spaceType]}
        </span>
      </td>
      <td style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Clock size={12} style={{ color: "var(--text-muted)" }} />
        {date} · {booking.startTime}–{booking.endTime}
      </td>
      <td
        style={{
          color: "var(--emerald)",
          fontWeight: 700,
          fontFamily: "var(--font-display)",
        }}
      >
        €{formatPrice(booking.totalCost)}
      </td>
      <td>
        <span className={`badge badge-${booking.status}`}>
          {booking.status === "confirmed" ? "Confermata" : "Annullata"}
        </span>
      </td>
    </tr>
  );
}

export default function DashboardHome() {
  const { spaces, bookings, setCurrentPage } = useApp();

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((s, b) => s + b.totalCost, 0);
  const availableSpaces = spaces.filter((s) => s.status === "available").length;
  const maintenanceSpaces = spaces.filter(
    (s) => s.status === "maintenance",
  ).length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;

  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const quickActions = [
    {
      label: "Gestisci Spazi",
      icon: Building2,
      page: "spaces",
      color: "var(--accent)",
    },
    {
      label: "Nuova Prenotazione",
      icon: CalendarCheck,
      page: "booking",
      color: "var(--emerald)",
    },
    {
      label: "Vedi Report",
      icon: TrendingUp,
      page: "reports",
      color: "var(--violet)",
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Dashboard 👋</div>
        <div className="page-subtitle">
          Benvenuto nel pannello di controllo CoWork Hub.
        </div>
      </div>

      {maintenanceSpaces > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            background: "var(--amber-dim)",
            border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: "var(--radius-md)",
            marginBottom: 20,
            fontSize: "0.85rem",
            color: "var(--amber)",
          }}
        >
          <AlertTriangle size={16} />
          <strong>{maintenanceSpaces} spazi</strong> attualmente in manutenzione
          richiedono attenzione.
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon={Building2}
          label="Spazi Disponibili"
          value={availableSpaces}
          color="blue"
          delta={{ up: true, text: `${spaces.length} totali` }}
        />
        <StatCard
          icon={CalendarCheck}
          label="Prenotazioni Attive"
          value={confirmedBookings}
          color="green"
          delta={{ up: true, text: "in crescita" }}
        />
        <StatCard
          icon={TrendingUp}
          label="Fatturato Totale"
          value={totalRevenue.toLocaleString("it-IT")}
          prefix="€"
          color="amber"
          delta={{ up: true, text: "+12% vs mese scorso" }}
        />
        <StatCard
          icon={Users}
          label="Spazi Totali"
          value={spaces.length}
          color="violet"
          delta={{ up: false, text: `${maintenanceSpaces} in manutenzione` }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚡ Azioni Rapide</div>
          </div>
          <div
            className="card-body"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.page}
                  onClick={() => setCurrentPage(action.page)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-body)",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-elevated)";
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${action.color}1a`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} style={{ color: action.color }} />
                  </div>
                  {action.label}
                  <ArrowUpRight
                    size={14}
                    style={{ marginLeft: "auto", color: "var(--text-muted)" }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Space breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏢 Stato Spazi</div>
          </div>
          <div className="card-body">
            {["desk", "meeting", "office"].map((type) => {
              const typeSpaces = spaces.filter((s) => s.type === type);
              const avail = typeSpaces.filter(
                (s) => s.status === "available",
              ).length;
              const pct = typeSpaces.length
                ? Math.round((avail / typeSpaces.length) * 100)
                : 0;
              const colors = {
                desk: "var(--accent)",
                meeting: "var(--violet)",
                office: "var(--emerald)",
              };
              const icons = { desk: "💻", meeting: "🤝", office: "🏠" };
              return (
                <div key={type} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      <span>{icons[type]}</span>
                      {SPACE_TYPE_LABELS[type]}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {avail}/{typeSpaces.length} disponibili ·{" "}
                      <span style={{ color: colors[type], fontWeight: 700 }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--bg-elevated)",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: colors[type],
                        borderRadius: 10,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Prenotazioni Recenti</div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentPage("reports")}
          >
            Vedi tutte <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Spazio</th>
                <th>Tipo</th>
                <th>Data & Ora</th>
                <th>Importo</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <RecentBookingRow key={b.id} booking={b} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
