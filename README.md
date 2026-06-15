# LiveCircuit — Dashboard di Gestione

Interfaccia digitale di gestione e prenotazione per il circuito internazionale di eventi live.

## Strutture

| Struttura | Città | Capacità | Periodo |
|-----------|-------|----------|---------|
| RockArena | Milano 🇮🇹 | 15.000 | Tutto l'anno |
| TechCon Center | Berlino 🇩🇪 | 45.000 | Ottobre – Maggio |
| Summer Beat Pavilion | Ibiza 🇪🇸 | 22.000 | 1 Giu – 15 Set |

---

## Avvio

Il progetto è **solo front-end** — non richiede back-end.  
I dati sono hardcoded in `src/data/db.json`.

### Metodo 1 — Live Server (VS Code)

1. Apri la cartella del progetto in VS Code
2. Installa l'estensione **Live Server** (ritwick.vscode-live-server)
3. Clic destro su `index.html` → **Open with Live Server**
4. Si apre automaticamente su `http://127.0.0.1:5500`

### Metodo 2 — Python (se disponibile)

```bash
# Python 3
python -m http.server 8080

# poi apri: http://localhost:8080
```

### Metodo 3 — Node.js serve

```bash
npx serve .
# poi apri l'URL indicato nel terminale
```

> ⚠️ Il file `db.json` viene caricato via `fetch()`, quindi è **necessario un server HTTP**.  
> Aprire `index.html` direttamente da file system (`file://`) **non funziona** per motivi di CORS.

---

## Struttura del progetto

```
venue-dashboard/
├── index.html          # Markup principale + layout sidebar/topbar/views
├── app.js              # Logica applicativa completa
├── src/
│   └── data/
│       └── db.json     # Dati hardcoded (venues, events, bookings)
└── README.md
```

---

## Funzionalità implementate

### Compito 1 — Architettura modulare
- Layout responsive con sidebar fissa, topbar e area contenuto
- Navigazione SPA (Single Page Application) senza router esterno
- Design system con CSS variables, componenti riutilizzabili

### Compito 2 — Gestione Eventi
- Tabella eventi con ordinamento su tutte le colonne (↑ ↓)
- Filtri per struttura e ricerca testuale
- Form con validazione completa (nome, struttura, data, capienza, prezzo)
- CRUD: creazione, modifica e cancellazione eventi

### Compito 3 — Sistema Prenotazioni
- Wizard a 3 step: selezione evento → dati utente → riepilogo
- Validazione form utente (nome, cognome, email, telefono, posti)
- **Sconto automatico per anticipo**:
  - 60+ giorni → 20% (Early Bird)
  - 30–59 giorni → 15%
  - 14–29 giorni → 10%
  - 7–13 giorni → 5%
  - < 7 giorni → nessuno sconto
- Riepilogo con calcolo totale e messaggio sconto
- Aggiornamento automatico posti disponibili

### Compito 4 — Reportistica
- KPI cards aggregate (prenotazioni, revenue, sconti)
- **Grafico Donut**: distribuzione tipologie eventi
- **Grafico Barre**: tasso di riempimento % per evento (colori dinamici)
- **Grafico Linee**: andamento temporale prenotazioni e revenue (doppio asse Y)
- Tabella storica completa prenotazioni

---

## Tecnologie

- **HTML5 / CSS3** — layout, design system, animazioni
- **Vanilla JavaScript** (ES6+) — logica applicativa, manipolazione DOM
- **Chart.js 4.4** — grafici interattivi (via CDN)
- **Google Fonts** — Space Grotesk + JetBrains Mono
- **JSON** — dati hardcoded in `src/data/db.json`
