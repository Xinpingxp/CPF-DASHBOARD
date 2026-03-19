# CPF Mirror — Codebase Guide

## What This Is

CPF Mirror is a browser-only performance dashboard for CPF officers. It takes two inputs — an Auditmate Excel audit report and ESS (Email Satisfaction Survey) member feedback — and uses an AI model to generate a competency gap analysis with development recommendations. No backend. No database. Everything runs in the browser.

---

## How to Run

1. Copy `.env.example` to `.env`
2. Fill in your API key and provider:
   ```
   VITE_API_KEY=your-key-here
   VITE_API_PROVIDER=openrouter
   ```
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173`

---

## Login Accounts

Accounts are hardcoded in `src/components/Login.jsx`.

| Username | Password | Role |
|---|---|---|
| `cso` | `1234` | CSO |
| `tl` | `1234` | Team Leader |
| `supervisor` | `1234` | Supervisor |

Session is stored in `localStorage` so it persists on page refresh. Logout clears it.

---

## File Structure

```
src/
├── App.jsx                     # Root — routes to role-specific shell
├── main.jsx                    # Vite entry point
├── index.css                   # Global reset + scrollbar styles
│
├── components/
│   ├── Dashboard.jsx           # Core analysis component (CSO view)
│   ├── Sidebar.jsx             # Left nav + officer switcher
│   ├── Topbar.jsx              # Header with rank dropdown + logout
│   ├── Login.jsx               # Login screen + session helpers
│   ├── TLShell.jsx             # TL wrapper: My Analysis + Team Overview tabs
│   ├── SupervisorShell.jsx     # Supervisor wrapper: same tabs + override/inject powers
│   └── TeamOverview.jsx        # Team results grid (used by TL and Supervisor)
│
└── utils/
    └── storage.js              # localStorage read/write helpers
```

---

## How the Analysis Works

### Step 1 — Input
The user provides two sources:
- **Auditmate Excel file** — uploaded and parsed locally in the browser using SheetJS. The app reads 10 indicator columns (pass/fail, score, explanation, suggestions) plus total score and auditor comments.
- **ESS surveys** — up to 4 star ratings (1–5) with verbatim member feedback. A new survey row appears once the previous one has both a rating and verbatim filled in.

### Step 2 — Prompt building
The app formats the parsed Excel data and ESS responses into a structured text prompt. This prompt is combined with a system prompt that defines the competency framework for the officer's rank.

### Step 3 — AI call
The prompt is sent directly from the browser to the AI API (OpenRouter by default). The AI returns a JSON response — no server in between.

### Step 4 — Results display
The app parses the JSON and renders:
- **4 metric cards** — Overall Level, Auditmate Score, Member Satisfaction, Competencies at Basic
- **Competency gap cards** — one per competency, showing: why this level was assigned, commendable points, gaps observed, and numbered steps to reach the next level
- **Auditmate Indicators panel** — 10 pass/fail indicators with reasons
- **ESS Signals panel** — behavioural signals extracted from member feedback

---

## Competency Framework

The competency names are hardcoded in `Dashboard.jsx` (`CORE_COMPETENCIES`, `CORRESPONDENCE_CLUSTERS`, `TL_COMPETENCIES`, `SUPERVISOR_COMPETENCIES`). They are based on CPF's actual competency framework, not derived from the Excel file.

| Competency Group | Who Gets Evaluated |
|---|---|
| 6 Core Competencies | All ranks |
| 4 Correspondence Clusters | All ranks |
| 4 TL Competencies | TL and Supervisor |
| 1 Supervisor Competency | Supervisor only |

**Unquantifiable competencies** — two competencies cannot be assessed from correspondence data alone and are excluded from the AI prompt:
- Workload Delegation (TL+)
- Strategic Oversight & Team Performance Management (Supervisor)

These appear as blank "Pending" cards until a Supervisor manually sets a score.

---

## Role Permissions

### CSO
- Upload Auditmate Excel + fill ESS surveys
- Run analysis → see own competency gap cards
- Results saved to localStorage automatically

### Team Leader
- Same analysis flow as CSO (for their own case)
- Additional **Team Overview** tab — read-only view of CSO results (competency levels, Auditmate score)
- Cannot edit or override any scores

### Supervisor
- Same analysis flow as TL
- **Team Overview** with two extra powers:
  - **Override** — click any LLM-generated competency score to set a new level. Requires a written justification. Saved with timestamp. Displayed as "Manual Override" alongside the original LLM score.
  - **Set Score** — fill in blank pending competencies (Workload Delegation, Strategic Oversight) for any officer. Requires a written justification. Displayed as "Supervisor Assessment".

---

## Data Storage

All data is stored in the browser's `localStorage`. Nothing is sent to a server.

| Key | What it stores |
|---|---|
| `cpf_session` | Currently logged-in officer |
| `cpf_results` | Analysis results per officer ID |
| `cpf_overrides` | Supervisor overrides per officer + competency |
| `cpf_injections` | Supervisor-injected scores per officer + competency |

Data is lost if the browser's localStorage is cleared. Data is not shared across devices or browsers.

---

## API Configuration

The AI call is made directly from the browser. Supported providers:

| Provider | VITE_API_PROVIDER value | Notes |
|---|---|---|
| OpenRouter | `openrouter` | Default. Routes to Claude claude-opus-4-6. |
| Anthropic | `anthropic` | Requires `anthropic-dangerous-direct-browser-access: true` header |
| OpenAI | `openai` | Uses gpt-4o by default |

To override the model, add `VITE_API_MODEL=model-name` to your `.env`.

**Note:** The API key is visible in the browser's built JS bundle. This is acceptable for a local prototype but should not be deployed publicly.

---

## Changing the Competency Framework

To add, remove, or rename competencies, edit the constants near the top of `src/components/Dashboard.jsx`:

- `CORE_COMPETENCIES` — the 6 core competencies (all ranks)
- `CORRESPONDENCE_CLUSTERS` — the 4 correspondence clusters (all ranks)
- `TL_COMPETENCIES` — additional competencies for TL and above
- `SUPERVISOR_COMPETENCIES` — additional competency for Supervisor
- `UNQUANTIFIABLE` — competencies the LLM should skip (supervisor injects manually)
- `RANK_EVAL_INSTRUCTION` — the instruction sent to the LLM telling it what to evaluate per rank

---

## Changing Login Accounts

Edit the `ACCOUNTS` array in `src/components/Login.jsx`. Each account needs:
```js
{ username: 'string', password: 'string', id: 'unique-letter', name: 'Display Name', role: 'CSO'|'TL'|'Supervisor' }
```

Also update the `OFFICERS` array in `src/App.jsx` to match.
