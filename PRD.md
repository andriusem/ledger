**Product Requirements Document (PRD)**
**Project :** *Boîte à outils – PWA « Mon Cahier d’Entreprise » (MVP)*
**Author :** ÎLE Y A – Digital team **Date :** 18 Jun 2025 **Version :** v0.9‑draft

---

## 1. Executive summary

Small business owners in Guadeloupe with low literacy levels struggle to keep even a pencil‑and‑paper record of purchases, sales and bills, which blocks any basic profitability analysis and fuels debt spirals. The NGO cannot finance or run a cloud database, yet field interviews confirm that **an entirely offline, phone‑resident logbook** would already unlock day‑to‑day visibility and prepare owners for coached sessions. This MVP delivers exactly that, in the form of a lightweight progressive‑web app (PWA) that installs from a link, runs offline, stores data in the handset’s browser, and costs **€0 / month to host or operate**.&#x20;

---

## 2. Objectives & success metrics

| Objective                                 | KPI                                                                                        | Target @ 90 days post‑launch |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------- |
| Enable owners to capture daily cash‑flows | ≥ 60 % of enrolled users record ≥ 1 income + 1 expense line per day during a 2‑week sample |                              |
| Support stock visibility                  | ≥ 50 % log at least one stock movement per week                                            |                              |
| Keep NGO infra costs at zero              | €0 paid for servers, DB or third‑party SaaS                                                |                              |
| Usability for low‑literacy group          | SUS\* ≥ 75 in moderated tests (n = 10)                                                     |                              |

\* System Usability Scale with pictogram answers.

---

## 3. Problem statement

*Entrepreneurs know their craft (baking, fishing, hairdressing) but cannot track money or materials; spreadsheet tools and cloud apps feel alien, require literacy, or fail without data bundles. They therefore work “blind”, mis‑price, over‑buy stock, and miss early signs of trouble.*&#x20;

---

## 4. Scope for MVP (6‑week build)

### 4.1 Core user stories

| ID    | As a …             | I want …                                              | So that …                                     |
| ----- | ------------------ | ----------------------------------------------------- | --------------------------------------------- |
| US‑01 | business owner     | to add an **expense** in ≤ 4 taps                     | I can remember what I spent on gas bottles    |
| US‑02 | business owner     | to add an **income** line in ≤ 4 taps                 | I can see if I earned more than I spent today |
| US‑03 | business owner     | to log a **stock in/out** quantity                    | I know when to reorder                        |
| US‑04 | business owner     | to view a **Today / This Week** profit tile           | I grasp my position at a glance               |
| US‑05 | business owner     | to receive a **low‑stock alert**                      | I avoid running out mid‑shift                 |
| US‑06 | business owner     | to **export** my data to CSV via Android share‑sheet  | I keep a backup or share with my counsellor   |
| US‑07 | NGO coach          | to ask the owner to **import** a CSV                  | we can restore data on a repaired handset     |
| US‑08 | first‑time visitor | to **install** the app from a link without Play Store | I can use it offline tomorrow                 |

### 4.2 Out‑of‑scope for MVP

* multi‑device sync
* user accounts / authentication
* invoice generation
* OCR of paper receipts
* cloud dashboards for NGO

---

## 5. User & UX requirements

| Requirement    | Details                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language level | French CEFR A2; max 15 words per screen; optional Creole keywords phase 2                                                                                     |
| Visuals        | 48 × 48 SVG icons for the 10 default categories (bananas 🥭, fuel ⛽, ice 🧊, etc.); colour‑blind‑safe palette                                                 |
| Navigation     | Bottom tab bar: **Journal – Saisir – Stock – Réglages**                                                                                                       |
| Data entry     | Single floating “+” opens a form where user picks ① type (Income / Expense / Stock), ② icon category, ③ amount (numeric pad), ④ note (optional voice‑to‑text) |
| Feedback       | After save: toast “✅ Bien noté !”; Home screen tiles update instantly                                                                                         |
| Accessibility  | Tap areas ≥ 48 dp; offline voice hints (TTS) optional flag; no small text <14 sp                                                                              |
| Backup UX      | “Exporter” button writes JSON + CSV to device Downloads and opens native share‑sheet                                                                          |

---

## 6. Functional specification

### 6.1 Data model (local IndexedDB via Dexie.js)

```text
Table: entries
id (UUID) | date (ISO) | type ("expense" | "income" | "stock_in" | "stock_out")
amount (number) | category_id | note (string)

Table: categories
id | label_fr | icon_svg | is_editable (bool)

Table: settings
currency ("€") | low_stock_thresholds {category_id: number} | last_backup_date
```

### 6.2 Key screens & flows

1. **Install / splash**
   `manifest.json` + service‑worker (Workbox) → prompt “Ajouter à l’écran d’accueil”.

2. **Dashboard**
   • PROFIT TODAY tile = Σ income – Σ expense (today)
   • PROFIT 7 JOURS tile, **Stock alerts** list (red bullet).

