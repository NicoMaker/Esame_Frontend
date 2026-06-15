const DB = {
  venues: [],
  events: [],
  bookings: [],
};

let eventsSortKey = "date";
let eventsSortDir = 1;
let bookingsSortKey = "date";
let bookingsSortDir = -1;
let editingEventId = null;

let wizardStep = 0;
let wizardData = { eventId: null, user: {}, quantity: 1 };

let charts = {};

async function init() {
  const res = await fetch("db.json");
  const data = await res.json();
  DB.venues = data.venues;
  DB.events = data.events;
  DB.bookings = data.bookings;
  renderAll();
}

function renderAll() {
  renderOverview();
  renderEventsTable();
  renderBookingsTable();
  renderReports();
}

function navigate(view, el) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + view).classList.add("active");
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  el.classList.add("active");

  const titles = {
    overview: ["Overview", "— Tutte le strutture"],
    events: ["Gestione Eventi", "— CRUD & Ordinamento"],
    bookings: ["Prenotazioni", "— Nuove registrazioni"],
    reports: ["Reportistica", "— Analytics & Grafici"],
  };

  document.getElementById("topbar-title").textContent = titles[view][0];
  document.getElementById("topbar-sub").textContent = titles[view][1];

  if (view === "reports") setTimeout(() => renderCharts(), 100);
}

const getVenue = (id) => DB.venues.find((v) => v.id === id);
const getEvent = (id) => DB.events.find((e) => e.id === id);

function venueBadge(venueId) {
  const map = {
    "rock-arena": ["badge-rock", "RockArena"],
    techcon: ["badge-tech", "TechCon"],
    "summer-pavilion": ["badge-ibiza", "Summer Beat"],
  };
  const [cls, label] = map[venueId] || ["badge-gray", venueId];
  return `<span class="badge ${cls}">${label}</span>`;
}

function typeBadge(type) {
  const map = {
    Festival: "badge-purple",
    Concerto: "badge-rock",
    "DJ Set": "badge-ibiza",
    Summit: "badge-tech",
    Conferenza: "badge-tech",
    Forum: "badge-tech",
    Workshop: "badge-green",
  };
  return `<span class="badge ${map[type] || "badge-gray"}">${type}</span>`;
}

function statusBadge(s) {
  return s === "confirmed"
    ? `<span class="badge badge-green">Confermato</span>`
    : `<span class="badge badge-yellow"> In attesa</span>`;
}

function fillBar(sold, capacity, color) {
  const pct = Math.min(100, Math.round((sold / capacity) * 100));
  const clr = pct > 90 ? "#E63946" : pct > 70 ? "#f4a261" : "#06d6a0";
  return `<div class="fill-bar"><div class="fill-bar-inner" style="width:${pct}%;background:${clr}"></div></div><span class="text-xs text-muted mono" style="margin-top:3px;display:block">${pct}%</span>`;
}

function fmtDate(d) {
  if (!d) return "—";
  const [y, m, g] = d.split("-");
  const months = [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ];
  return `${g} ${months[+m - 1]} ${y}`;
}

const fmtMoney = (n) =>
  "€ " + Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2 });

