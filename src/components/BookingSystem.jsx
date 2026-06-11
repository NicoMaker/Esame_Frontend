import React, { useState } from "react";
import { useApp } from "../App.jsx";
import { SPACE_TYPE_LABELS } from "../data.jsx";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  MonitorPlay,
  Users,
  Briefcase,
  Building2,
  Check,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Trash2,
  X,
  List,
} from "lucide-react";

const TYPE_ICONS = { desk: MonitorPlay, meeting: Users, office: Briefcase };

const formatPrice = (n) => Number(n).toLocaleString("it-IT");
const TYPE_COLORS = {
  desk: "var(--accent)",
  meeting: "var(--violet)",
  office: "var(--emerald)",
};

function StepsBar({ current }) {
  const steps = ["Scegli Spazio", "Dati Prenotazione", "Conferma"];
  return (
    <div className="steps-bar">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <React.Fragment key={i}>
            <div className={`step ${state}`}>
              <div className="step-dot">
                {i < current ? <Check size={14} /> : i + 1}
              </div>
              <span className="step-label">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`step-line ${i < current ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Step1SelectSpace({
  spaces,
  selected,
  onSelect,
  typeFilter,
  setTypeFilter,
}) {
  const available = spaces.filter((s) => s.status === "available");
  const filtered =
    typeFilter === "all"
      ? available
      : available.filter((s) => s.type === typeFilter);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.05rem",
            marginBottom: 4,
          }}
        >
          Seleziona lo spazio
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Sono mostrati solo gli spazi attualmente disponibili
        </div>
      </div>
      <div className="filter-bar">
        {[
          { id: "all", label: "Tutti" },
          { id: "desk", label: "💻 Scrivanie" },
          { id: "meeting", label: "🤝 Sale Riunioni" },
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
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: "30px 20px" }}>
          <div className="empty-state-icon">😴</div>
          <h3>Nessuno spazio disponibile</h3>
          <p>Per questa tipologia non ci sono spazi disponibili al momento</p>
        </div>
      ) : (
        <div className="space-select-list">
          {filtered.map((space) => {
            const Icon = TYPE_ICONS[space.type] || Building2;
            const color = TYPE_COLORS[space.type];
            const isSelected = selected?.id === space.id;
            return (
              <div
                key={space.id}
                className={`space-select-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelect(space)}
              >
                <div
                  className="space-select-icon"
                  style={{ background: `${color}1a` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="space-select-info">
                  <div className="space-select-name">{space.name}</div>
                  <div className="space-select-sub">
                    {SPACE_TYPE_LABELS[space.type]} · Piano {space.floor} ·{" "}
                    {space.capacity} pers. ·{" "}
                    {(space.amenities || []).slice(0, 3).join(", ")}
                  </div>
                </div>
                <div className="space-select-rate">
                  €{formatPrice(space.hourlyRate)}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      color: "var(--text-muted)",
                    }}
                  >
                    /h
                  </span>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={13} color="white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Step2BookingForm({ form, setForm, errors, space }) {
  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.05rem",
            marginBottom: 4,
          }}
        >
          Dati Prenotazione
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Spazio selezionato:{" "}
          <strong style={{ color: "var(--accent)" }}>{space?.name}</strong> · €
          {formatPrice(space?.hourlyRate)}/h
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group full">
          <label className="form-label">Nome Cliente / Azienda *</label>
          <input
            className={`form-input ${errors.customerName ? "error" : ""}`}
            placeholder="es. Mario Rossi / Startup Srl"
            value={form.customerName}
            onChange={(e) => f("customerName", e.target.value)}
          />
          {errors.customerName && (
            <span className="form-error">{errors.customerName}</span>
          )}
        </div>
        <div className="form-group full">
          <label className="form-label">Data Prenotazione *</label>
          <input
            type="date"
            className={`form-input ${errors.date ? "error" : ""}`}
            min={today}
            value={form.date}
            onChange={(e) => f("date", e.target.value)}
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Ora Inizio *</label>
          <input
            type="time"
            className={`form-input ${errors.startTime ? "error" : ""}`}
            value={form.startTime}
            onChange={(e) => f("startTime", e.target.value)}
          />
          {errors.startTime && (
            <span className="form-error">{errors.startTime}</span>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Ora Fine *</label>
          <input
            type="time"
            className={`form-input ${errors.endTime ? "error" : ""}`}
            value={form.endTime}
            onChange={(e) => f("endTime", e.target.value)}
          />
          {errors.endTime && (
            <span className="form-error">{errors.endTime}</span>
          )}
        </div>
        <div className="form-group full">
          <label className="form-label">Note aggiuntive</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Eventuali richieste speciali, setup sala, ecc."
            value={form.notes}
            onChange={(e) => f("notes", e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>
      </div>
      {form.startTime &&
        form.endTime &&
        space &&
        (() => {
          const [sh, sm] = form.startTime.split(":").map(Number);
          const [eh, em] = form.endTime.split(":").map(Number);
          const hours = (eh * 60 + em - sh * 60 - sm) / 60;
          if (hours > 0) {
            return (
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--accent-dim)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  color: "var(--accent)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  ⏱ Durata: <strong>{hours}h</strong>
                </span>
                <span>
                  Costo stimato:{" "}
                  <strong
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                    }}
                  >
                    €{formatPrice((hours * space.hourlyRate).toFixed(2))}
                  </strong>
                </span>
              </div>
            );
          }
          return null;
        })()}
    </div>
  );
}

