# BMS Enterprise — Landing page

Sito statico (landing page) per **BMS Enterprise**, ditta *fittizia* di trasporto
persone sulla linea **B**avaria · **M**aserada · **S**acile.

Tema visivo: **LCARS** (interfaccia stile Star Trek) — pannelli arrotondati colorati
su sfondo nero. HTML/CSS/JS puro, nessun build step.

## Avvio

È un sito statico: basta servire la cartella.

```bash
# opzione 1: server statico di Python
python3 -m http.server 8000
# poi apri http://localhost:8000

# opzione 2: aprire direttamente index.html nel browser
```

> La **mappa** (Leaflet + tile OpenStreetMap) e gli **script Leaflet** sono caricati
> da CDN, quindi serve connessione a internet a runtime. Tutto il resto (font, stile,
> SVG dei mezzi, flusso biglietti) è locale e funziona offline.

## Struttura

```
index.html        # pagina unica: header, hero, mezzi, mappa, biglietti, footer
styles.css        # tema LCARS completo (token, pannelli, responsive, reduced-motion)
main.js           # mappa Leaflet + flusso biglietti finto (no backend)
assets/fonts/     # font self-hosted (Antonio, Orbitron) in woff2
```

## Dati della linea

- **Fermate** (`STOPS` in `main.js`): Bavaria (Nervesa della Battaglia), Maserada
  sul Piave, Sacile. Coordinate geocodificate da indirizzo via Nominatim/OSM.
- **Punti di interesse** (`POIS` in `main.js`): popolati da `POIS.md`
  (schema `{ name, coords: [lat, lng], desc }`). Per aggiungerne altri, basta
  inserire nuove voci nell'array.

## Note sui font

- **Antonio** (UI/LCARS) — licenza SIL Open Font License, libera.
- **Orbitron** (wordmark "BMS ENTERPRISE") — licenza SIL Open Font License, libera.
  È un *lookalike* sci-fi: i font originali di Star Trek sono proprietari e **non**
  sono inclusi. Se disponi di una licenza per un font Trek, sostituisci il file in
  `assets/fonts/` e aggiorna `--font-display` in `styles.css`.

## Disclaimer

Azienda e servizio **fittizi**. Nessun trasporto reale, nessun pagamento: il flusso
di acquisto biglietti è interamente simulato lato client.
