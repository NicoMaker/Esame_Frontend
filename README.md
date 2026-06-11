# 🏢 CoWork Hub Dashboard

Dashboard professionale per la gestione di spazi co-working.

---

## Stack Tecnologico

| Libreria         | Scopo                                                  |
| ---------------- | ------------------------------------------------------ |
| **React 18**     | Framework UI                                           |
| **Recharts**     | Grafici interattivi (torta, barre, linee)              |
| **Lucide React** | Icone                                                  |
| **CSS Custom**   | Design system con variabili CSS (no framework esterno) |
| **Google Fonts** | Syne (display) + DM Sans (body)                        |
| **Vite 5**       | Build tool e dev server                                |

---

## ⚡ Avvio Rapido

### 1. Prerequisiti

Installa **Node.js LTS** da [nodejs.org](https://nodejs.org) se non lo hai già.

### 2. Installa le dipendenze

```bash
npm install
```

> Attendi il completamento (circa 1–2 minuti, scarica ~1400 pacchetti)

### 3. Avvia l'applicazione

```bash
npm run dev
```

> Si apre automaticamente il browser su **http://localhost:5173**

### 4. Build per produzione (opzionale)

```bash
npm run build
```

> I file ottimizzati vengono generati nella cartella `dist/`

### 5. Anteprima build di produzione (opzionale)

```bash
npm run preview
```

---

## Funzionalità

### 🏠 Dashboard

- KPI cards: spazi disponibili, prenotazioni attive, fatturato totale, totale spazi
- Barre di avanzamento occupazione per tipologia
- Azioni rapide di navigazione
- Elenco prenotazioni recenti

### 🏢 Gestione Spazi

- Vista griglia e tabella (toggle)
- Filtri per tipologia (scrivania, sala riunioni, ufficio) e per stato
- Ricerca per nome spazio
- Form aggiunta nuovo spazio con validazione campi
- Cambio stato: Disponibile ↔ Manutenzione
- Eliminazione spazio

### 📅 Sistema di Prenotazione — Wizard 3 Step

1. **Selezione spazio** — lista filtrabile degli spazi disponibili
2. **Dati prenotazione** — nome cliente, data, fascia oraria inizio/fine con calcolo automatico del costo
3. **Conferma** — riepilogo completo con tariffa stimata

### 📊 Reportistica & Analytics

- Grafico **torta** — distribuzione tipologie spazi richiesti
- Grafico **barre** — spazi più prenotati
- Grafico **linee** — andamento fatturato ultimi 20 giorni
- Grafico **barre raggruppate** — confronto settimanale
- Tabella cronologica con filtri, ricerca e toggle prenotazioni annullate
- KPI: fatturato totale, prenotazioni confermate, ore prenotate, valore medio

---

## Struttura del Progetto

```
cowork-hub/
├── index.html                    # Entry HTML (gestito da Vite)
├── vite.config.js                # Configurazione Vite
├── package.json
├── README.md
└── src/
    ├── main.jsx                  # Entry point React
    ├── App.jsx                   # Root + Context globale (stato condiviso)
    ├── data.jsx                  # Dati hardcoded: spazi + prenotazioni
    ├── styles.css                # Design system completo (variabili CSS)
    └── components/
        ├── Layout.jsx            # Shell: Sidebar + Topbar
        ├── DashboardHome.jsx     # Pagina Dashboard
        ├── SpacesManager.jsx     # Gestione Spazi
        ├── BookingSystem.jsx     # Wizard Prenotazione
        └── ReportsDashboard.jsx  # Analytics & Report
```
