# Namhya LeadFlow — Complete PRD
### Founder's Office Intern Assignment · Namhya Foods

---

## CONFIRMED FINAL STACK

| Layer | Tool | Free Limit | Notes |
|---|---|---|---|
| Automation | Make.com | 1,000 ops/month, 2 scenarios | N8N Cloud has no free tier |
| Lead Discovery | Brave Search API | 2,000 queries/month, free, no card | Better than Serper — monthly reset means perpetual use |
| Email Finding | Hunter.io | 50 credits/month, free API access | Better domain search than Skrapp for our use case |
| AI Blurb | Groq (Mixtral 8x7B) | 14,400 req/day permanently free | Open-source Mistral family, same quality |
| Database | MongoDB Atlas M0 | 512MB free forever | |
| Backend | Node.js + Express on Render | Free tier | May sleep — add warmup ping |
| Frontend | React on Vercel | Free | |

---

## OPERATION COUNT (Make.com Free Tier Math)

Make.com counts every module execution as 1 operation.

Per pipeline run:
- 5 Brave Search API searches (1 per country) = 5 ops
- Up to 10 results per search → 50 leads max
- Per lead: Hunter lookup + Groq call + duplicate check + save = 4 ops
- 50 leads × 4 ops = 200 ops
- Total per full run: ~205 ops

Free tier = 1,000 ops/month → you get ~4 full pipeline runs per month.
For this assignment you only need 1 run. You have plenty of room.

---

## PART 1 — MAKE.COM WORKFLOW

### Initial Setup
1. Sign up at make.com (free, no card)
2. Sign up at api.search.brave.com — grab API key (2,500 free queries)
3. Sign up at hunter.io — grab API key (50 free credits)
4. Sign up at console.groq.com — grab API key (free, no card)
5. Deploy your Express backend to Render first — you need the live URL before building Make scenarios

---

### Scenario 1: "Namhya Lead Pipeline"

Make.com uses modules connected left-to-right. Here is every module in order:

---

**Module 1 — Trigger (choose one of two, connect via Router)**

Option A — Scheduled:
- Module type: `Schedule`
- Run every: 1 Day
- Start time: 03:30 UTC (= 9:00 AM IST)
- This runs the pipeline automatically every morning

Option B — Webhook (for manual "Run Now" from your dashboard):
- Module type: `Webhooks → Custom webhook`
- Copy the webhook URL — paste it in your dashboard's Run Now button
- Your React frontend sends a POST to this URL when founder clicks Run Now

Connect both triggers into a `Router` module so either one kicks off the same pipeline.

---

**Module 2 — Set search queries**
- Module type: `Tools → Set variable`
- Variable name: `queries`
- Variable value (array of 5 strings, one per country):
```
[
  "ayurveda wellness tea distributor importer United States contact email",
  "herbal health food broker importing agency United Kingdom wellness contact",
  "organic wellness CPG distribution partner Canada ayurveda contact",
  "health food importing agency Dubai UAE wellness herbal contact",
  "ayurveda supplement natural food distributor Australia contact email"
]
```

---

**Module 3 — Loop through queries**
- Module type: `Flow Control → Iterator`
- Array: `{{1.queries}}` (reference the array from Module 2)
- This runs Module 4 onwards once per query string (5 times total)

---

**Module 4 — Search via Brave Search API**
- Module type: `HTTP → Make a request`
- Method: GET
- URL: `https://api.search.brave.com/res/v1/web/search`
- Query string parameters:
  - `q` : `{{3.value}}`
  - `count` : `10`
- Headers:
  - `X-Subscription-Token` : `YOUR_BRAVE_KEY`
  - `Accept` : `application/json`
- Body: none (GET request)
- Parse response: Yes

Brave returns `web.results[]`. Each item has: `title`, `url`, `description`, `extra_snippets`.

---

**Module 5 — Extract company data from results**
- Module type: `Flow Control → Iterator`
- Array: `{{4.web.results}}` (the results array from Brave)
- Now each bundle = one search result (company)

---

**Module 6 — Clean company name from title**
- Module type: `Tools → Set multiple variables`
- Set these variables from `{{5.value}}`:

| Variable | Value |
|---|---|
| `companyName` | Use text functions to strip " - LinkedIn", " \| " suffixes from title |
| `companyWebsite` | `{{5.value.url}}` — the result URL (Brave uses `url` not `link`) |
| `snippet` | `{{5.value.description}}` — Brave uses `description` not `snippet` |
| `displayedDomain` | `{{5.value.displayedLink}}` — cleaner domain |
| `country` | Extract from which iteration we're on (pass from Module 3) |

To clean company name in Make, use:
`{{replace(replace(5.value.title; " - LinkedIn"; ""); " | "; " ")}}` then trim.

---

**Module 7 — Hunter.io Domain Search**
- Module type: `HTTP → Make a request`
- Method: GET
- URL: `https://api.hunter.io/v2/domain-search`
- Query string parameters:
  - `domain` : `{{6.displayedDomain}}`
  - `api_key` : `YOUR_HUNTER_KEY`
  - `limit` : `3`
- Parse response: Yes

Hunter returns `data.emails[]` — each has `value` (email), `first_name`, `last_name`, `position`, `confidence`.

Take the first email with confidence > 70. If none, email stays empty.

---

**Module 8 — Check for duplicate in your backend**
- Module type: `HTTP → Make a request`
- Method: GET
- URL: `https://your-backend.onrender.com/api/leads/check-duplicate`
- Query string: `email` = `{{7.data.emails[].value}}` (first email found)
- Headers: `x-pipeline-secret` : `YOUR_SECRET`
- Parse response: Yes

Response will be `{ "exists": true }` or `{ "exists": false }`.

---

