import React, { useState } from "react";
import { useApp } from "../App.jsx";
import { SPACE_TYPE_LABELS, STATUS_LABELS } from "../data.jsx";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Users,
  Wrench,
  CheckCircle,
  Trash2,
  Edit3,
  X,
  Building2,
  MonitorPlay,
  Briefcase,
} from "lucide-react";

const TYPE_ICONS = { desk: MonitorPlay, meeting: Users, office: Briefcase };

const formatPrice = (n) => Number(n).toLocaleString("it-IT");
const TYPE_COLORS = {
  desk: "var(--accent)",
  meeting: "var(--violet)",
  office: "var(--emerald)",
};

function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className={`badge badge-${type}`}>
      {SPACE_TYPE_LABELS[type] || type}
    </span>
  );
}

function SpaceFormModal({ onClose, onSave, initialData, title }) {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      type: "desk",
      capacity: 1,
      hourlyRate: 10,
      floor: 1,
      amenities: "",
    },
  );
  const [errors, setErrors] = useState({});

  const amenitiesStr =
    typeof form.amenities === "string"
      ? form.amenities
      : (form.amenities || []).join(", ");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nome obbligatorio";
    if (form.capacity < 1) e.capacity = "Capienza minima 1";
    if (form.hourlyRate < 1) e.hourlyRate = "Tariffa minima €1";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const amenitiesArr = amenitiesStr
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    onSave({
      ...form,
      capacity: Number(form.capacity),
      hourlyRate: Number(form.hourlyRate),
      floor: Number(form.floor),
      amenities: amenitiesArr,
    });
    onClose();
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: 3,
              }}
            >
              {initialData
                ? "Modifica i dati dello spazio"
                : "Inserisci i dati del nuovo spazio"}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Nome Spazio / Sala *</label>
              <input
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="es. Sala Pegaso, Scrivania Zeta..."
                value={form.name}
                onChange={(e) => f("name", e.target.value)}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Tipologia *</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => f("type", e.target.value)}
              >
                <option value="desk">Scrivania Dedicata</option>
                <option value="meeting">Sala Riunioni</option>
                <option value="office">Ufficio Privato</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Piano</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="10"
                value={form.floor}
                onChange={(e) => f("floor", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Capienza (persone) *</label>
              <input
                type="number"
                className={`form-input ${errors.capacity ? "error" : ""}`}
                min="1"
                value={form.capacity}
                onChange={(e) => f("capacity", e.target.value)}
              />
              {errors.capacity && (
                <span className="form-error">{errors.capacity}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Tariffa Oraria (€) *</label>
              <input
                type="number"
                className={`form-input ${errors.hourlyRate ? "error" : ""}`}
                min="1"
                value={form.hourlyRate}
                onChange={(e) => f("hourlyRate", e.target.value)}
              />
              {errors.hourlyRate && (
                <span className="form-error">{errors.hourlyRate}</span>
              )}
            </div>
            <div className="form-group full">
              <label className="form-label">
                Dotazioni (separate da virgola)
              </label>
              <input
                className="form-input"
                placeholder="es. WiFi, Proiettore, Lavagna, VC..."
                value={amenitiesStr}
                onChange={(e) => f("amenities", e.target.value)}
              />
            </div>
          </div>
          {form.hourlyRate && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
              }}
            >
              💡 Tariffa giornaliera stimata (8h):{" "}
              <strong style={{ color: "var(--accent)" }}>
                €{formatPrice((form.hourlyRate * 8).toFixed(0))}
              </strong>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Annulla
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {initialData ? (
              <>
                <Edit3 size={15} /> Salva Modifiche
              </>
            ) : (
              <>
                <Plus size={15} /> Aggiungi Spazio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ onClose, onConfirm, spaceName }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div className="modal-title">🗑️ Elimina Spazio</div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>
            Sei sicuro di voler eliminare{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {spaceName}
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

function SpaceCardGrid({ space, onStatusChange, onEdit, onDelete }) {
  const Icon = TYPE_ICONS[space.type] || Building2;
  const color = TYPE_COLORS[space.type];
  return (
    <div className="space-card">
      <div className="space-card-top">
        <div>
          <div className="space-card-type">
            {SPACE_TYPE_LABELS[space.type]} · Piano {space.floor}
          </div>
          <div className="space-card-name">{space.name}</div>
        </div>
        <StatusBadge status={space.status} />
      </div>
      <div className="space-card-meta">
        <div className="space-meta-item">
          <Users size={12} /> {space.capacity} pers.
        </div>
        <div className="space-meta-item">
          <Icon size={12} /> {SPACE_TYPE_LABELS[space.type]}
        </div>
      </div>
      <div className="amenity-tags">
        {(space.amenities || []).slice(0, 4).map((a) => (
          <span key={a} className="amenity-tag">
            {a}
          </span>
        ))}
        {(space.amenities || []).length > 4 && (
          <span className="amenity-tag">+{space.amenities.length - 4}</span>
        )}
      </div>
      <div className="space-card-rate">
        €{formatPrice(space.hourlyRate)} <span>/ora</span>
      </div>
      <div className="space-card-actions">
        {space.status !== "available" && (
          <button
            className="btn btn-success btn-sm"
            onClick={() => onStatusChange(space.id, "available")}
          >
            <CheckCircle size={13} /> Disponibile
          </button>
        )}
        {space.status !== "maintenance" && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onStatusChange(space.id, "maintenance")}
          >
            <Wrench size={13} /> Manutenzione
          </button>
        )}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(space)}
        >
          <Edit3 size={13} />
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(space)}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function SpacesManager() {
  const { spaces, addSpace, updateSpace, updateSpaceStatus, deleteSpace } =
    useApp();
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [deletingSpace, setDeletingSpace] = useState(null);

  const filtered = spaces.filter((s) => {
    if (filter !== "all" && s.type !== filter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleEdit = (space) => {
    setEditingSpace({
      ...space,
      amenities: (space.amenities || []).join(", "),
    });
  };

  const handleSaveEdit = (data) => {
    updateSpace(editingSpace.id, { ...data, status: editingSpace.status });
    setEditingSpace(null);
  };

  const handleConfirmDelete = () => {
    deleteSpace(deletingSpace.id);
    setDeletingSpace(null);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <div className="page-title">Gestione Spazi</div>
          <div className="page-subtitle">
            {spaces.length} spazi totali ·{" "}
            {spaces.filter((s) => s.status === "available").length} disponibili
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} /> Nuovo Spazio
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div className="filter-bar" style={{ marginBottom: 0, flex: 1 }}>
          {[
            { id: "all", label: "Tutti" },
            { id: "desk", label: "💻 Scrivanie" },
            { id: "meeting", label: "🤝 Sale Riunioni" },
            { id: "office", label: "🏠 Uffici" },
          ].map((f) => (
            <button
              key={f.id}
              className={`filter-chip ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <div
            style={{
              width: 1,
              height: 20,
              background: "var(--border)",
              margin: "0 4px",
            }}
          />
          {[
            { id: "all", label: "Tutti stati" },
            { id: "available", label: "✅ Disponibili" },
            { id: "maintenance", label: "🔧 Manutenzione" },
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
        <div className="search-wrap" style={{ maxWidth: 220 }}>
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Cerca spazio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${view === "grid" ? "active" : ""}`}
            onClick={() => setView("grid")}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            className={`view-toggle-btn ${view === "table" ? "active" : ""}`}
            onClick={() => setView("table")}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Nessuno spazio trovato</h3>
          <p>Prova a modificare i filtri di ricerca</p>
        </div>
      ) : view === "grid" ? (
        <div className="spaces-grid">
          {filtered.map((s) => (
            <SpaceCardGrid
              key={s.id}
              space={s}
              onStatusChange={updateSpaceStatus}
              onEdit={handleEdit}
              onDelete={setDeletingSpace}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipologia</th>
                  <th>Piano</th>
                  <th>Capienza</th>
                  <th>Tariffa/h</th>
                  <th>Dotazioni</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <TypeBadge type={s.type} />
                    </td>
                    <td>{s.floor}° piano</td>
                    <td>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Users size={12} />
                        {s.capacity}
                      </span>
                    </td>
                    <td
                      style={{
                        color: "var(--accent)",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      €{formatPrice(s.hourlyRate)}
                    </td>
                    <td>
                      <div
                        style={{ display: "flex", gap: 3, flexWrap: "wrap" }}
                      >
                        {(s.amenities || []).slice(0, 3).map((a) => (
                          <span key={a} className="amenity-tag">
                            {a}
                          </span>
                        ))}
                        {(s.amenities || []).length > 3 && (
                          <span className="amenity-tag">
                            +{s.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        {s.status !== "available" && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateSpaceStatus(s.id, "available")}
                          >
                            <CheckCircle size={12} />
                          </button>
                        )}
                        {s.status !== "maintenance" && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() =>
                              updateSpaceStatus(s.id, "maintenance")
                            }
                          >
                            <Wrench size={12} />
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(s)}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingSpace(s)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <SpaceFormModal
          title="➕ Aggiungi Spazio"
          onClose={() => setShowAddModal(false)}
          onSave={(data) => {
            addSpace(data);
          }}
        />
      )}

      {editingSpace && (
        <SpaceFormModal
          title="✏️ Modifica Spazio"
          initialData={editingSpace}
          onClose={() => setEditingSpace(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deletingSpace && (
        <ConfirmDeleteModal
          spaceName={deletingSpace.name}
          onClose={() => setDeletingSpace(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