function renderOverview() {
  const totalEvents = DB.events.length;
  const totalBookings = DB.bookings.length;
  const totalRevenue = DB.bookings.reduce((s, b) => s + b.total, 0);
  const totalSold = DB.events.reduce((s, e) => s + e.sold, 0);

  document.getElementById("kpi-cards").innerHTML = `
    <div class="stat-card rock">
      <div class="stat-label">Strutture Attive</div>
      <div class="stat-value">${DB.venues.length}</div>
      <div class="stat-sub">3 location in Europa</div>
    </div>
    <div class="stat-card tech">
      <div class="stat-label">Eventi in Programma</div>
      <div class="stat-value">${totalEvents}</div>
      <div class="stat-sub">Stagione 2025–2026</div>
    </div>
    <div class="stat-card ibiza">
      <div class="stat-label">Biglietti Venduti</div>
      <div class="stat-value">${totalSold.toLocaleString("it-IT")}</div>
      <div class="stat-sub">Su tutti gli eventi</div>
    </div>
    <div class="stat-card green">
      <div class="stat-label">Costo Totale</div>
      <div class="stat-value" style="font-size:22px">${fmtMoney(totalRevenue)}</div>
      <div class="stat-sub">Prenotazioni confermate</div>
    </div>
  `;

  document.getElementById("venue-cards").innerHTML = DB.venues
    .map((v) => {
      const vEvents = DB.events.filter((e) => e.venueId === v.id);
      const vSold = vEvents.reduce((s, e) => s + e.sold, 0);
      const vCap = vEvents.reduce((s, e) => s + e.capacity, 0);
      const pct = vCap ? Math.round((vSold / vCap) * 100) : 0;
      return `
      <div class="venue-card">
        <div class="venue-card-top" style="background:linear-gradient(135deg,${v.color}22,${v.color}44)">
          <span style="font-size:28px">${v.name}</span>
        </div>
        <div class="venue-card-body">
          <div class="venue-card-city">${v.city}</div>
          <div class="venue-card-stat">${vEvents.length} eventi · Cap. ${v.capacity.toLocaleString("it-IT")} · ${pct}% occupazione</div>
          <div class="fill-bar mt-8"><div class="fill-bar-inner" style="width:${pct}%;background:${v.color}"></div></div>
        </div>
      </div>`;
    })
    .join("");

  const upcoming = [...DB.events]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);
  document.getElementById("upcoming-count").textContent =
    upcoming.length + " eventi";
  document.getElementById("overview-table").innerHTML = upcoming
    .map(
      (e) => `
    <tr>
      <td><strong>${e.name}</strong><br><span class="text-xs text-muted">${typeBadge(e.type)}</span></td>
      <td>${venueBadge(e.venueId)}</td>
      <td class="mono text-sm">${fmtDate(e.date)}</td>
      <td>${fillBar(e.sold, e.capacity)}</td>
      <td class="mono">${e.sold.toLocaleString("it-IT")} / ${e.capacity.toLocaleString("it-IT")}</td>
      <td><span class="badge badge-green">Attivo</span></td>
    </tr>
  `,
    )
    .join("");
}

function renderEventsTable() {
  const search = (
    document.getElementById("events-search")?.value || ""
  ).toLowerCase();
  const venueFilter =
    document.getElementById("events-venue-filter")?.value || "";

  let data = DB.events.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search) ||
      e.type.toLowerCase().includes(search);
    const matchVenue = !venueFilter || e.venueId === venueFilter;
    return matchSearch && matchVenue;
  });

  data.sort((a, b) => {
    let av = a[eventsSortKey],
      bv = b[eventsSortKey];
    if (typeof av === "string") return av.localeCompare(bv) * eventsSortDir;
    return (av - bv) * eventsSortDir;
  });

  document.getElementById("events-count").textContent = data.length + " eventi";
  document.getElementById("events-table").innerHTML = data.length
    ? data
        .map(
          (e) => `
    <tr>
      <td><strong>${e.name}</strong></td>
      <td>${venueBadge(e.venueId)}</td>
      <td class="mono text-sm">${fmtDate(e.date)}</td>
      <td class="mono">${e.capacity.toLocaleString("it-IT")}</td>
      <td class="mono">${e.sold.toLocaleString("it-IT")}</td>
      <td class="mono">${fmtMoney(e.priceBase)}</td>
      <td>${fillBar(e.sold, e.capacity)}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm" onclick="openEventModal('${e.id}')">update</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEvent('${e.id}')">delete</button>
        </div>
      </td>
    </tr>
  `,
        )
        .join("")
    : `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">Nessun evento trovato</div><div class="empty-state-sub">Modifica i filtri o aggiungi un nuovo evento</div></div></td></tr>`;
}

function sortEvents(key) {
  if (eventsSortKey === key) eventsSortDir *= -1;
  else {
    eventsSortKey = key;
    eventsSortDir = 1;
  }
  document
    .querySelectorAll('[id^="sort-"]')
    .forEach((el) => (el.textContent = "↕"));
  const el = document.getElementById("sort-" + key);
  if (el) {
    el.textContent = eventsSortDir === 1 ? "↑" : "↓";
    el.parentElement.classList.add("sorted");
  }
  renderEventsTable();
}