**Module 9 — Filter duplicates out**
- Module type: `Flow Control → Filter`
- Label: "Only new leads"
- Condition: `{{8.exists}}` equals `false`
- If condition fails → stop this branch (don't process this lead further)

---

**Module 10 — Groq API — Generate relevance blurb**
- Module type: `HTTP → Make a request`
- Method: POST
- URL: `https://api.groq.com/openai/v1/chat/completions`
- Headers:
  - `Authorization` : `Bearer YOUR_GROQ_KEY`
  - `Content-Type` : `application/json`
- Body (raw JSON):
```json
{
  "model": "mixtral-8x7b-32768",
  "max_tokens": 120,
  "temperature": 0.4,
  "messages": [
    {
      "role": "system",
      "content": "You write short, specific business notes. No fluff. No generic statements. Always name the company and explain why they are a fit."
    },
    {
      "role": "user",
      "content": "Namhya Foods is an Ayurveda-led D2C wellness tea brand from India, featured on Shark Tank India, now expanding to US, UK, Canada, UAE, and Australia. In exactly 1-2 sentences, explain why {{6.companyName}} ({{6.country}}) could be a strong distribution or partnership candidate. Context about them: {{6.snippet}}. Be specific — mention what they do and how it aligns with Namhya's expansion."
    }
  ]
}
```
- Parse response: Yes
- The blurb is at: `{{10.choices[].message.content}}`

---

**Module 11 — Determine outreach channel**
- Module type: `Tools → Set variable`
- Variable: `outreachChannel`
- Logic: If Hunter found an email → "Email". If not but LinkedIn URL detected → "LinkedIn DM". Else → "Website Contact Form"
- Make formula: `{{if(7.data.emails[].value; "Email"; if(contains(6.companyWebsite; "linkedin"); "LinkedIn DM"; "Website Contact Form"))}}`

---

**Module 12 — Build lead object**
- Module type: `Tools → Set multiple variables`
- Map everything into clean fields:

| Field | Source |
|---|---|
| `fullName` | `{{7.data.emails[].first_name}} {{7.data.emails[].last_name}}` |
| `company` | `{{6.companyName}}` |
| `designation` | `{{7.data.emails[].position}}` |
| `country` | `{{6.country}}` |
| `city` | Leave blank (Brave Search API doesn't always give city) |
| `source` | `"Brave Search API"` |
| `email` | `{{7.data.emails[].value}}` |
| `linkedinUrl` | `""` (LinkedIn scraping out of scope for free) |
| `companyWebsite` | `{{6.companyWebsite}}` |
| `relevanceNote` | `{{10.choices[].message.content}}` |
| `outreachChannel` | `{{11.outreachChannel}}` |

---

**Module 13 — Save lead to backend**
- Module type: `HTTP → Make a request`
- Method: POST
- URL: `https://your-backend.onrender.com/api/leads`
- Headers:
  - `x-pipeline-secret` : `YOUR_SECRET`
  - `Content-Type` : `application/json`
- Body: `{{12}}` (the full lead object, serialised as JSON)
- Parse response: Yes

---

**Module 14 — Log pipeline run completion**
- Module type: `HTTP → Make a request`
- Method: POST
- URL: `https://your-backend.onrender.com/api/pipeline-runs/complete`
- Body:
```json
{
  "status": "completed",
  "triggeredBy": "schedule"
}
```
- This only runs after all leads are processed (place after the iterator ends)

---

### Scenario 2: "Warmup Ping" (Optional but recommended)
Render's free backend sleeps after 15 minutes of inactivity. Add a second Make scenario:
- Schedule: Every 10 minutes
- HTTP GET to `https://your-backend.onrender.com/api/health`
- This keeps your backend awake so pipeline doesn't fail on a cold start

---

## PART 2 — BACKEND (Node.js + Express + MongoDB)

### Folder Structure
```
/backend
  /models
    Lead.js
    PipelineRun.js
    User.js
  /routes
    auth.js          → /api/auth/*
    leads.js         → /api/leads/*
    analytics.js     → /api/analytics/*
    pipeline.js      → /api/pipeline-runs/*
  /middleware
    requireAuth.js       → verifies JWT for frontend calls
    requirePipeline.js   → verifies x-pipeline-secret header for Make.com calls
  server.js
  .env
```

---

### Environment Variables (.env)
```
MONGO_URI=mongodb+srv://YOUR_CLUSTER_STRING
JWT_SECRET=some_long_random_string_here
PIPELINE_SECRET=another_random_string_make_sends_this
PORT=5000
```

---

### Models

#### Lead.js
```js
const LeadSchema = new mongoose.Schema({
  fullName:       { type: String, default: '' },
  company:        { type: String, required: true },
  designation:    { type: String, default: '' },
  country: {
    type: String,
    enum: ['United States', 'United Kingdom', 'Canada', 'UAE', 'Australia'],
    required: true
  },
  city:           { type: String, default: '' },
  source:         { type: String, default: 'Brave Search API / Google Search' },
  email:          { type: String, default: '' },
  linkedinUrl:    { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  relevanceNote:  { type: String, default: '' },
  outreachChannel: {
    type: String,
    enum: ['Email', 'LinkedIn DM', 'WhatsApp', 'Website Contact Form'],
    default: 'Email'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'responded', 'converted', 'not_relevant'],
    default: 'new'
  },
  notes:        { type: String, default: '' },
  addedAt:      { type: Date, default: Date.now },
  lastUpdated:  { type: Date, default: Date.now }
});
```

#### PipelineRun.js
```js
const PipelineRunSchema = new mongoose.Schema({
  startedAt:    { type: Date, default: Date.now },
  completedAt:  { type: Date },
  leadsAdded:   { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  },
  triggeredBy:  { type: String, enum: ['schedule', 'manual'], default: 'schedule' }
});
```

#### User.js
```js
const UserSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, default: 'admin' }
});
```
Seed one user on first deploy using a setup script.

---

### All API Routes

#### Auth
```
POST /api/auth/login
  Body: { email, password }
  Returns: { token }  (JWT, 7-day expiry)

GET /api/auth/me
  Auth: JWT required
  Returns: { email, role }
```

#### Leads (JWT protected — frontend calls)
```
GET /api/leads
  Query params:
    page     (default: 1)
    limit    (default: 20)
    search   (searches fullName, company, email — regex)
    country  (exact match)
    status   (exact match)
    channel  (exact match — outreachChannel)
  Returns: { leads: [], total, page, pages }

POST /api/leads
  Auth: x-pipeline-secret header (Make.com calls this)
  Body: lead object
  Returns: { success: true, lead }

PUT /api/leads/:id
  Auth: JWT
  Body: { status?, notes? }
  Returns: updated lead

DELETE /api/leads/:id
  Auth: JWT
  Returns: { success: true }

GET /api/leads/check-duplicate
  Auth: x-pipeline-secret
  Query: ?email=some@email.com
  Returns: { exists: true/false }

GET /api/leads/export
  Auth: JWT
  Query: same filters as GET /api/leads
  Returns: CSV file download (Content-Type: text/csv)
  CSV columns: Name, Company, Designation, Country, City, Email,
               LinkedIn, Website, Channel, Status, Notes, Added Date
```

#### Analytics (JWT protected)
```
GET /api/analytics/summary
  Returns:
  {
    total: number,
    addedThisWeek: number,
    countriesCovered: number,  (distinct countries with leads)
    contacted: number,         (status !== 'new')
    byCountry: [{ country, count }],
    byStatus: [{ status, count }],
    byChannel: [{ channel, count }],
    byDay: [{ date, count }]   (last 14 days)
  }
```

#### Pipeline Runs (mixed auth)
```
POST /api/pipeline-runs/start
  Auth: x-pipeline-secret OR JWT (manual trigger from dashboard)
  Creates a new PipelineRun with status: 'running'
  Returns: { runId }

POST /api/pipeline-runs/complete
  Auth: x-pipeline-secret
  Body: { status, leadsAdded? }
  Finds the most recent 'running' run, updates it to completed
  Returns: { success: true }

GET /api/pipeline-runs
  Auth: JWT
  Returns: last 20 runs, newest first

GET /api/pipeline-runs/latest
  Auth: JWT
  Returns: most recent run object

GET /api/health
  No auth
  Returns: { status: 'ok', uptime }
  (Used by Make warmup ping to prevent Render sleep)
```

---

## PART 3 — FRONTEND DESIGN SYSTEM

### Visual Identity

**Subject:** Internal B2B lead management dashboard for a wellness brand founder.
**Audience:** The Namhya Foods founder and their intern — one user, high-stakes decisions.
**The page's single job:** Surface the right leads and make outreach feel effortless.

**Design direction:** Premium dark-mode data tool with Ayurvedic warmth.
Not the generic near-black + acid-green. Not the trendy terracotta cream.
The specific choice: deep ink backgrounds with jade and saffron accents —
jade for growth/action, saffron for energy/attention, rooted in Namhya's identity.
The feel is closer to Linear or Raycast than to a typical SaaS dashboard.

---

### Color Tokens
```
--color-bg:           #0D1117   Deep ink (blue-black undertone, not pure black)
--color-surface:      #161B27   Elevated surface — cards, panels
--color-surface-2:    #1E2436   Further elevated — modals, drawers, inputs
--color-border:       #262D40   Subtle cool border
--color-border-light: #1E2436   Very subtle — table row dividers

--color-jade:         #00C896   Primary action — buttons, links, active states
--color-jade-dim:     #00C89620 Jade at 12% opacity — hover backgrounds
--color-saffron:      #F4A836   Attention — warnings, badges, highlights
--color-saffron-dim:  #F4A83618 Saffron at 10% opacity

--color-text-primary: #F0F2F7   Near-white, warm undertone
--color-text-secondary:#A0A8BC  Medium grey — labels, captions
--color-text-muted:   #5C6478   Faded — metadata, disabled states

Status colors (all used as text + dim background combo):
--status-new:         #4F8EF7   Blue
--status-new-bg:      #4F8EF715
--status-contacted:   #F4A836   Saffron
--status-contacted-bg:#F4A83618
--status-responded:   #00C896   Jade
--status-responded-bg:#00C89618
--status-converted:   #22D3A0   Bright emerald
--status-converted-bg:#22D3A015
--status-not-relevant:#5C6478   Grey (same as muted text)
--status-not-relevant-bg:#5C647818
```

---

### Typography

**Display font: `Plus Jakarta Sans`**
Used for page titles, stat numbers, modal headings.
Character: slightly geometric, confident, premium without being cold.
Import from Google Fonts.
Weights used: 600, 700

**Body/UI font: `Inter`**
Used for all body copy, labels, table content, buttons.
Weights used: 400, 500, 600

**Monospace font: `JetBrains Mono`**
Used for email addresses, URLs, API keys, code snippets.
Weight: 400

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap');
```

**Type Scale:**
```
Display:    Plus Jakarta Sans, 700, 28px, line-height 1.2  → page titles
Heading:    Plus Jakarta Sans, 600, 20px, line-height 1.3  → section headings, stat labels
Body:       Inter, 400, 14px, line-height 1.6              → table cells, descriptions
Label:      Inter, 500, 12px, line-height 1.5, tracking +0.3px → uppercase labels, eyebrows
Button:     Inter, 600, 13px                               → all buttons
Mono:       JetBrains Mono, 400, 13px                      → emails, URLs
```

---

### Spacing System
```
4px  — micro gap (icon to label)
8px  — tight (badge padding, small gaps)
12px — compact (input padding Y, small card padding)
16px — standard (card padding, row gaps)
20px — comfortable (section gaps within a panel)
24px — loose (between cards, sidebar item gaps)
32px — section (between page sections)
48px — page-level (top bar height)
56px — sidebar item zone height
240px — sidebar width (fixed)
```

---

### Border Radius
```
4px  — inputs, table cells (tight, precise)
8px  — cards, panels, modals
12px — badges, pills
6px  — buttons
2px  — dividers, separator lines
```

---

### Shadows (dark-mode shadows are glow-based, not drop shadows)
```
--shadow-card:   0 0 0 1px var(--color-border), 0 2px 8px rgba(0,0,0,0.3)
--shadow-modal:  0 0 0 1px var(--color-border), 0 24px 48px rgba(0,0,0,0.5)
--shadow-jade:   0 0 16px rgba(0, 200, 150, 0.15)  → on primary buttons hover
```

---

### Signature Element: Pipeline Pulse

The single memorable design choice — a slim 48px fixed bar spanning the full top of every page.

```
┌──────────────────────────────────────────────────────────────────────┐
│  ●  Pipeline active · Last run 2h ago · +8 leads added  [▶ Run Now] │
└──────────────────────────────────────────────────────────────────────┘
```

The `●` dot:
- Jade green + CSS `@keyframes pulse` breathing animation → when last run was <24h ago
- Saffron + static → when last run had warnings or partial failures
- Muted grey → when no recent run

Background of bar: `#0D1117` with a barely-visible 1px bottom border in `#262D40`.
Text: Inter 500, 13px.
Run Now button: ghost style — `border: 1px solid var(--color-jade)`, jade text.

This is the founder's heartbeat for the pipeline. One glance tells them everything.

---

## PART 4 — LAYOUT & PAGES

### Global Layout (all pages share this shell)

```
┌────────────────────────────────────────────────────────────────────┐
│  PIPELINE PULSE BAR  (fixed, z-index 100, height 48px, full width) │
├──────────────┬─────────────────────────────────────────────────────┤
│              │                                                      │
│  SIDEBAR     │   PAGE CONTENT AREA                                 │
│  240px       │   padding: 32px 40px                                │
│  fixed       │   max-width: 1440px                                 │
│  height:     │   overflow-y: scroll                                │
│  100vh-48px  │                                                      │
│  top: 48px   │                                                      │
│              │                                                      │
└──────────────┴─────────────────────────────────────────────────────┘
```

### Sidebar Contents (top to bottom)
```
┌─────────────────────┐
│  Namhya             │  ← Logo text: Plus Jakarta Sans 700 18px, jade color
│  LeadFlow           │
│  ─────────────────  │  ← 1px border, color-border
│                     │
│  ● Dashboard        │  ← Active state: jade left border (3px), jade text, jade-dim bg
│  ○ Analytics        │  ← Inactive: muted text, no bg
│  ○ Pipeline         │
│                     │
│  ─────────────────  │
│                     │
│  ↑ bottom of sidebar│
│  founder@namhya.com │  ← Inter 12px, muted
│  [Log out]          │  ← Ghost small button
└─────────────────────┘
```

Sidebar background: `#0D1117` — same as page BG, no distinct sidebar bg.
Sidebar right border: 1px solid `#262D40`.

---

### Page 1: Dashboard (route: `/`)

This is the main page the founder uses daily.

**Layout (top to bottom):**

```
Page title area:
┌──────────────────────────────────────────────────────────────┐
│  Leads                         [↓ Export CSV]  [+ Add Lead] │
│  32 verified leads across 5 markets                          │
└──────────────────────────────────────────────────────────────┘

Stats bar (4 cards in a row):
┌────────────┐ ┌──────────────┐ ┌────────────────┐ ┌────────────┐
│ Total      │ │ This Week    │ │ Countries      │ │ Contacted  │
│            │ │              │ │                │ │            │
│ 32         │ │ +8           │ │ 5 / 5          │ │ 6          │
│ total leads│ │ added        │ │ markets covered│ │ in outreach│
└────────────┘ └──────────────┘ └────────────────┘ └────────────┘

Filter bar (one row):
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search by name, company or email...  [Country▾] [Status▾] [Channel▾] │
└─────────────────────────────────────────────────────────────┘

Leads table:
┌────────────────────────────────────────────────────────────────────────────────┐
│ [☐] CONTACT            COMPANY         COUNTRY    EMAIL         CHANNEL  STATUS │ ADDED   │ ···
├────────────────────────────────────────────────────────────────────────────────┤
│ [☐] John Smith         Wellness Corp   🇺🇸 US     john@...  [⧉] Email    ● New  │ Jul 22  │ ···
│     CEO                                                                         │         │
├────────────────────────────────────────────────────────────────────────────────┤
│ [☐] Priya Sharma       NaturalGoods    🇬🇧 UK     priya@... [⧉] LinkedIn  ● Cont.│ Jul 21  │ ···
│     Director                                                                    │         │
└────────────────────────────────────────────────────────────────────────────────┘

Pagination:
← Previous  [1]  [2]  [3]  Next →        Showing 1–20 of 32
```

**Stat card design detail:**
Each card: `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: 8px`, `padding: 20px`.
Left edge: `border-left: 3px solid var(--color-jade)`.
Number: Plus Jakarta Sans 700 32px, `var(--color-text-primary)`.
Label: Inter 500 12px uppercase tracking, `var(--color-text-muted)`.

**Table design detail:**
Header row: Inter 500 11px uppercase, tracking 0.5px, `var(--color-text-muted)`, no background.
Body rows: `border-bottom: 1px solid var(--color-border-light)`, `padding: 14px 16px`.
Row hover: `background: var(--color-jade-dim)` — subtle jade tint on hover, cursor pointer.
Name cell: Two lines — primary name in `var(--color-text-primary)` Inter 500 14px; designation below in `var(--color-text-muted)` Inter 400 12px.
Email cell: JetBrains Mono 13px + copy icon that appears on row hover. Click copies to clipboard and shows a small "Copied!" toast.
Status cell: `<StatusBadge>` component.
Country cell: Flag emoji + country abbreviation.
Actions cell (`···`): Opens a small dropdown with quick status options — so founder can mark "Contacted" without opening the modal.

**Empty state:**
When no leads match filters:
```
Centre of table area:
[Search icon, 40px, muted]
No leads match these filters
Try adjusting your search or run the pipeline to fetch more leads.
[▶ Run Pipeline] ← jade button
```

---

### Page 2: Analytics (route: `/analytics`)

```
Page title:
┌──────────────────────────────┐
│  Analytics                   │
│  Performance across markets  │
└──────────────────────────────┘

Top row — 2 charts side by side:
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│  Leads by Country               │  │  Outreach Channel Breakdown     │
│  [Horizontal bar chart]         │  │  [Donut chart]                  │
│  US  ████████████ 12            │  │         Email 60%               │
│  UK  ████████ 8                 │  │    LinkedIn 30%                 │
│  CA  █████ 5                    │  │       Other 10%                 │
│  UAE ████ 4                     │  │                                 │
│  AU  ███ 3                      │  │  [Legend inline in chart]       │
└─────────────────────────────────┘  └─────────────────────────────────┘

Bottom row — 2 charts side by side:
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│  Status Funnel                  │  │  Leads Added (Last 14 Days)     │
│  [Funnel/bar chart]             │  │  [Line chart]                   │
│  New        ██████████ 26       │  │     ╭─╮                        │
│  Contacted  ████ 6              │  │   ──╯  ╰──╮                    │
│  Responded  ██ 2                │  │           ╰──                  │
│  Converted  █ 1                 │  │  Jul 9  ...  Jul 22            │
└─────────────────────────────────┘  └─────────────────────────────────┘
```

Charts use Recharts library.
All chart colors: jade for primary data, saffron for highlights, muted greys for supporting data.
Chart backgrounds: `var(--color-surface)` card with `border: 1px solid var(--color-border)`.
Grid lines in charts: `var(--color-border)` — barely visible.
Tooltip: dark card with `var(--color-surface-2)` background, white text.

---

### Page 3: Pipeline (route: `/pipeline`)

```
Page title + trigger section:
┌────────────────────────────────────────────────────────────────┐
│  Pipeline                                                      │
│  Automated lead generation · Powered by Brave Search API + Hunter + Groq│
│                                                    [▶ Run Now] │
└────────────────────────────────────────────────────────────────┘

Pipeline steps visual (horizontal, static — just shows the flow):
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Brave Search API   │ →  │ Hunter   │ →  │ Groq     │ →  │ Filter   │ →  │ Dashboard│
│ Search   │    │ Email    │    │ Blurb    │    │ Dedupe   │    │ Save     │
│ Google   │    │ Lookup   │    │ Generate │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘

Run history table:
┌────────────────────────────────────────────────────────────────┐
│ RECENT RUNS                                                    │
├────────────────────────────────────────────────────────────────┤
│ DATE          LEADS ADDED   STATUS      TRIGGERED BY           │
│ Jul 22, 9:02  +8 leads      ● Completed Schedule               │
│ Jul 21, 9:00  +5 leads      ● Completed Schedule               │
│ Jul 20, 9:00  +0 leads      ⚠ Partial   Manual                 │
└────────────────────────────────────────────────────────────────┘
```

**Run Now button behaviour:**
1. Click → POST to Make.com webhook URL
2. Button changes to `● Running...` with jade pulse animation
3. Poll `/api/pipeline-runs/latest` every 5 seconds
4. When status = 'completed' → show toast "Pipeline complete · +N leads added"
5. Button returns to normal

---

### Page 4: Login (route: `/login`)

```
Full-page centered layout:

┌──────────────────────────────┐
│                              │
│   Namhya LeadFlow            │  ← Plus Jakarta Sans 700 28px
│   Founder's Command Centre   │  ← Inter 400 14px muted
│                              │
│   ┌──────────────────────┐   │
│   │ Email                │   │  ← Input with label above
│   └──────────────────────┘   │
│                              │
│   ┌──────────────────────┐   │
│   │ Password             │   │
│   └──────────────────────┘   │
│                              │
│   [     Sign In          ]   │  ← Jade filled button, full width
│                              │
└──────────────────────────────┘
```

Login card: `var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: 8px`, `padding: 40px`, `width: 380px`.
Page background: `var(--color-bg)` with very subtle radial gradient at center: `radial-gradient(ellipse at center, #161B27 0%, #0D1117 70%)`.
Inputs: `background: var(--color-surface-2)`, `border: 1px solid var(--color-border)`, `border-radius: 4px`, `padding: 10px 14px`, `font-size: 14px`.
Input focus: `border-color: var(--color-jade)`, `box-shadow: 0 0 0 3px var(--color-jade-dim)`.

---

### Lead Detail Modal (Drawer from right)

Triggered by clicking any table row.
Slides in from right: `transform: translateX(100%)` → `translateX(0)` with `transition: 0.25s ease`.
Overlay: `rgba(0,0,0,0.5)` backdrop, click to close.
Width: `440px` on desktop, full width on mobile.

```
┌────────────────────────────────────────────────┐
│ ← Close                       [● New ▾]        │  ← Header: back arrow + status dropdown
│ ──────────────────────────────────────────────  │
│                                                 │
│  John Smith                                     │  ← Plus Jakarta Sans 700 22px
│  CEO · Wellness Distribution Corp               │  ← Inter 400 14px muted
│                                                 │
│  CONTACT                                        │  ← Label: Inter 500 11px uppercase tracking muted
│  ──────────────────────────────────────────     │
│  Email      john@wellness.com        [⧉ Copy]  │  ← JetBrains Mono 13px
│  LinkedIn   Not found                           │
│  Website    wellness.com             [↗ Open]  │
│  Channel    Email                               │
│                                                 │
│  WHY THIS LEAD                                  │  ← Label
│  ──────────────────────────────────────────     │
│  "Wellness Corp operates a US-wide              │  ← Inter 400 14px, line-height 1.7
│   distribution network for health and           │    Groq-generated blurb displayed here
│   functional beverages, making them an          │
│   ideal channel partner for Namhya's            │
│   wellness teas in the American market."        │
│                                                 │
│  NOTES                                          │  ← Label
│  ──────────────────────────────────────────     │
│  ┌──────────────────────────────────────────┐   │
│  │ Add outreach notes, follow-ups, context  │   │  ← Textarea: auto-grows, saves on blur
│  └──────────────────────────────────────────┘   │
│  [Save Notes]                                   │  ← Small ghost button, right-aligned
│                                                 │
│  SOURCE & META                                  │
│  ──────────────────────────────────────────     │
│  Source:  Brave Search API / Google Search            │  ← Inter 12px muted
│  Added:   July 22, 2026                         │
│  Country: United States                         │
└────────────────────────────────────────────────┘
```

**Status dropdown in drawer:**
Click the status badge to open an inline dropdown:
```
● New
○ Contacted
○ Responded
○ Converted
○ Not Relevant
```
Selection auto-saves (PUT /api/leads/:id) and shows toast: "Status updated to Contacted"

---

## PART 5 — COMPONENT SPECS

### StatusBadge Component
```jsx
// Props: status = 'new' | 'contacted' | 'responded' | 'converted' | 'not_relevant'

const labels = {
  new: 'New',
  contacted: 'Contacted',
  responded: 'Responded',
  converted: 'Converted',
  not_relevant: 'Not Relevant'
};

// Style: pill shape, border-radius 12px, padding 4px 10px
// Background: matching --status-X-bg (10-15% opacity)
// Text: matching --status-X color, Inter 600 11px, uppercase tracking
// The dot: 6px circle, same color as text, margin-right 6px
```

### Toast Notifications
Position: bottom-right, 16px from corner.
Stack vertically if multiple.
Auto-dismiss after 3 seconds.
Variants:
- Success: jade left border
- Warning: saffron left border
- Error: red left border

Design: `background: var(--color-surface-2)`, `border: 1px solid var(--color-border)`, `border-radius: 8px`, `padding: 12px 16px`, shadow.

### Primary Button
```css
background: var(--color-jade);
color: #0D1117;            /* dark text on jade — better contrast */
font: Inter 600 13px;
border-radius: 6px;
padding: 9px 18px;
border: none;
cursor: pointer;
transition: opacity 0.15s, box-shadow 0.15s;

:hover {
  opacity: 0.9;
  box-shadow: var(--shadow-jade);
}
```

### Ghost Button
```css
background: transparent;
color: var(--color-jade);
border: 1px solid var(--color-jade);
font: Inter 600 13px;
border-radius: 6px;
padding: 8px 17px;
cursor: pointer;

:hover {
  background: var(--color-jade-dim);
}
```

### Input Fields
```css
background: var(--color-surface-2);
border: 1px solid var(--color-border);
border-radius: 4px;
color: var(--color-text-primary);
font: Inter 400 14px;
padding: 9px 12px;
outline: none;
transition: border-color 0.15s, box-shadow 0.15s;

:focus {
  border-color: var(--color-jade);
  box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.12);
}

::placeholder {
  color: var(--color-text-muted);
}
```

### Dropdown/Select
Use a custom dropdown (not native `<select>`) — native selects don't respect dark mode styling on all browsers.
Trigger: looks like an input with a chevron icon on right.
Menu: `background: var(--color-surface-2)`, `border: 1px solid var(--color-border)`, `border-radius: 8px`, `box-shadow: var(--shadow-modal)`.
Menu items: `padding: 8px 12px`, hover background `var(--color-jade-dim)`.

---

## PART 6 — MICRO-INTERACTIONS & ANIMATIONS

Keep animations purposeful. Only 3 places where motion adds real value:

**1. Pipeline Pulse dot**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.85); }
}
.pulse-dot { animation: pulse 2s ease-in-out infinite; }
```

**2. Lead Modal slide-in**
```css
.drawer {
  transform: translateX(100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer.open {
  transform: translateX(0);
}
```

**3. Row hover**
```css
tr:hover {
  background: var(--color-jade-dim);
  transition: background 0.1s ease;
}
```

No page-load animations. No scroll reveals. No skeleton loaders beyond what's necessary.
The premium feel comes from precision in spacing and type — not from effects.

---

## PART 7 — REACT COMPONENT TREE

```
App
├── AuthProvider (JWT context)
├── Router
│   ├── /login → <LoginPage />
│   └── <PrivateRoute>  (redirects to /login if no valid token)
│       └── <AppShell>
│           ├── <PipelinePulse />  (fixed top bar)
│           ├── <Sidebar />
│           └── <PageContent>
│               ├── / → <DashboardPage />
│               │   ├── <PageHeader title="Leads" />
│               │   ├── <StatsBar />
│               │   ├── <FilterBar />
│               │   ├── <LeadsTable />
│               │   │   ├── <TableRow /> × N
│               │   │   │   └── <StatusBadge />
│               │   │   └── <Pagination />
│               │   └── <LeadModal /> (conditional, slide-in drawer)
│               │       └── <StatusBadge />
│               ├── /analytics → <AnalyticsPage />
│               │   ├── <PageHeader title="Analytics" />
│               │   ├── <CountryBarChart />    (Recharts)
│               │   ├── <ChannelDonutChart />  (Recharts)
│               │   ├── <StatusFunnelChart />  (Recharts)
│               │   └── <LeadsOverTimeChart /> (Recharts)
│               └── /pipeline → <PipelinePage />
│                   ├── <PageHeader title="Pipeline" />
│                   ├── <PipelineFlowDiagram />  (static visual)
│                   ├── <RunNowButton />
│                   └── <RunHistoryTable />
```

---

## PART 8 — AUTH FLOW

1. User visits any route → `<PrivateRoute>` checks `localStorage.getItem('token')`
2. If no token → redirect to `/login`
3. User enters email + password → POST `/api/auth/login`
4. Server validates, returns JWT (7 day expiry)
5. Frontend stores JWT in `localStorage` + sets Axios default header: `Authorization: Bearer <token>`
6. All subsequent API calls automatically include the token
7. If any API call returns 401 → clear token + redirect to `/login`
8. Make.com calls never use JWT — they use `x-pipeline-secret` header instead (a static secret in your .env that Make.com is configured to send)

---

## PART 9 — BUILD ORDER + HOW TO PROMPT ANTIGRAVITY

Everything — backend and frontend — is built by Antigravity.
You give it this PRD in chunks. Never dump the whole thing at once.
Work in one Antigravity session throughout. Keep context alive.

---

### Before You Open Antigravity (30 mins)

Get all accounts and keys ready first. Antigravity will ask for them:

1. **MongoDB Atlas** → create free M0 cluster → copy the connection string
2. **Brave Search API** → api.search.brave.com → copy API key
3. **Hunter.io** → hunter.io → copy API key
4. **Groq** → console.groq.com → copy API key
5. **Render** → render.com → create account (deploy later)
6. **Vercel** → vercel.com → create account (deploy later)
7. **Make.com** → make.com → create account (build scenario separately, not via Antigravity)

---

### Day 1 — Backend via Antigravity

**Prompt 1 — Project scaffold**
> "Create a Node.js + Express backend project called `namhya-leadflow-backend`. Use ES modules (import/export). Install: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv. Set up the folder structure exactly as follows:
>
> /models → Lead.js, PipelineRun.js, User.js
> /routes → auth.js, leads.js, analytics.js, pipeline.js
> /middleware → requireAuth.js, requirePipeline.js
> server.js
> .env.example
>
> In server.js: connect to MongoDB via MONGO_URI env var, enable CORS for all origins, parse JSON bodies, mount all route files, add a GET /api/health route that returns { status: 'ok', uptime: process.uptime() }. Do not build any routes yet — just the scaffold."

---

**Prompt 2 — Models**
> "Now build all three Mongoose models. Use this exact schema:
>
> [paste the full Models section from Part 2 of this PRD]
>
> Add a pre-save hook on Lead that sets lastUpdated to Date.now on every save."

---

**Prompt 3 — Middleware**
> "Build two middleware files:
>
> requireAuth.js — reads the Authorization header, verifies a JWT using JWT_SECRET env var, attaches decoded user to req.user, returns 401 if missing or invalid.
>
> requirePipeline.js — reads the x-pipeline-secret header, compares it to PIPELINE_SECRET env var, returns 403 if it doesn't match. This is for Make.com calls only."

---

**Prompt 4 — Auth routes**
> "Build /routes/auth.js with two endpoints:
>
> POST /api/auth/login — accepts { email, password }, finds user in DB, compares password with bcryptjs, returns { token } signed with JWT_SECRET, 7-day expiry. Return 401 if credentials are wrong.
>
> GET /api/auth/me — protected by requireAuth middleware. Returns { email, role } from req.user.
>
> Also create a one-time seed script at /scripts/seed.js that creates an admin user with email 'admin@namhyafoods.com' and password 'namhya2026' — hash the password with bcryptjs before saving."

---

**Prompt 5 — Leads routes**
> "Build /routes/leads.js. All routes except POST /api/leads and GET /api/leads/check-duplicate use requireAuth. Those two use requirePipeline instead. Here are all the endpoints:
>
> [paste the full Leads API section from Part 2 of this PRD]
>
> For GET /api/leads/export — build a CSV string manually using Array.join, set Content-Type to text/csv and Content-Disposition to attachment; filename=namhya-leads.csv, then res.send the string.
>
> For GET /api/leads — implement pagination using .skip() and .limit(). Build the search filter using $regex on fullName, company, and email fields (case-insensitive). Return { leads, total, page, pages }."

---

**Prompt 6 — Pipeline + Analytics routes**
> "Build /routes/pipeline.js and /routes/analytics.js using these specs:
>
> [paste the full Pipeline Runs and Analytics API sections from Part 2 of this PRD]
>
> For GET /api/analytics/summary — use MongoDB aggregation ($group) to get byCountry, byStatus, byChannel arrays. For byDay — filter leads added in last 14 days, group by date string."

---

**Prompt 7 — Test and fix**
> "Review all routes and check: are all error cases handled with try/catch? Does every route return consistent JSON? Is CORS configured correctly? Add any missing error handling."

---

**Prompt 8 — Deploy instructions**
> "Generate a render.yaml deploy config for this backend and a .env.example file listing all required environment variables with placeholder values."

At this point: push to GitHub → connect to Render → add env vars → deploy.
Test `/api/health` from the live Render URL before moving on. Do NOT proceed to Make.com until this works.

---

### Day 1 — Make.com Scenario (build manually, not Antigravity)

Make.com is a visual drag-and-drop tool — Antigravity can't build it for you. Do this yourself:

1. Open Make.com → New scenario → name it "Namhya Lead Pipeline"
2. Build all 14 modules in order from Part 1 of this PRD
3. Use your live Render URL for all HTTP calls to the backend
4. Test with ONE query first (hardcode one search string, skip the iterator temporarily)
5. Confirm lead appears in MongoDB → confirm GET /api/leads returns it
6. Re-enable the iterator and all 5 country queries
7. Run full pipeline → get 25-30 leads in DB
8. Build the warmup ping scenario (separate scenario, just a schedule + GET /api/health)

---

### Day 2 — Frontend via Antigravity

Start a new Antigravity session or continue the same one. Either way, paste the design system tokens first.

**Prompt 9 — Project scaffold + design system**
> "Create a React app using Vite called `namhya-leadflow-frontend`. Install: axios, react-router-dom, recharts. 
>
> Create a file src/styles/tokens.css with these exact CSS custom properties:
>
> [paste the entire Color Tokens and Typography sections from Part 3 of this PRD]
>
> Import tokens.css in main.jsx. Set box-sizing: border-box and margin: 0 globally. Import Plus Jakarta Sans, Inter, and JetBrains Mono from Google Fonts in index.html.
>
> Create src/api/axios.js — an Axios instance with baseURL from import.meta.env.VITE_API_URL. Add a request interceptor that reads token from localStorage and adds Authorization: Bearer header. Add a response interceptor that catches 401 and redirects to /login.
>
> Do not build any components yet."

---

**Prompt 10 — Auth**
> "Build src/context/AuthContext.jsx — a React context that stores the JWT token, exposes login(token) and logout() functions, and checks localStorage on mount to restore session. Export a useAuth() hook.
>
> Build src/pages/LoginPage.jsx exactly as specced in the PRD login page section. On submit call POST /api/auth/login, store the token via AuthContext, redirect to /.
>
> Build src/components/PrivateRoute.jsx — redirects to /login if no token in AuthContext."

---

**Prompt 11 — App shell**
> "Build src/components/layout/AppShell.jsx — the main shell with:
> - Fixed top PipelinePulse bar (48px, full width, z-index 100)
> - Fixed left Sidebar (240px, height calc(100vh - 48px), top 48px)
> - Scrollable main content area filling the rest
>
> Build src/components/layout/Sidebar.jsx with the nav items (Dashboard, Analytics, Pipeline) and user info + logout at the bottom. Active state: 3px jade left border + jade-dim background.
>
> Build src/components/layout/PipelinePulse.jsx — fetches GET /api/pipeline-runs/latest on mount and every 30 seconds. Shows: animated jade dot + last run time + leads added + Run Now button. The dot pulses if last run was <24h ago, is grey otherwise. Run Now button sends POST to the Make.com webhook URL stored in VITE_MAKE_WEBHOOK_URL env var."

---

**Prompt 12 — Dashboard page**
> "Build src/pages/DashboardPage.jsx with these child components:
>
> src/components/dashboard/StatsBar.jsx — fetches GET /api/analytics/summary, renders 4 stat cards (Total Leads, This Week, Countries Covered, Contacted). Each card has a jade left border, Plus Jakarta Sans 700 32px number, Inter 500 12px uppercase label.
>
> src/components/dashboard/FilterBar.jsx — controlled inputs for search (debounced 300ms), country dropdown, status dropdown, channel dropdown. Export CSV button calls GET /api/leads/export and triggers file download. On any filter change emit the new filter state up to DashboardPage.
>
> src/components/dashboard/LeadsTable.jsx — fetches GET /api/leads with current filters and page. Renders table with columns: Name+Designation, Company, Country (flag emoji), Email (mono font + copy icon on hover), Channel, Status badge, Added date, Actions menu. Row hover shows jade-dim background. Click row → open LeadModal. Actions menu has quick status change.
>
> src/components/common/StatusBadge.jsx — pill component, props: status string. Maps each status to its color token. Uses dim background + full color text.
>
> src/components/common/Pagination.jsx — prev/next + page numbers. Props: page, pages, onPageChange."

---

**Prompt 13 — Lead modal**
> "Build src/components/dashboard/LeadModal.jsx — a drawer that slides in from the right (440px wide, full height, position fixed, top 48px). 
>
> Layout exactly as specced in the Lead Detail Modal section of the PRD.
>
> Behaviour:
> - Status dropdown auto-saves on change via PUT /api/leads/:id, shows toast 'Status updated'
> - Notes textarea saves on blur via PUT /api/leads/:id, shows toast 'Notes saved'  
> - Email copy button copies to clipboard and briefly shows 'Copied!' text
> - Website and LinkedIn open in new tab
> - Clicking the backdrop closes the drawer
> - Slide animation: translateX(100%) → translateX(0) with 0.25s cubic-bezier(0.4, 0, 0.2, 1)
>
> Build src/components/common/Toast.jsx — bottom-right positioned, auto-dismisses after 3 seconds, variants: success (jade border), warning (saffron border), error (red border). Stack multiple toasts vertically."

---

**Prompt 14 — Analytics page**
> "Build src/pages/AnalyticsPage.jsx — fetches GET /api/analytics/summary on mount.
>
> Four Recharts charts in a 2x2 grid:
> 1. Horizontal BarChart — leads by country. Bars in jade (#00C896).
> 2. PieChart (donut) — outreach channel breakdown. Jade/saffron/muted slices. innerRadius 60, outerRadius 90.
> 3. BarChart — status funnel (New → Contacted → Responded → Converted). Bars in jade, descending order.
> 4. LineChart — leads added per day, last 14 days. Line in jade, dot on each point.
>
> All charts: CartesianGrid with var(--color-border), Tooltip with var(--color-surface-2) background. Each chart wrapped in a card (surface background, border, 8px radius, 20px padding)."

---

**Prompt 15 — Pipeline page**
> "Build src/pages/PipelinePage.jsx.
>
> Top section: page title + subtitle + Run Now button. Run Now sends POST to VITE_MAKE_WEBHOOK_URL, button changes to '● Running...' with jade pulse animation, polls GET /api/pipeline-runs/latest every 5 seconds until status is 'completed', then shows toast and resets button.
>
> Pipeline flow diagram: a static horizontal row of 5 boxes connected by arrows: Brave Search → Hunter Email → Groq Blurb → Dedupe Filter → Dashboard. Boxes use surface-2 background with jade border. Arrows are just → symbols in jade color.
>
> Run history: fetches GET /api/pipeline-runs, shows table with columns: Date, Leads Added, Status (badge), Triggered By, Duration (completedAt - startedAt in seconds)."

---

**Prompt 16 — Wire everything together**
> "Set up React Router in App.jsx:
> - / → DashboardPage (PrivateRoute)
> - /analytics → AnalyticsPage (PrivateRoute)
> - /pipeline → PipelinePage (PrivateRoute)
> - /login → LoginPage
>
> Wrap the app in AuthProvider. All private routes render inside AppShell.
>
> Create .env with:
> VITE_API_URL=https://your-backend.onrender.com
> VITE_MAKE_WEBHOOK_URL=your-make-webhook-url
>
> Test the full flow locally: login → see leads → filter → open modal → change status → check analytics."

---

**Prompt 17 — Deploy**
> "Create a vercel.json config that sets the build output to dist and rewrites all routes to index.html for client-side routing. List all environment variables I need to set in Vercel."

Push to GitHub → connect to Vercel → add env vars → deploy → done.

---

### After Deploy — Stitch MCP Polish

Once everything works and is live, use Stitch MCP to refine the visual layer. Focus on: card shadows, hover transitions, empty states, mobile responsiveness of the table.

---

### Total Antigravity Prompts: 17
Backend: Prompts 1-8
Frontend: Prompts 9-17
Each prompt is scoped tightly — don't combine them or Antigravity loses focus.

---

## PART 10 — THE 1-PAGE SUBMISSION NOTE

**How the pipeline works**
Make.com runs on a daily schedule (and on-demand via webhook). It queries Brave Search API for wellness, food distribution, and Ayurveda-adjacent companies across 5 target markets. Each search result is enriched with verified contact emails via Hunter.io's domain search API. Groq's free inference API (Mixtral 8x7B model) generates a 2-sentence, company-specific relevance note for Namhya Foods. A duplicate check against the live database prevents re-importing known leads. Everything lands in MongoDB and surfaces in a custom React dashboard — no manual data entry.

**Tools used and why**
Brave Search API — most generous free SERP API (2,000 queries/month recurring), clean JSON, no card required.
Hunter.io — confirmed free API access, best-in-class for domain-based email discovery.
Groq — 14,400 free requests/day permanently, runs Mixtral 8x7B (open-source Mistral), faster and more free than any alternative.
Make.com — 1,000 free ops/month, visual workflow builder, no self-hosting required.
MongoDB Atlas + Express + React — custom dashboard because it signals more initiative than Airtable.

**How to scale to 200+ leads/month**
Add more Brave Search API search queries targeting niche verticals (functional beverages, ethnic grocery chains, supplement importers). Upgrade Hunter.io to Starter ($34/month, 1,000 credits). Schedule Make.com to run 3x/week. Add a second Make scenario that scrapes LinkedIn company pages for decision-maker profiles. Expand target countries to Singapore and Germany as Namhya grows.

**Limitations encountered and workarounds**
Brave Search API returns page titles and URLs, not structured contact data — Hunter.io fills the gap by extracting emails from company domains.
Hunter.io free tier is 50 credits/month — prioritised the highest-relevance results from each Brave Search API query to avoid waste.
Groq has a per-minute token limit — added a 1-second delay between Groq calls in Make to stay within 6,000 TPM.
Render's free backend sleeps after inactivity — added a Make warmup ping scenario that hits `/api/health` every 10 minutes.

---

*Built by Akshat Singh · Founder's Office Intern Assignment · Namhya Foods · July 2026*
