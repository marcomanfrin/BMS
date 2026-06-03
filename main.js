/* ============================================================
   BMS ENTERPRISE — main.js
   - Stardate ticker
   - Leaflet map (route + stops + points of interest)
   - Fake ticket purchase flow (no backend)
   ============================================================ */

/* ------------------------------------------------------------
   LINE DATA
   Stops from FERMATE.md; coordinates geocoded via Nominatim/OSM.
   ------------------------------------------------------------ */
const STOPS = [
  {
    id: "bavaria",
    name: "Bavaria",
    coords: [45.80921, 12.18381],
    desc: "Casa del tutor · via Bernardo Canal 5, Nervesa della Battaglia",
  },
  {
    id: "maserada",
    name: "Maserada",
    coords: [45.75651, 12.31492],
    desc: "Casa del discepolo · via Monte Grappa 15, Maserada sul Piave",
  },
  {
    id: "sacile",
    name: "Sacile",
    coords: [45.94472, 12.4684],
    desc: "Sistec AM · viale Trento 105, Sacile",
  },
];

// The full ordered geographic path of the BMS line.
const ROUTE = STOPS.map((s) => s.coords);

/* Points of interest along the route (from POIS.md).
   Schema: { name, coords:[lat,lng], desc, img }
   - desc: short, tongue-in-cheek (invented) blurb based on the name.
   - img: real photo in assets/images/ where available, otherwise the
     POI_IMG placeholder. A missing/misnamed file falls back to POI_IMG
     at runtime (see the img onerror handlers).
   Note: a few entries shared identical coordinates in the source;
   the duplicate is nudged ~50 m so both markers stay clickable.
   "Sistec AM" is omitted here: it is the Sacile terminus (see STOPS). */
const POI_IMG = "assets/img/poi/placeholder.svg";
const POIS = [
  {
    name: "Il regno di Zebi",
    coords: [45.80872, 12.18574],
    img: "assets/images/zebi.png",
    desc: "Sovrano felino da 9,1 kg di pura maestà. Pedaggio: tre grattini sotto il mento, non negoziabili.",
  },
  {
    name: "La villa di Enea",
    coords: [45.80872, 12.18634],
    img: "assets/images/enea.JPG",
    desc: "Sorvegliata h24 da un golden retriever che abbaia alle foglie e fa le feste ai ladri. Sicurezza percepita: massima.",
  },
  {
    name: "Primo ponte sul Piave",
    coords: [45.76878, 12.32997],
    img: "assets/images/ponte1.png",
    desc: "Il primo dei due ponti. Statisticamente quello dove inizi a chiederti se hai chiuso il gas.",
  },
  {
    name: "Grave di Papadopoli",
    coords: [45.77099, 12.34735],
    img: "assets/images/grave.png",
    desc: "Isola fluviale dove la ghiaia supera in numero gli abitanti. Niente Wi-Fi, pace assoluta garantita.",
  },
  {
    name: "Secondo ponte sul Piave",
    coords: [45.77159, 12.34795],
    img: "assets/images/ponte2.png",
    desc: "Come il primo, ma con la soddisfazione di averne già fatto uno. Vista fiume inclusa nel biglietto.",
  },
  {
    name: "Grazianillo Castagner",
    coords: [45.84922, 12.38641],
    img: "assets/images/grazianillo.png",
    desc: "Avamposto strategico della linea. Nessuno sa di preciso cosa ci sia, ma il mezzo ci passa con rispetto.",
  },
  {
    name: "Stalla gotica",
    coords: [45.85957, 12.4117],
    img: "assets/images/stalla-gotica.png",
    desc: "Architettura rurale con velleità da cattedrale. Le mucche apprezzano molto gli archi a sesto acuto.",
  },
  {
    name: "Archeologia industriale",
    coords: [45.91196, 12.39299],
    img: "assets/images/archeologia-industriale.png",
    desc: "Capolavoro di cemento e nostalgia. Bellissimo da fuori, meglio non chiedere cosa producesse.",
  },
  {
    name: "ZanziBAR",
    coords: [45.92988, 12.39833],
    img: "assets/images/zanzibar.jpg",
    desc: "Tappa idratante ufficiale della linea. Spritz a coordinate note, rientro in orario non garantito.",
  },
];