function Step3Confirm({ space, form }) {
  const [sh, sm] = form.startTime.split(":").map(Number);
  const [eh, em] = form.endTime.split(":").map(Number);
  const hours = (eh * 60 + em - sh * 60 - sm) / 60;
  const total = (hours * space.hourlyRate).toFixed(2);
  const dateFormatted = new Date(form.date).toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const Icon = TYPE_ICONS[space.type] || Building2;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.05rem",
            marginBottom: 4,
          }}
        >
          Riepilogo Prenotazione
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Verifica i dettagli prima di confermare
        </div>
      </div>
      <div className="confirm-card">
        <div className="confirm-header">
          <div className="confirm-icon">
            <Icon size={22} />
          </div>
          <div>
            <div className="confirm-space-name">{space.name}</div>
            <div className="confirm-space-type">
              {SPACE_TYPE_LABELS[space.type]} · Piano {space.floor}
            </div>
          </div>
          <span
            className={`badge badge-${space.type}`}
            style={{ marginLeft: "auto" }}
          >
            {SPACE_TYPE_LABELS[space.type]}
          </span>
        </div>
        <div className="confirm-detail-list">
          <div className="confirm-detail-row">
            <div
              className="confirm-detail-label"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <User size={14} /> Cliente
            </div>
            <div className="confirm-detail-value">{form.customerName}</div>
          </div>
          <div className="confirm-detail-row">
            <div
              className="confirm-detail-label"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Calendar size={14} /> Data
            </div>
            <div className="confirm-detail-value">{dateFormatted}</div>
          </div>
          <div className="confirm-detail-row">
            <div
              className="confirm-detail-label"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Clock size={14} /> Fascia Oraria
            </div>
            <div className="confirm-detail-value">
              {form.startTime} – {form.endTime} ({hours}h)
            </div>
          </div>
          <div className="confirm-detail-row">
            <div className="confirm-detail-label">Tariffa oraria</div>
            <div className="confirm-detail-value">
              €{formatPrice(space.hourlyRate)}/h
            </div>
          </div>
          {form.notes && (
            <div className="confirm-detail-row">
              <div className="confirm-detail-label">Note</div>
              <div
                className="confirm-detail-value"
                style={{
                  textAlign: "right",
                  maxWidth: "60%",
                  fontSize: "0.82rem",
                }}
              >
                {form.notes}
              </div>
            </div>
          )}
          <div className="confirm-detail-row confirm-total">
            <div className="confirm-detail-label">Totale stimato</div>
            <div className="confirm-detail-value">€{formatPrice(total)}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        La prenotazione sarà confermata immediatamente. Il cliente riceverà una
        notifica.
      </div>
    </div>
  );
}