function openEventModal(id = null) {
  editingEventId = id;
  document.getElementById("event-modal-title").textContent = id
    ? "Modifica Evento"
    : "Nuovo Evento";
  clearEventForm();
  if (id) {
    const e = getEvent(id);
    if (e) {
      document.getElementById("evt-name").value = e.name;
      document.getElementById("evt-venue").value = e.venueId;
      document.getElementById("evt-type").value = e.type;
      document.getElementById("evt-date").value = e.date;
      document.getElementById("evt-capacity").value = e.capacity;
      document.getElementById("evt-sold").value = e.sold;
      document.getElementById("evt-price").value = e.priceBase;
    }
  }
  document.getElementById("event-modal").classList.add("open");
}

function clearEventForm() {
  [
    "evt-name",
    "evt-venue",
    "evt-type",
    "evt-date",
    "evt-capacity",
    "evt-sold",
    "evt-price",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = "";
      el.classList.remove("error");
    }
  });
  [
    "err-evt-name",
    "err-evt-venue",
    "err-evt-type",
    "err-evt-date",
    "err-evt-capacity",
    "err-evt-price",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

function validateEvent() {
  let valid = true;
  const rules = [
    [
      "evt-name",
      "err-evt-name",
      (v) => v.trim().length >= 3,
      "Inserisci un nome di almeno 3 caratteri",
    ],
    ["evt-venue", "err-evt-venue", (v) => v !== "", "Seleziona una struttura"],
    [
      "evt-type",
      "err-evt-type",
      (v) => v !== "",
      "Seleziona un tipo di evento",
    ],
    ["evt-date", "err-evt-date", (v) => v !== "", "Inserisci una data valida"],
    [
      "evt-capacity",
      "err-evt-capacity",
      (v) => parseInt(v) > 0,
      "La capienza deve essere positiva",
    ],
    [
      "evt-price",
      "err-evt-price",
      (v) => parseFloat(v) > 0,
      "Il prezzo deve essere positivo",
    ],
  ];
  rules.forEach(([field, errField, check, msg]) => {
    const val = document.getElementById(field)?.value || "";
    const errEl = document.getElementById(errField);
    const inputEl = document.getElementById(field);
    if (!check(val)) {
      if (errEl) errEl.textContent = msg;
      if (inputEl) inputEl.classList.add("error");
      valid = false;
    } else {
      if (errEl) errEl.textContent = "";
      if (inputEl) inputEl.classList.remove("error");
    }
  });

  const sold = parseInt(document.getElementById("evt-sold")?.value || "0");
  const cap = parseInt(document.getElementById("evt-capacity")?.value || "0");
  if (sold > cap) {
    document.getElementById("err-evt-capacity").textContent =
      "I venduti non possono superare la capienza";
    document.getElementById("evt-sold").classList.add("error");
    valid = false;
  }

  return valid;
}

function saveEvent() {
  if (!validateEvent()) return;
  const data = {
    name: document.getElementById("evt-name").value.trim(),
    venueId: document.getElementById("evt-venue").value,
    type: document.getElementById("evt-type").value,
    date: document.getElementById("evt-date").value,
    capacity: parseInt(document.getElementById("evt-capacity").value),
    sold: parseInt(document.getElementById("evt-sold").value || "0"),
    priceBase: parseFloat(document.getElementById("evt-price").value),
    status: "active",
  };

  if (editingEventId) {
    const idx = DB.events.findIndex((e) => e.id === editingEventId);
    if (idx > -1) DB.events[idx] = { ...DB.events[idx], ...data };
    toast("Evento aggiornato con successo", "success");
  } else {
    DB.events.push({ id: "evt-" + Date.now(), ...data });
    toast("Evento creato con successo", "success");
  }

  closeModal("event-modal");
  renderEventsTable();
  renderOverview();
}

function deleteEvent(id) {
  if (!confirm("Eliminare definitivamente questo evento?")) return;
  DB.events = DB.events.filter((e) => e.id !== id);
  DB.bookings = DB.bookings.filter((b) => b.eventId !== id);
  renderEventsTable();
  renderOverview();
  renderBookingsTable();
  toast("Evento eliminato", "error");
}

function renderBookingsTable() {
  const search = (
    document.getElementById("bookings-search")?.value || ""
  ).toLowerCase();
  const statusFilter =
    document.getElementById("bookings-status-filter")?.value || "";

  let data = DB.bookings.filter((b) => {
    const evt = getEvent(b.eventId);
    const name =
      `${b.firstName} ${b.lastName} ${evt?.name || ""}`.toLowerCase();
    return (
      name.includes(search) && (!statusFilter || b.status === statusFilter)
    );
  });

  data.sort((a, b) => {
    let av = a[bookingsSortKey],
      bv = b[bookingsSortKey];
    if (typeof av === "string") return av.localeCompare(bv) * bookingsSortDir;
    return (av - bv) * bookingsSortDir;
  });

  document.getElementById("bookings-count").textContent =
    data.length + " prenotazioni";
  document.getElementById("bookings-table").innerHTML = data.length
    ? data
        .map((b) => {
          const evt = getEvent(b.eventId);
          return `
      <tr>
        <td class="mono text-xs text-muted">${b.id}</td>
        <td><strong>${b.lastName}</strong>, ${b.firstName}<br><span class="text-xs text-muted">${b.email}</span></td>
        <td>${evt ? `<strong>${evt.name}</strong><br><span class="text-xs">${venueBadge(evt.venueId)}</span>` : "—"}</td>
        <td class="mono text-sm">${fmtDate(b.date)}</td>
        <td class="mono text-center">${b.quantity}</td>
        <td>${b.discount > 0 ? `<span class="discount-tag">-${b.discount}%</span>` : '<span class="text-muted text-xs">—</span>'}</td>
        <td class="mono">${fmtMoney(b.total)}</td>
        <td>${statusBadge(b.status)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteBooking('${b.id}')">delete</button>
        </td>
      </tr>`;
        })
        .join("")
    : `<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon"></div><div class="empty-state-title">Nessuna prenotazione</div><div class="empty-state-sub">Crea una nuova prenotazione con il pulsante in alto</div></div></td></tr>`;
}

function sortBookings(key) {
  if (bookingsSortKey === key) bookingsSortDir *= -1;
  else {
    bookingsSortKey = key;
    bookingsSortDir = 1;
  }
  renderBookingsTable();
}

function deleteBooking(id) {
  if (!confirm("Eliminare questa prenotazione?")) return;
  DB.bookings = DB.bookings.filter((b) => b.id !== id);
  renderBookingsTable();
  renderOverview();
  toast("Prenotazione eliminata", "error");
}

function openBookingWizard() {
  wizardStep = 0;
  wizardData = { eventId: null, user: {}, quantity: 1 };
  document.getElementById("booking-modal").classList.add("open");
  renderWizard();
}

function renderWizardSteps() {
  const steps = ["Seleziona Evento", "Dati Utente", "Riepilogo"];
  return steps
    .map((s, i) => {
      const cls = i < wizardStep ? "done" : i === wizardStep ? "active" : "";
      const icon = i < wizardStep ? "✓" : i + 1;
      return `
      <div class="step-item ${cls}">
        <div class="step-num">${icon}</div>
        <div class="step-label">${s}</div>
        ${i < steps.length - 1 ? '<div class="step-line"></div>' : ""}
      </div>`;
    })
    .join("");
}

function renderWizard() {
  document.getElementById("wizard-steps").innerHTML = renderWizardSteps();

  if (wizardStep === 0) renderWizardStep0();
  else if (wizardStep === 1) renderWizardStep1();
  else renderWizardStep2();
}

function renderWizardStep0() {
  document.getElementById("wizard-content").innerHTML = `
    <div class="mb-16">
      <label>Seleziona evento *</label>
      <select id="wiz-event" style="margin-bottom:0" onchange="updateWizEvent()">
        <option value="">— Scegli un evento —</option>
        ${DB.events
          .map((e) => {
            const v = getVenue(e.venueId);
            const pct = Math.round((e.sold / e.capacity) * 100);
            const avail = e.capacity - e.sold;
            return `<option value="${e.id}" ${avail === 0 ? "disabled" : ""} ${e.id === wizardData.eventId ? "selected" : ""}>
            ${e.name} — ${v?.city || ""} | ${fmtDate(e.date)} | Disp: ${avail.toLocaleString("it-IT")}
          </option>`;
          })
          .join("")}
      </select>
      <div class="field-error" id="err-wiz-event"></div>
    </div>
    <div id="wiz-event-preview"></div>
    <div class="flex justify-between mt-16">
      <button class="btn btn-secondary" onclick="closeModal('booking-modal')">Annulla</button>
      <button class="btn btn-primary" onclick="wizNext0()">Avanti →</button>
    </div>
  `;
  if (wizardData.eventId) updateWizEvent();
}

function updateWizEvent() {
  const id = document.getElementById("wiz-event")?.value;
  wizardData.eventId = id;
  const prev = document.getElementById("wiz-event-preview");
  if (!id || !prev) return;
  const e = getEvent(id);
  if (!e) return;
  const v = getVenue(e.venueId);
  const avail = e.capacity - e.sold;
  prev.innerHTML = `
    <div class="recap-box">
      <div class="recap-row"><span class="recap-label">Evento</span><span class="recap-value">${e.name}</span></div>
      <div class="recap-row"><span class="recap-label">Struttura</span>${venueBadge(e.venueId)}</div>
      <div class="recap-row"><span class="recap-label">Data</span><span class="recap-value mono">${fmtDate(e.date)}</span></div>
      <div class="recap-row"><span class="recap-label">Prezzo unitario</span><span class="recap-value">${fmtMoney(e.priceBase)}</span></div>
      <div class="recap-row"><span class="recap-label">Posti disponibili</span><span class="recap-value">${avail.toLocaleString("it-IT")}</span></div>
    </div>`;
}

function wizNext0() {
  if (!wizardData.eventId) {
    document.getElementById("err-wiz-event").textContent =
      "Seleziona un evento per continuare";
    return;
  }
  wizardStep = 1;
  renderWizard();
}

function renderWizardStep1() {
  const u = wizardData.user;
  document.getElementById("wizard-content").innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Nome *</label>
        <input type="text" id="wiz-fname" value="${u.firstName || ""}" placeholder="Mario" />
        <div class="field-error" id="err-wiz-fname"></div>
      </div>
      <div class="form-group">
        <label>Cognome *</label>
        <input type="text" id="wiz-lname" value="${u.lastName || ""}" placeholder="Rossi" />
        <div class="field-error" id="err-wiz-lname"></div>
      </div>
      <div class="form-group full">
        <label>Email *</label>
        <input type="email" id="wiz-email" value="${u.email || ""}" placeholder="mario.rossi@email.com" />
        <div class="field-error" id="err-wiz-email"></div>
      </div>
      <div class="form-group">
        <label>Telefono *</label>
        <input type="tel" id="wiz-phone" value="${u.phone || ""}" placeholder="+39 333 1234567" />
        <div class="field-error" id="err-wiz-phone"></div>
      </div>
      <div class="form-group">
        <label>Numero posti *</label>
        <input type="number" id="wiz-qty" value="${wizardData.quantity}" min="1" max="20" />
        <div class="field-error" id="err-wiz-qty"></div>
      </div>
      <div class="form-group full">
        <label>Data prenotazione *</label>
        <input type="date" id="wiz-bdate" value="${u.bookingDate || new Date().toISOString().split("T")[0]}" />
        <div class="field-error" id="err-wiz-bdate"></div>
      </div>
    </div>
    <div class="flex justify-between mt-16">
      <button class="btn btn-secondary" onclick="wizBack()">← Indietro</button>
      <button class="btn btn-primary" onclick="wizNext1()">Avanti →</button>
    </div>
  `;
}

function wizNext1() {
  let valid = true;
  const rules = [
    [
      "wiz-fname",
      "err-wiz-fname",
      (v) => v.trim().length >= 2,
      "Inserisci il nome (min 2 caratteri)",
    ],
    [
      "wiz-lname",
      "err-wiz-lname",
      (v) => v.trim().length >= 2,
      "Inserisci il cognome (min 2 caratteri)",
    ],
    [
      "wiz-email",
      "err-wiz-email",
      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Email non valida",
    ],
    [
      "wiz-phone",
      "err-wiz-phone",
      (v) => v.trim().length >= 6,
      "Numero di telefono non valido",
    ],
    [
      "wiz-qty",
      "err-wiz-qty",
      (v) => parseInt(v) > 0 && parseInt(v) <= 20,
      "Posti tra 1 e 20",
    ],
    [
      "wiz-bdate",
      "err-wiz-bdate",
      (v) => v !== "",
      "Inserisci la data di prenotazione",
    ],
  ];

  rules.forEach(([field, errField, check, msg]) => {
    const val = document.getElementById(field)?.value || "";
    const errEl = document.getElementById(errField);
    const inputEl = document.getElementById(field);
    if (!check(val)) {
      if (errEl) errEl.textContent = msg;
      if (inputEl) inputEl.classList.add("error");
      valid = false;
    } else {
      if (errEl) errEl.textContent = "";
      if (inputEl) inputEl.classList.remove("error");
    }
  });

  const evt = getEvent(wizardData.eventId);
  const qty = parseInt(document.getElementById("wiz-qty")?.value);
  if (evt && qty > evt.capacity - evt.sold) {
    document.getElementById("err-wiz-qty").textContent =
      `Max ${evt.capacity - evt.sold} posti disponibili`;
    document.getElementById("wiz-qty").classList.add("error");
    valid = false;
  }

  if (!valid) return;

  wizardData.user = {
    firstName: document.getElementById("wiz-fname").value.trim(),
    lastName: document.getElementById("wiz-lname").value.trim(),
    email: document.getElementById("wiz-email").value.trim(),
    phone: document.getElementById("wiz-phone").value.trim(),
    bookingDate: document.getElementById("wiz-bdate").value,
  };
  wizardData.quantity = qty;
  wizardStep = 2;
  renderWizard();
}

function wizBack() {
  wizardStep = Math.max(0, wizardStep - 1);
  renderWizard();
}

function calcDiscount(eventDate, bookingDate) {
  const ed = new Date(eventDate);
  const bd = new Date(bookingDate);
  const days = Math.floor((ed - bd) / (1000 * 60 * 60 * 24));

  switch (days) {
    case 60:
      return 20;
    case 30:
      return 15;
    case 14:
      return 10;
    case 7:
      return 5;
    default:
      return 0;
  }
}

function renderWizardStep2() {
  const evt = getEvent(wizardData.eventId);
  const u = wizardData.user;
  const qty = wizardData.quantity;
  const discount = calcDiscount(evt.date, u.bookingDate);
  const base = evt.priceBase * qty;
  const discountAmt = (base * discount) / 100;
  const total = base - discountAmt;

  const ed = new Date(evt.date);
  const bd = new Date(u.bookingDate);
  const days = Math.floor((ed - bd) / (1000 * 60 * 60 * 24));

  let discountMsg = "";
  switch (days) {
    case 60:
      discountMsg = `Prenotazione con ${days} giorni di anticipo — sconto 20%!`;
      break;
    case 30:
      discountMsg = ` Prenotazione con ${days} giorni di anticipo — sconto 15%!`;
      break;
    case 14:
      discountMsg = ` Prenotazione con ${days} giorni di anticipo — sconto 10%!`;
      break;
    case 7:
      discountMsg = `Prenotazione con ${days} giorni di anticipo — sconto 5%`;
      break;
    default:
      discountMsg = `Prenotazione ravvicinata (${days} giorni) — nessuno sconto`;
  }

  document.getElementById("wizard-content").innerHTML = `
    <div class="recap-box mb-16">
      <div class="recap-row"><span class="recap-label">Evento</span><span class="recap-value">${evt.name}</span></div>
      <div class="recap-row"><span class="recap-label">Struttura</span>${venueBadge(evt.venueId)}</div>
      <div class="recap-row"><span class="recap-label">Data Evento</span><span class="recap-value mono">${fmtDate(evt.date)}</span></div>
      <div class="divider" style="margin:4px 0"></div>
      <div class="recap-row"><span class="recap-label">Cliente</span><span class="recap-value">${u.firstName} ${u.lastName}</span></div>
      <div class="recap-row"><span class="recap-label">Email</span><span class="recap-sub">${u.email}</span></div>
      <div class="recap-row"><span class="recap-label">Telefono</span><span class="recap-sub">${u.phone}</span></div>
      <div class="recap-row"><span class="recap-label">Data Prenotazione</span><span class="recap-value mono">${fmtDate(u.bookingDate)}</span></div>
      <div class="divider" style="margin:4px 0"></div>
      <div class="recap-row"><span class="recap-label">Posti</span><span class="recap-value">${qty} × ${fmtMoney(evt.priceBase)}</span></div>
      <div class="recap-row"><span class="recap-label">Subtotale</span><span class="recap-value mono">${fmtMoney(base)}</span></div>
      ${discount > 0 ? `<div class="recap-row"><span class="recap-label">Sconto Anticipo</span><span class="discount-tag">-${discount}% (${fmtMoney(discountAmt)})</span></div>` : ""}
      <div class="recap-row"><span class="recap-label" style="font-weight:700">TOTALE</span><span class="recap-total">${fmtMoney(total)}</span></div>
    </div>
    ${discountMsg ? `<div class="text-sm text-sub mb-16">${discountMsg}</div>` : ""}
    <div class="flex justify-between">
      <button class="btn btn-secondary" onclick="wizBack()">← Indietro</button>
      <button class="btn btn-success" onclick="confirmBooking(${discount}, ${total})">✓ Conferma Prenotazione</button>
    </div>
  `;
}

function confirmBooking(discount, total) {
  const evt = getEvent(wizardData.eventId);
  const u = wizardData.user;
  const qty = wizardData.quantity;

  DB.bookings.push({
    id: "bk-" + Date.now(),
    eventId: wizardData.eventId,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    quantity: qty,
    date: u.bookingDate,
    status: "confirmed",
    discount: discount,
    total: total,
  });

  const evtIdx = DB.events.findIndex((e) => e.id === wizardData.eventId);
  if (evtIdx > -1) DB.events[evtIdx].sold += qty;

  closeModal("booking-modal");
  renderBookingsTable();
  renderEventsTable();
  renderOverview();
  toast(`Prenotazione confermata per ${u.firstName} ${u.lastName}!`, "success");
}

function renderReports() {
  const totalRev = DB.bookings.reduce((s, b) => s + b.total, 0);
  const avgDiscount = DB.bookings.filter((b) => b.discount > 0).length;
  const confirmed = DB.bookings.filter((b) => b.status === "confirmed").length;

  document.getElementById("report-kpis").innerHTML = `
    <div class="stat-card rock">
      <div class="stat-label">Prenotazioni Totali</div>
      <div class="stat-value">${DB.bookings.length}</div>
      <div class="stat-sub">${confirmed} confermate</div>
    </div>
    <div class="stat-card tech">
      <div class="stat-label">Revenue Prenotazioni</div>
      <div class="stat-value" style="font-size:20px">${fmtMoney(totalRev)}</div>
      <div class="stat-sub">Inclusi sconti</div>
    </div>
    <div class="stat-card ibiza">
      <div class="stat-label">Con Sconto Anticipo</div>
      <div class="stat-value">${avgDiscount}</div>
      <div class="stat-sub">su ${DB.bookings.length} prenotazioni</div>
    </div>
    <div class="stat-card green">
      <div class="stat-label">Posti Totali Venduti</div>
      <div class="stat-value">${DB.events.reduce((s, e) => s + e.sold, 0).toLocaleString("it-IT")}</div>
      <div class="stat-sub">Su tutti gli eventi</div>
    </div>
  `;

  document.getElementById("report-table").innerHTML = DB.bookings
    .map((b) => {
      const evt = getEvent(b.eventId);
      const v = evt ? getVenue(evt.venueId) : null;
      return `<tr>
      <td class="mono text-xs text-muted">${b.id}</td>
      <td><strong>${b.lastName}</strong>, ${b.firstName}</td>
      <td>${evt?.name || "—"}</td>
      <td>${v ? venueBadge(evt.venueId) : "—"}</td>
      <td class="mono text-sm">${fmtDate(b.date)}</td>
      <td class="mono text-center">${b.quantity}</td>
      <td>${b.discount > 0 ? `<span class="discount-tag">-${b.discount}%</span>` : "—"}</td>
      <td class="mono">${fmtMoney(b.total)}</td>
      <td>${statusBadge(b.status)}</td>
    </tr>`;
    })
    .join("");
}

function renderCharts() {
  const palette = {
    rock: "#E63946",
    tech: "#4895ef",
    ibiza: "#f4a261",
    green: "#06d6a0",
    purple: "#9b5de5",
    yellow: "#ffbe0b",
  };

  Chart.defaults.color = "#8889a8";
  Chart.defaults.borderColor = "#2a2b3d";
  Chart.defaults.font.family = "Space Grotesk";

  if (charts.pie) charts.pie.destroy();
  if (charts.bar) charts.bar.destroy();
  if (charts.line) charts.line.destroy();

  const typeCounts = {};
  DB.events.forEach((e) => {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  });
  const pieColors = Object.values(palette);
  charts.pie = new Chart(document.getElementById("chartPie"), {
    type: "doughnut",
    data: {
      labels: Object.keys(typeCounts),
      datasets: [
        {
          data: Object.values(typeCounts),
          backgroundColor: pieColors.slice(0, Object.keys(typeCounts).length),
          borderWidth: 2,
          borderColor: "#13141a",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { boxWidth: 12, font: { size: 11 } },
        },
      },
      cutout: "65%",
    },
  });

  const barLabels = DB.events.map((e) =>
    e.name.length > 18 ? e.name.slice(0, 18) + "…" : e.name,
  );
  const fillPct = DB.events.map((e) => Math.round((e.sold / e.capacity) * 100));
  const barColors = DB.events.map((e) => {
    const pct = Math.round((e.sold / e.capacity) * 100);
    return pct > 90 ? palette.rock : pct > 70 ? palette.ibiza : palette.green;
  });

  charts.bar = new Chart(document.getElementById("chartBar"), {
    type: "bar",
    data: {
      labels: barLabels,
      datasets: [
        {
          label: "Riempimento %",
          data: fillPct,
          backgroundColor: barColors,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { font: { size: 10 } } },
        y: { min: 0, max: 100, ticks: { callback: (v) => v + "%" } },
      },
      plugins: { legend: { display: false } },
    },
  });

  const monthMap = {};
  DB.bookings.forEach((b) => {
    const [y, m] = b.date.split("-");
    const key = `${y}-${m}`;
    if (!monthMap[key]) monthMap[key] = { count: 0, revenue: 0 };
    monthMap[key].count++;
    monthMap[key].revenue += b.total;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const monthLabels = sortedMonths.map((k) => {
    const [y, m] = k.split("-");
    const months = [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ];
    return months[+m - 1] + " " + y.slice(2);
  });

  charts.line = new Chart(document.getElementById("chartLine"), {
    type: "line",
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: "Prenotazioni",
          data: sortedMonths.map((k) => monthMap[k].count),
          borderColor: palette.rock,
          backgroundColor: "rgba(230,57,70,.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: palette.rock,
          pointRadius: 5,
          yAxisID: "y",
        },
        {
          label: "Revenue (€)",
          data: sortedMonths.map((k) => monthMap[k].revenue),
          borderColor: palette.green,
          backgroundColor: "rgba(6,214,160,.05)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: palette.green,
          pointRadius: 5,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { position: "left", ticks: { callback: (v) => v + " pren." } },
        y1: {
          position: "right",
          grid: { drawOnChartArea: false },
          ticks: { callback: (v) => "€" + v.toLocaleString("it-IT") },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: { boxWidth: 12, font: { size: 11 } },
        },
      },
    },
  });
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function toast(msg, type = "success") {
  const container = document.getElementById("toast-container");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === "success" ? "sucess" : "delete"}</span> ${msg}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
});

init();