/* ------------------------------------------------------------
   STARDATE
   ------------------------------------------------------------ */
function computeStardate(d = new Date()) {
  const yearStart = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d - yearStart) / 86400000);
  const frac = (d.getHours() * 60 + d.getMinutes()) / 1440;
  const value = 47000 + dayOfYear * 2.73 + frac * 2.73;
  return value.toFixed(1);
}
function initStardate() {
  const el = document.querySelector("[data-stardate]");
  if (el) el.textContent = computeStardate();
}

/* ------------------------------------------------------------
   STOP-DEPENDENT UI (selects + map rail list)
   ------------------------------------------------------------ */
function populateStops() {
  const from = document.getElementById("from");
  const to = document.getElementById("to");
  const list = document.getElementById("stoplist");

  STOPS.forEach((s, i) => {
    if (from) from.add(new Option(s.name, s.id, i === 0, i === 0));
    if (to)
      to.add(
        new Option(s.name, s.id, i === STOPS.length - 1, i === STOPS.length - 1)
      );
    if (list) {
      const li = document.createElement("li");
      li.textContent = s.name;
      list.appendChild(li);
    }
  });
}

/* ------------------------------------------------------------
   POINTS OF INTEREST — card grid
   ------------------------------------------------------------ */
function renderPOIs() {
  const grid = document.getElementById("poigrid");
  if (!grid) return;
  grid.innerHTML = POIS.map(
    (p) => `
    <article class="poicard">
      <div class="poicard__art"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${POI_IMG}'" /></div>
      <h3 class="poicard__name">${p.name}</h3>
      <p class="poicard__desc">${p.desc}</p>
    </article>`
  ).join("");
}

