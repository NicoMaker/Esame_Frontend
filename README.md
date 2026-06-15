# LiveCircuit — Dashboard di Gestione

Interfaccia digitale di gestione e prenotazione per il circuito internazionale di eventi live.

## Avvio

Il progetto è **solo front-end** — non richiede back-end.  
I dati sono hardcoded in [src/data/db.json](src/data/db.json)

1. Apri la cartella del progetto in VS Code
2. Installa l'estensione **Live Server** (ritwick.vscode-live-server)
3. Clic destro su [index.html](index.html) → **Open with Live Server** oppure go live sotto allo schermo del pc sotto a livello di editor
4. Si apre automaticamente su `http://127.0.0.1:5500`


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
