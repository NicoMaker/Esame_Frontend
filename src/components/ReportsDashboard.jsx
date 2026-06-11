import React, { useState } from "react";
import { useApp } from "../App.jsx";
import { SPACE_TYPE_LABELS } from "../data.jsx";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Clock,
  Euro,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const COLORS_PIE = ["#4f7cff", "#a855f7", "#10d9a0"];

const formatPrice = (n) => Number(n).toLocaleString("it-IT");

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      {label && <div className="label">{label}</div>}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{ color: p.color, fontSize: "0.82rem", marginTop: 2 }}
        >
          {p.name}:{" "}
          <strong>
            {p.name?.includes("€") || p.name === "Fatturato" ? "€" : ""}
            {p.value?.toLocaleString("it-IT")}
          </strong>
        </div>
      ))}
    </div>
  );
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
}

// ─── Time Navigation Controls ───────────────────────────────────────────────
function TimeNav({ mode, setMode, offset, setOffset }) {
  const modes = [
    { id: "days", label: "Giorni" },
    { id: "weeks", label: "Settimane" },
    { id: "months", label: "Mesi" },
    { id: "years", label: "Anni" },
  ];

  const getPeriodLabel = () => {
    const now = new Date();
    if (mode === "days") {
      const start = new Date(now);
      start.setDate(now.getDate() - (offset + 1) * 14 + 1);
      const end = new Date(now);
      end.setDate(now.getDate() - offset * 14);
      return `${start.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} – ${end.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}`;
    }
    if (mode === "weeks") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1 - offset * 7 * 4);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 27);
      return `${weekStart.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} – ${weekEnd.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}`;
    }
    if (mode === "months") {
      const d = new Date(now.getFullYear(), now.getMonth() - offset * 6, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() - offset * 6 + 5,
        1,
      );
      return `${d.toLocaleDateString("it-IT", { month: "long", year: "numeric" })} – ${end.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}`;
    }
    if (mode === "years") {
      const year = now.getFullYear() - offset;
      return `Anno ${year}`;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 20,
        padding: "12px 18px",
        background: "var(--surface-2, var(--bg-secondary))",
        borderRadius: 12,
        border: "1px solid var(--border)",
      }}
    >
      {/* Mode selector */}
      <div style={{ display: "flex", gap: 4 }}>
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              setOffset(0);
            }}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: mode === m.id ? "var(--accent)" : "transparent",
              color: mode === m.id ? "#fff" : "var(--text-secondary)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Navigation arrows + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginLeft: "auto",
        }}
      >
        <button
          onClick={() => setOffset((o) => o + 1)}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Periodo precedente"
        >
          <ChevronLeft size={16} />
        </button>
        <span
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--text-primary, var(--text))",
            minWidth: 200,
            textAlign: "center",
          }}
        >
          {getPeriodLabel()}
        </span>
        <button
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "transparent",
            color: offset === 0 ? "var(--text-muted)" : "var(--text-secondary)",
            cursor: offset === 0 ? "not-allowed" : "pointer",
            opacity: offset === 0 ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Periodo successivo"
        >
          <ChevronRight size={16} />
        </button>
        {offset > 0 && (
          <button
            onClick={() => setOffset(0)}
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              border: "1px solid var(--accent)",
              background: "transparent",
              color: "var(--accent)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Oggi
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReportsDashboard() {
  const { bookings, spaces } = useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cancelledFilter, setCancelledFilter] = useState(false);

  // Time navigation state
  const [chartMode, setChartMode] = useState("days"); // days | weeks | months | years
  const [chartOffset, setChartOffset] = useState(0);

  const confirmed = bookings.filter((b) => b.status === "confirmed");

  // ─── Stats ───
  const totalRevenue = confirmed.reduce((s, b) => s + b.totalCost, 0);
  const avgRevenue = confirmed.length
    ? (totalRevenue / confirmed.length).toFixed(0)
    : 0;
  const totalHours = confirmed.reduce((s, b) => s + b.hours, 0);

  // ─── Pie: type distribution ───
  const byType = ["desk", "meeting", "office"].map((type) => ({
    name: SPACE_TYPE_LABELS[type],
    value: confirmed.filter((b) => b.spaceType === type).length,
  }));

  // ─── Bar: occupancy by space ───
  const topSpaces = spaces
    .map((s) => ({
      name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
      prenotazioni: confirmed.filter((b) => b.spaceId === s.id).length,
      fatturato: confirmed
        .filter((b) => b.spaceId === s.id)
        .reduce((acc, b) => acc + b.totalCost, 0),
    }))
    .filter((s) => s.prenotazioni > 0)
    .sort((a, b) => b.prenotazioni - a.prenotazioni)
    .slice(0, 7);

  // ─── Dynamic chart data based on mode + offset ───
  const now = new Date();

  const trendData = (() => {
    if (chartMode === "days") {
      // 14 days window, offset shifts by 14 days
      return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - chartOffset * 14 - (13 - i));
        const key = d.toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "2-digit",
        });
        const dayBookings = confirmed.filter((b) => {
          const bd = new Date(b.date);
          return bd.toDateString() === d.toDateString();
        });
        return {
          label: key,
          Fatturato: dayBookings.reduce((s, b) => s + b.totalCost, 0),
          Prenotazioni: dayBookings.length,
        };
      });
    }

    if (chartMode === "weeks") {
      // 8 weeks window, offset shifts by 8 weeks
      return Array.from({ length: 8 }, (_, i) => {
        const weekIdx = chartOffset * 8 + (7 - i);
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - weekStart.getDay() + 1 - weekIdx * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekBookings = confirmed.filter((b) => {
          const bd = new Date(b.date);
          return bd >= weekStart && bd <= weekEnd;
        });
        const label = `${weekStart.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })}`;
        return {
          label,
          Fatturato: weekBookings.reduce((s, b) => s + b.totalCost, 0),
          Prenotazioni: weekBookings.length,
        };
      });
    }

    if (chartMode === "months") {
      // 6 months window, offset shifts by 6 months
      return Array.from({ length: 6 }, (_, i) => {
        const monthOffset = chartOffset * 6 + (5 - i);
        const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const nextM = new Date(
          now.getFullYear(),
          now.getMonth() - monthOffset + 1,
          1,
        );

        const monthBookings = confirmed.filter((b) => {
          const bd = new Date(b.date);
          return bd >= d && bd < nextM;
        });
        const label = d.toLocaleDateString("it-IT", {
          month: "short",
          year: "2-digit",
        });
        return {
          label,
          Fatturato: monthBookings.reduce((s, b) => s + b.totalCost, 0),
          Prenotazioni: monthBookings.length,
        };
      });
    }

    if (chartMode === "years") {
      // 3 years window, offset shifts by 1 year at a time, shown as months
      const year = now.getFullYear() - chartOffset;
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(year, i, 1);
        const nextM = new Date(year, i + 1, 1);
        const monthBookings = confirmed.filter((b) => {
          const bd = new Date(b.date);
          return bd >= d && bd < nextM;
        });
        const label = d.toLocaleDateString("it-IT", { month: "short" });
        return {
          label,
          Fatturato: monthBookings.reduce((s, b) => s + b.totalCost, 0),
          Prenotazioni: monthBookings.length,
        };
      });
    }

    return [];
  })();

  // ─── Occupancy rate ───
  const totalSlots = spaces.length * 20;
  const occupancyRate = Math.round((confirmed.length / totalSlots) * 100);

  // ─── Filtered table ───
  const tableData = [...bookings]
    .filter((b) => {
      if (!cancelledFilter && b.status === "cancelled") return false;
      if (typeFilter !== "all" && b.spaceType !== typeFilter) return false;
      if (
        search &&
        !b.customerName.toLowerCase().includes(search.toLowerCase()) &&
        !b.spaceName.toLowerCase().includes(search.toLowerCase()) &&
        !b.id.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const xInterval =
    chartMode === "years"
      ? 0
      : chartMode === "months"
        ? 0
        : chartMode === "weeks"
          ? 0
          : 1;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Reportistica & Analytics</div>
        <div className="page-subtitle">
          Analisi delle performance e andamento prenotazioni
        </div>
      </div>

      {/* KPI Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card blue">
          <div className="stat-icon blue">
            <TrendingUp size={20} />
          </div>
          <div className="stat-value">
            €{totalRevenue.toLocaleString("it-IT")}
          </div>
          <div className="stat-label">Fatturato Totale</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">
            <Calendar size={20} />
          </div>
          <div className="stat-value">{confirmed.length}</div>
          <div className="stat-label">Prenotazioni Confermate</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">
            <Clock size={20} />
          </div>
          <div className="stat-value">{totalHours}h</div>
          <div className="stat-label">Ore Totali Prenotate</div>
        </div>
        <div className="stat-card violet">
          <div className="stat-icon violet">
            <Euro size={20} />
          </div>
          <div className="stat-value">€{formatPrice(avgRevenue)}</div>
          <div className="stat-label">Valore Medio Prenotazione</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        {/* Pie: space types */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🍕 Tipologia Spazi Richiesti</div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byType}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel}
                >
                  {byType.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => (
                    <span
                      style={{ color: "var(--text-secondary)", fontSize: 12 }}
                    >
                      {v}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: top spaces */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Spazi più Prenotati</div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topSpaces}
                margin={{ top: 0, right: 10, bottom: 0, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="prenotazioni"
                  name="Prenotazioni"
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Time Navigation ─── */}
      <TimeNav
        mode={chartMode}
        setMode={setChartMode}
        offset={chartOffset}
        setOffset={setChartOffset}
      />

      {/* Line: revenue over time */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">📈 Andamento Fatturato</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Tasso di occupazione medio:{" "}
            <strong style={{ color: "var(--accent)" }}>{occupancyRate}%</strong>
          </div>
        </div>
        <div className="card-body" style={{ paddingTop: 8 }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={trendData}
              margin={{ top: 0, right: 20, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval={xInterval}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => (
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: 12 }}
                  >
                    {v}
                  </span>
                )}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Fatturato"
                stroke="var(--emerald)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Prenotazioni"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar: period comparison */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">
            📅 Confronto Periodi —{" "}
            <span
              style={{
                color: "var(--text-muted)",
                fontWeight: 400,
                fontSize: "0.85rem",
              }}
            >
              {chartMode === "days" && "per giorno"}
              {chartMode === "weeks" && "per settimana"}
              {chartMode === "months" && "per mese"}
              {chartMode === "years" && "per mese (anno selezionato)"}
            </span>
          </div>
        </div>
        <div className="card-body" style={{ paddingTop: 8 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={trendData}
              margin={{ top: 0, right: 20, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                interval={xInterval}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => (
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: 12 }}
                  >
                    {v}
                  </span>
                )}
              />
              <Bar
                dataKey="Fatturato"
                fill="var(--accent)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Prenotazioni"
                fill="var(--violet)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Elenco Cronologico Prenotazioni</div>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={cancelledFilter}
                onChange={(e) => setCancelledFilter(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              Mostra annullate
            </label>
          </div>
        </div>
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            {[
              { id: "all", label: "Tutti" },
              { id: "desk", label: "💻 Scrivanie" },
              { id: "meeting", label: "🤝 Riunioni" },
              { id: "office", label: "🏠 Uffici" },
            ].map((f) => (
              <button
                key={f.id}
                className={`filter-chip ${typeFilter === f.id ? "active" : ""}`}
                onClick={() => setTypeFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="search-wrap" style={{ marginLeft: "auto" }}>
            <Search className="search-icon" />
            <input
              className="search-input"
              placeholder="Cerca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Spazio</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Fascia Oraria</th>
                <th>Durata</th>
                <th>Importo</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "var(--text-muted)",
                    }}
                  >
                    Nessuna prenotazione trovata
                  </td>
                </tr>
              ) : (
                tableData.map((b) => {
                  const date = new Date(b.date).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <tr
                      key={b.id}
                      style={{ opacity: b.status === "cancelled" ? 0.5 : 1 }}
                    >
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            color: "var(--accent)",
                          }}
                        >
                          {b.id}
                        </span>
                      </td>
                      <td>{b.customerName}</td>
                      <td>{b.spaceName}</td>
                      <td>
                        <span className={`badge badge-${b.spaceType}`}>
                          {SPACE_TYPE_LABELS[b.spaceType]}
                        </span>
                      </td>
                      <td>{date}</td>
                      <td>
                        {b.startTime} – {b.endTime}
                      </td>
                      <td>{b.hours}h</td>
                      <td
                        style={{
                          color: "var(--emerald)",
                          fontWeight: 700,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        €{formatPrice(b.totalCost)}
                      </td>
                      <td>
                        <span className={`badge badge-${b.status}`}>
                          {b.status === "confirmed"
                            ? "Confermata"
                            : "Annullata"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid var(--border)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
          }}
        >
          {tableData.length} prenotazioni mostrate
        </div>
      </div>
    </div>
  );
}