/* ------------------------------------------------------------
   MAP
   ------------------------------------------------------------ */
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  const map = L.map(mapEl, { scrollWheelZoom: false });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  // Route line
  L.polyline(ROUTE, { color: "#ff9966", weight: 5, opacity: 0.9 }).addTo(map);

  // Stop markers (LCARS-styled divIcon)
  STOPS.forEach((s) => {
    const icon = L.divIcon({
      className: "",
      html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:#ffcc66;box-shadow:0 0 0 4px #000,0 0 0 6px #ff9966;"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker(s.coords, { icon, title: s.name, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<strong>${s.name}</strong><br>${s.desc || "Fermata BMS"}`);
  });

  // POI markers (smaller ice-blue dot, distinct from the gold stop markers)
  POIS.forEach((p) => {
    const icon = L.divIcon({
      className: "",
      html: `<span style="display:block;width:11px;height:11px;border-radius:50%;background:#99ccff;box-shadow:0 0 0 3px #000;"></span>`,
      iconSize: [11, 11],
      iconAnchor: [5.5, 5.5],
    });
    L.marker(p.coords, { icon, title: p.name })
      .addTo(map)
      .bindPopup(
        `<div class="poipopup"><img src="${p.img}" alt="" onerror="this.onerror=null;this.src='${POI_IMG}'" /><strong>${p.name}</strong><p>${p.desc || ""}</p></div>`
      );
  });

  // Fit to everything: stops + points of interest.
  const allPoints = ROUTE.concat(POIS.map((p) => p.coords));
  map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
}

/* ------------------------------------------------------------
   TICKET FLOW (fake, client-side only)
   ------------------------------------------------------------ */
function stopName(id) {
  const s = STOPS.find((x) => x.id === id);
  return s ? s.name : id;
}
const VEHICLE_LABELS = {
  any: "Indifferente",
  kangoo: "Renault Kangoo (ammiraglia)",
  classea: "Mercedes Classe A (comfort)",
  i20: "Hyundai i20 (ultra-veloce)",
};
const VEHICLE_MULT = { any: 1, kangoo: 1, classea: 1.2, i20: 1.5 };

function rndCode(len, chars) {
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function initTickets() {
  const dialog = document.getElementById("ticket");
  const form = document.getElementById("ticket-form");
  if (!dialog || !form) return;

  const steps = [...form.querySelectorAll(".ticket__step")];
  const errorEl = document.getElementById("ticket-error");

  function showStep(n) {
    steps.forEach((s) => (s.hidden = Number(s.dataset.step) !== n));
  }

  function open() {
    showStep(1);
    if (errorEl) errorEl.hidden = true;
    // default date = today
    const dateEl = document.getElementById("date");
    if (dateEl && !dateEl.value)
      dateEl.value = new Date().toISOString().slice(0, 10);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  function close() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function readForm() {
    return {
      from: form.from.value,
      to: form.to.value,
      date: form.date.value,
      pax: parseInt(form.pax.value, 10),
      vehicle: form.vehicle.value,
    };
  }

  function validate(d) {
    if (!d.from || !d.to) return "Seleziona partenza e destinazione.";
    if (d.from === d.to) return "Partenza e destinazione devono essere diverse.";
    if (!d.date) return "Scegli una data di viaggio.";
    if (!d.pax || d.pax < 1 || d.pax > 5) return "Numero passeggeri non valido (1–5).";
    return null;
  }

  function priceOf(d) {
    const base = 4.7;
    return (base * d.pax * (VEHICLE_MULT[d.vehicle] || 1)).toFixed(2);
  }

  function fillSummary(d) {
    const dl = document.getElementById("summary");
    const rows = [
      ["Da", stopName(d.from)],
      ["A", stopName(d.to)],
      ["Data", d.date],
      ["Passeggeri", String(d.pax)],
      ["Mezzo", VEHICLE_LABELS[d.vehicle]],
      ["Totale", "€ " + priceOf(d)],
    ];
    dl.innerHTML = rows
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
      .join("");
  }

  function fillPass(d) {
    const seat =
      rndCode(1, "ABCDE") + (Math.floor(Math.random() * 5) + 1);
    const code = rndCode(3, "ABCDEFGHJKLMNPQRSTUVWXYZ") + "-" + rndCode(4, "0123456789");
    document.getElementById("boardingpass").innerHTML = `
      <span class="boardingpass__route">${stopName(d.from)} → ${stopName(d.to)}</span>
      <span class="boardingpass__code">${code}</span>
      <dl class="boardingpass__grid">
        <div><dt>Data</dt><dd>${d.date}</dd></div>
        <div><dt>Passeggeri</dt><dd>${d.pax}</dd></div>
        <div><dt>Posto</dt><dd>${seat}</dd></div>
        <div><dt>Mezzo</dt><dd>${VEHICLE_LABELS[d.vehicle]}</dd></div>
        <div><dt>Totale</dt><dd>€ ${priceOf(d)}</dd></div>
        <div><dt>Stardate</dt><dd>${computeStardate()}</dd></div>
      </dl>`;
  }

  // Wire up buttons
  document
    .querySelectorAll("[data-open-tickets]")
    .forEach((b) => b.addEventListener("click", open));
  form
    .querySelectorAll("[data-close-tickets]")
    .forEach((b) => b.addEventListener("click", close));

  form.querySelector("[data-go-summary]").addEventListener("click", () => {
    const d = readForm();
    const err = validate(d);
    if (err) {
      errorEl.textContent = err;
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;
    fillSummary(d);
    showStep(2);
  });

  form
    .querySelector("[data-back-step]")
    .addEventListener("click", () => showStep(1));

  form.querySelector("[data-confirm]").addEventListener("click", () => {
    fillPass(readForm());
    showStep(3);
  });
}

/* ------------------------------------------------------------
   BOOT
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  initStardate();
  populateStops();
  renderPOIs();
  initMap();
  initTickets();
});