3. **Entry form**
   • Stepper UI: Type → Category grid → Amount keypad → Save.
   • Voice icon toggles speech‑to‑text for the note field.

4. **Stock page**
   • Table listing each category with current quantity; “‑ / +” buttons adjust quickly.

5. **Settings**
   • Currency (€ only in MVP, greyed list)
   • Export / Import buttons (reads / writes JSON+CSV)
   • Reset & tutorials link.

Wire‑frames in Appendix A (Figma link – to be delivered in Design sprint).

---

## 7. Non‑functional requirements

| Area                     | Requirement                                                      | KPI                                         |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------- |
| **Performance**          | First load bundle ≤ 150 kB gzip on Moto E5                       | TTI < 3 s on 3G                             |
| **Offline**              | All CRUD & dashboard work without network                        | 100 % Lighthouse offline PWA score          |
| **Data safety**          | No data leaves handset unless user exports                       | Pass pen‑test: no unintended outbound calls |
| **Compatibility**        | Android 7+ Chrome, KaiOS 3.x “Browser” (progressive enhancement) | ≥ 95 % of target devices work               |
| **Internationalisation** | Strings in i18n JSON; ready for Creole locale                    | N/A (phase 2)                               |
| **Security**             | Signed HTTPS service worker; Integrity metadata on CDN bundle    | OWASP PWA top‑10 compliance                 |

---

## 8. Technical architecture (zero‑server)

```
[ GitHub Pages ]  --HTTPS-->  [Phone browser]
                                 |– Service‑worker cache (Workbox)
                                 |– IndexedDB (Dexie.js wrapper)
                                 |– UI layer (SvelteKit compiled JS)
                                 └– Charts (Chart.js) rendered on Canvas
```

*Continuous deployment*: `main` branch pushes to GitHub Pages via GitHub Actions (free).
*Analytics*: privacy‑preserving local counter; aggregated manually when users export (opt‑in CSV flag).

---

## 9. Dependencies & open‑source licences

| Library   | Licence    | Why chosen                         |
| --------- | ---------- | ---------------------------------- |
| SvelteKit | MIT        | bundles ≤ 30 kB, simple reactivity |
| Dexie.js  | Apache 2.0 | thin IndexedDB wrapper             |
| Workbox   | Apache 2.0 | cache‑first, background‑sync later |
| Chart.js  | MIT        | small, no D3 bloat                 |
| Papaparse | MIT        | CSV export/import                  |

---

## 10. Risks & mitigations

| Risk                                     | Likelihood | Impact | Mitigation                                             |
| ---------------------------------------- | ---------- | ------ | ------------------------------------------------------ |
| Users lose phone ⇒ lose data             | Medium     | High   | Monthly backup nag; explore USB‑OTG workshop           |
| IndexedDB quota reached (lots of photos) | Low        | Medium | Text‑only data in MVP; refuse blobs                    |
| Low‑end KaiOS devices lack IndexedDB     | Medium     | Medium | Test fallback to `localStorage` (limited)              |
| Field team lacks dev capacity            | Medium     | High   | Pair with Code‑for‑Guadeloupe volunteers; modular code |

---

## 11. Milestones & timeline (6 weeks)

| Week | Deliverable                                                      |
| ---- | ---------------------------------------------------------------- |
| 0    | Kick‑off, confirm specs, create Git repo                         |
| 1    | High‑fidelity Figma screens, usability walkthrough               |
| 2    | Scaffold SvelteKit app, service worker, manifest                 |
| 3    | Dexie schema, CRUD flows, dashboard tiles                        |
| 4    | Stock module, low‑stock rule engine, CSV export                  |
| 5    | KaiOS & low‑end Android testing, bug‑fix                         |
| 6    | Field pilot with 5 entrepreneurs, collect telemetry & SUS survey |

---

## 12. Acceptance criteria (exit‑MVP)

1. App installs via “Ajouter à l’écran d’accueil” and launches offline.
2. User can add income, expense and stock moves under 10 s each.
3. Dashboard tiles recalculate instantly (< 100 ms).
4. Export produces a valid CSV readable by LibreOffice.
5. Manual QA on Moto E5 (Android 8) and Nokia 8110 (KaiOS 3.1) passes.
6. Pilot SUS score ≥ 75 with at least 8 of 10 test users.
7. GitHub Pages CI/CD shows green build & Lighthouse PWA 90+.

---

## 13. Open questions / next steps

* Should we embed a camera receipt capture (JPEG) in v1.1 if storage tests OK?
* Confirm icon set culturally relevant (e.g., cane‑sugar sack vs generic bag).
* Decide on monthly vs weekly backup reminder cadence.
* Explore linking with the Custom‑GPT tax coach: share CSV for year‑end guidance.

---

### Appendix A – wire‑frame thumbnails (placeholder)

*(to be attached after Design sprint)*

---

With this PRD the development team has a **clear, cost‑neutral blueprint** for a six‑week sprint that addresses the real bookkeeping gap identified in the Boîte à outils research and meets the technological constraints of the NGO.