// ─── EDIT BOOKING MODAL ────────────────────────────────────────────────────
function EditBookingModal({ booking, spaces, onClose, onSave }) {
  const today = new Date().toISOString().split("T")[0];
  const bookingDate = new Date(booking.date).toISOString().split("T")[0];

  const [form, setForm] = useState({
    customerName: booking.customerName,
    date: bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    notes: booking.notes || "",
    spaceId: booking.spaceId,
  });
  const [errors, setErrors] = useState({});

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const availableSpaces = spaces.filter(
    (s) => s.status === "available" || s.id === booking.spaceId,
  );
  const selectedSpace =
    spaces.find((s) => s.id === Number(form.spaceId)) ||
    spaces.find((s) => s.id === booking.spaceId);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Nome cliente obbligatorio";
    if (!form.date) e.date = "Data obbligatoria";
    if (!form.startTime) e.startTime = "Ora di inizio obbligatoria";
    if (!form.endTime) e.endTime = "Ora di fine obbligatoria";
    if (form.startTime && form.endTime) {
      const [sh, sm] = form.startTime.split(":").map(Number);
      const [eh, em] = form.endTime.split(":").map(Number);
      if (eh * 60 + em <= sh * 60 + sm)
        e.endTime = "L'ora di fine deve essere dopo l'inizio";
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const hours = (eh * 60 + em - sh * 60 - sm) / 60;
    const sp = selectedSpace;
    onSave(booking.id, {
      customerName: form.customerName,
      date: new Date(form.date).toISOString(),
      startTime: form.startTime,
      endTime: form.endTime,
      notes: form.notes,
      spaceId: sp.id,
      spaceName: sp.name,
      spaceType: sp.type,
      hours,
      totalCost: parseFloat((hours * sp.hourlyRate).toFixed(2)),
    });
    onClose();
  };

  const costPreview = (() => {
    if (form.startTime && form.endTime && selectedSpace) {
      const [sh, sm] = form.startTime.split(":").map(Number);
      const [eh, em] = form.endTime.split(":").map(Number);
      const h = (eh * 60 + em - sh * 60 - sm) / 60;
      if (h > 0)
        return { hours: h, cost: (h * selectedSpace.hourlyRate).toFixed(2) };
    }
    return null;
  })();

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">✏️ Modifica Prenotazione</div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: 3,
              }}
            >
              ID: {booking.id}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Spazio</label>
              <select
                className="form-select"
                value={form.spaceId}
                onChange={(e) => f("spaceId", Number(e.target.value))}
              >
                {availableSpaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — €{formatPrice(s.hourlyRate)}/h (
                    {SPACE_TYPE_LABELS[s.type]})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group full">
              <label className="form-label">Nome Cliente / Azienda *</label>
              <input
                className={`form-input ${errors.customerName ? "error" : ""}`}
                value={form.customerName}
                onChange={(e) => f("customerName", e.target.value)}
              />
              {errors.customerName && (
                <span className="form-error">{errors.customerName}</span>
              )}
            </div>
            <div className="form-group full">
              <label className="form-label">Data *</label>
              <input
                type="date"
                className={`form-input ${errors.date ? "error" : ""}`}
                min={today}
                value={form.date}
                onChange={(e) => f("date", e.target.value)}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Ora Inizio *</label>
              <input
                type="time"
                className={`form-input ${errors.startTime ? "error" : ""}`}
                value={form.startTime}
                onChange={(e) => f("startTime", e.target.value)}
              />
              {errors.startTime && (
                <span className="form-error">{errors.startTime}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Ora Fine *</label>
              <input
                type="time"
                className={`form-input ${errors.endTime ? "error" : ""}`}
                value={form.endTime}
                onChange={(e) => f("endTime", e.target.value)}
              />
              {errors.endTime && (
                <span className="form-error">{errors.endTime}</span>
              )}
            </div>
            <div className="form-group full">
              <label className="form-label">Note</label>
              <textarea
                className="form-input"
                rows={2}
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
          {costPreview && (
            <div
              style={{
                padding: "12px 16px",
                background: "var(--accent-dim)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                color: "var(--accent)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <span>
                ⏱ Durata: <strong>{costPreview.hours}h</strong>
              </span>
              <span>
                Costo:{" "}
                <strong
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                  }}
                >
                  €{formatPrice(costPreview.cost)}
                </strong>
              </span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Annulla
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Edit3 size={15} /> Salva Modifiche
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIRM DELETE MODAL ──────────────────────────────────────────────────
function ConfirmDeleteBookingModal({ booking, onClose, onConfirm }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div className="modal-title">🗑️ Elimina Prenotazione</div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>
            Sei sicuro di voler eliminare la prenotazione{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {booking.id}
            </strong>{" "}
            di{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {booking.customerName}
            </strong>
            ? Questa azione è irreversibile.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Annulla
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <Trash2 size={15} /> Elimina
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKINGS LIST PANEL ───────────────────────────────────────────────────
function BookingsList({ bookings, spaces, onEdit, onDelete, onCancel }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = bookings
    .filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (
        search &&
        !b.customerName.toLowerCase().includes(search.toLowerCase()) &&
        !b.spaceName.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          {[
            { id: "all", label: "Tutte" },
            { id: "confirmed", label: "✅ Confermate" },
            { id: "cancelled", label: "❌ Cancellate" },
          ].map((f) => (
            <button
              key={f.id}
              className={`filter-chip ${statusFilter === f.id ? "active" : ""}`}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          placeholder="Cerca cliente o spazio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            maxWidth: 200,
            padding: "6px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            fontSize: "0.82rem",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: "24px" }}>
          <div className="empty-state-icon">📋</div>
          <h3>Nessuna prenotazione trovata</h3>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Spazio</th>
                  <th>Data</th>
                  <th>Orario</th>
                  <th>Totale</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const dateStr = new Date(b.date).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const isCancelled = b.status === "cancelled";
                  return (
                    <tr key={b.id} style={{ opacity: isCancelled ? 0.6 : 1 }}>
                      <td
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          color: "var(--accent)",
                        }}
                      >
                        {b.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{b.customerName}</td>
                      <td>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: TYPE_COLORS[b.spaceType],
                              flexShrink: 0,
                            }}
                          />
                          {b.spaceName}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>{dateStr}</td>
                      <td
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {b.startTime}–{b.endTime}
                      </td>
                      <td
                        style={{
                          fontWeight: 700,
                          fontFamily: "var(--font-display)",
                          color: "var(--emerald)",
                        }}
                      >
                        €{formatPrice(b.totalCost)}
                      </td>
                      <td>
                        <span
                          className={`badge badge-${isCancelled ? "maintenance" : "available"}`}
                        >
                          <span className="badge-dot" />
                          {isCancelled ? "Cancellata" : "Confermata"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          {!isCancelled && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onEdit(b)}
                              title="Modifica"
                            >
                              <Edit3 size={12} />
                            </button>
                          )}
                          {!isCancelled && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onCancel(b.id)}
                              title="Cancella"
                            >
                              <X size={12} />
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(b)}
                            title="Elimina"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function BookingSystem() {
  const {
    spaces,
    addBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    bookings,
  } = useApp();
  const [step, setStep] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [form, setForm] = useState({
    customerName: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("new"); // "new" | "list"

  // Edit / Delete state
  const [editingBooking, setEditingBooking] = useState(null);
  const [deletingBooking, setDeletingBooking] = useState(null);

  const validateStep1 = () => selectedSpace !== null;
  const validateStep2 = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Nome cliente obbligatorio";
    if (!form.date) e.date = "Data obbligatoria";
    if (!form.startTime) e.startTime = "Ora di inizio obbligatoria";
    if (!form.endTime) e.endTime = "Ora di fine obbligatoria";
    if (form.startTime && form.endTime) {
      const [sh, sm] = form.startTime.split(":").map(Number);
      const [eh, em] = form.endTime.split(":").map(Number);
      if (eh * 60 + em <= sh * 60 + sm)
        e.endTime = "L'ora di fine deve essere dopo l'inizio";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    if (step === 2) {
      const [sh, sm] = form.startTime.split(":").map(Number);
      const [eh, em] = form.endTime.split(":").map(Number);
      const hours = (eh * 60 + em - sh * 60 - sm) / 60;
      const newBooking = addBooking({
        spaceId: selectedSpace.id,
        spaceName: selectedSpace.name,
        spaceType: selectedSpace.type,
        customerName: form.customerName,
        date: new Date(form.date).toISOString(),
        startTime: form.startTime,
        endTime: form.endTime,
        hours,
        totalCost: parseFloat((hours * selectedSpace.hourlyRate).toFixed(2)),
        notes: form.notes,
      });
      setSuccess(newBooking);
      setStep(0);
      setSelectedSpace(null);
      setForm({
        customerName: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
      return;
    }
    setStep((s) => s + 1);
  };

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Sistema di Prenotazione</div>
        <div className="page-subtitle">
          Prenota scrivanie, sale riunioni e uffici privati
        </div>
      </div>

      {success && (
        <div className="success-banner">
          <CheckCircle size={20} className="success-banner-icon" />
          <div>
            <div className="success-banner-text">
              ✅ Prenotazione {success.id} confermata con successo!
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--emerald)",
                opacity: 0.8,
                marginTop: 2,
              }}
            >
              {success.customerName} · {success.spaceName} · €
              {formatPrice(success.totalCost)}
            </div>
          </div>
          <button
            onClick={() => setSuccess(null)}
            style={{
              marginLeft: "auto",
              color: "var(--emerald)",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab switcher */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <button
          className={`filter-chip ${activeTab === "new" ? "active" : ""}`}
          onClick={() => setActiveTab("new")}
        >
          📅 Nuova Prenotazione
        </button>
        <button
          className={`filter-chip ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          <List size={13} style={{ display: "inline", marginRight: 4 }} />
          Gestisci Prenotazioni ({bookings.length})
        </button>
      </div>

      {activeTab === "new" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Wizard */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📅 Nuova Prenotazione</div>
            </div>
            <div className="card-body">
              <StepsBar current={step} />
              {step === 0 && (
                <Step1SelectSpace
                  spaces={spaces}
                  selected={selectedSpace}
                  onSelect={setSelectedSpace}
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                />
              )}
              {step === 1 && (
                <Step2BookingForm
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  space={selectedSpace}
                />
              )}
              {step === 2 && <Step3Confirm space={selectedSpace} form={form} />}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 24,
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <ArrowLeft size={15} /> Indietro
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={step === 0 && !selectedSpace}
                >
                  {step === 2 ? (
                    <>
                      <CheckCircle size={15} /> Conferma Prenotazione
                    </>
                  ) : (
                    <>
                      Avanti <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Bookings sidebar */}
          <div
            className="card"
            style={{ position: "sticky", top: "calc(var(--topbar-h) + 28px)" }}
          >
            <div className="card-header">
              <div className="card-title">🕐 Prenotazioni Recenti</div>
            </div>
            <div style={{ padding: "8px 0" }}>
              {recentBookings.map((b) => {
                const date = new Date(b.date).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "short",
                });
                return (
                  <div
                    key={b.id}
                    style={{
                      padding: "10px 18px",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: TYPE_COLORS[b.spaceType] + "1a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: TYPE_COLORS[b.spaceType],
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {b.id.replace("BK", "")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {b.customerName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginTop: 1,
                        }}
                      >
                        {b.spaceName} · {date}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginTop: 1,
                        }}
                      >
                        {b.startTime}–{b.endTime}
                      </div>
                    </div>
                    <div
                      style={{
                        color: "var(--emerald)",
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                        fontSize: "0.85rem",
                        flexShrink: 0,
                      }}
                    >
                      €{formatPrice(b.totalCost)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <BookingsList
            bookings={bookings}
            spaces={spaces}
            onEdit={setEditingBooking}
            onDelete={setDeletingBooking}
            onCancel={cancelBooking}
          />
        </div>
      )}

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          spaces={spaces}
          onClose={() => setEditingBooking(null)}
          onSave={(id, data) => {
            updateBooking(id, data);
          }}
        />
      )}

      {deletingBooking && (
        <ConfirmDeleteBookingModal
          booking={deletingBooking}
          onClose={() => setDeletingBooking(null)}
          onConfirm={() => {
            deleteBooking(deletingBooking.id);
            setDeletingBooking(null);
          }}
        />
      )}
    </div>
  );
}
