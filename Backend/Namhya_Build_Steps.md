# Namhya LeadFlow — Exact Build Steps
### Do this in order. Don't skip ahead.

---

## PHASE 0 — Setup (30 mins, before opening Antigravity)

Get every account and key ready now. You'll paste these into Antigravity prompts later.

**Step 1 — MongoDB Atlas**
- Go to mongodb.com/atlas → create free account
- Create new project → Build a cluster → M0 Free
- Choose AWS, any region
- Create a database user (username + password, save these)
- Under Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
- Click Connect → Compass or Drivers → copy the connection string
- Replace `<password>` in the string with your DB user password
- Save this: `MONGO_URI=mongodb+srv://...`

**Step 2 — Tavily (you already have this from Qrux)**
- Go to app.tavily.com → log in → API Keys → copy your key
- Save this: `TAVILY_API_KEY=...`

**Step 3 — Hunter.io**
- Go to hunter.io → sign up free
- Dashboard → API → copy your API key
- Save this: `HUNTER_API_KEY=...`

**Step 4 — Groq**
- Go to console.groq.com → sign up free (Google login works)
- API Keys → Create API Key → copy it
- Save this: `GROQ_API_KEY=...`

**Step 5 — Accounts only (no action needed yet)**
- Create account at render.com (deploy backend here later)
- Create account at vercel.com (deploy frontend here later)
- Create account at make.com (build scenario here later)

**Step 6 — Download the PRD**
- Open the Namhya_LeadFlow_PRD.md file
- Keep it open in a separate tab/window the whole time
- You'll copy-paste sections from it into Antigravity

---

## PHASE 1 — Backend via Antigravity (Day 1, ~3 hours)

Open Antigravity. Start a new project. Call it `namhya-leadflow-backend`.

---

### Step 7 — Prompt 1: Scaffold

Say this to Antigravity:

> "Create a Node.js + Express backend project. Use CommonJS (require/module.exports). Install these packages: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv.
>
> Create this exact folder structure:
> - /models → Lead.js, PipelineRun.js, User.js (empty files for now)
> - /routes → auth.js, leads.js, analytics.js, pipeline.js (empty files for now)
> - /middleware → requireAuth.js, requirePipeline.js (empty files for now)
> - /scripts → seed.js (empty for now)
> - server.js
> - .env.example
>
> In server.js:
> - Load dotenv
> - Connect to MongoDB using process.env.MONGO_URI
> - Enable CORS for all origins
> - Parse JSON request bodies
> - Mount routes at /api/auth, /api/leads, /api/analytics, /api/pipeline-runs
> - Add GET /api/health that returns { status: 'ok', uptime: process.uptime() }
> - Listen on process.env.PORT or 5000
>
> In .env.example list these variables with empty values:
> MONGO_URI=
> JWT_SECRET=
> PIPELINE_SECRET=
> PORT=5000"

✅ Verify: folder structure exists, server.js compiles without errors, /api/health works locally

---

### Step 8 — Prompt 2: Models

Copy the entire Models section from the PRD (the Lead.js, PipelineRun.js, User.js schemas). Then say:

> "Now build all three Mongoose models using these exact schemas. Paste into the relevant files:
>
> [paste models section from PRD here]
>
> Also add a pre-save middleware on the Lead model that sets lastUpdated = Date.now() every time a lead is saved."

✅ Verify: no syntax errors, all fields and enums match the PRD

---

### Step 9 — Prompt 3: Middleware

> "Build two middleware files:
>
> requireAuth.js — reads the Authorization header, extracts the Bearer token, verifies it with jwt.verify using process.env.JWT_SECRET. If valid, attach decoded payload to req.user and call next(). If missing or invalid, return 401 with { error: 'Unauthorized' }.
>
> requirePipeline.js — reads req.headers['x-pipeline-secret']. If it matches process.env.PIPELINE_SECRET exactly, call next(). Otherwise return 403 with { error: 'Forbidden' }."

✅ Verify: both files export a middleware function

---

### Step 10 — Prompt 4: Auth routes

> "Build /routes/auth.js with these endpoints:
>
> POST /login
> - Accept { email, password } in body
> - Find user in DB by email
> - Use bcrypt.compare to check password against stored hash
> - If valid, return { token } — sign with JWT_SECRET, expiresIn: '7d'
> - If invalid, return 401 { error: 'Invalid credentials' }
>
> GET /me
> - Protected by requireAuth middleware
> - Return { email: req.user.email, role: req.user.role }
>
> Also build /scripts/seed.js:
> - Connect to MongoDB using MONGO_URI from .env
> - Check if user with email 'admin@namhyafoods.com' already exists
> - If not, create one with password 'namhya2026' hashed with bcrypt (saltRounds: 10)
> - Log 'Admin user created' and disconnect
>
> Mount this router in server.js at /api/auth."

✅ Verify: POST /api/auth/login returns a token, run seed.js to create the admin user

---

### Step 11 — Prompt 5: Leads routes

Copy the full Leads API section from the PRD. Then say:

> "Build /routes/leads.js with all these endpoints. Use requireAuth for all routes EXCEPT POST / and GET /check-duplicate which use requirePipeline.
>
> [paste full leads API spec from PRD]
>
> Important details:
> - GET / must support pagination with .skip() and .limit(). Return { leads, total, page, pages }.
> - Search filter uses $regex on fullName, company, email — case-insensitive.
> - GET /check-duplicate checks if any lead exists with matching email. Returns { exists: true/false }.
> - GET /export builds a CSV string manually. Set headers Content-Type: text/csv and Content-Disposition: attachment; filename=namhya-leads.csv. Columns: Name, Company, Designation, Country, City, Email, LinkedIn, Website, Channel, Status, Notes, Added Date.
>
> Mount at /api/leads in server.js."

✅ Verify in Postman:
- POST /api/leads (with x-pipeline-secret header) creates a test lead
- GET /api/leads (with JWT) returns it
- GET /api/leads/check-duplicate returns { exists: true } for same email

---

### Step 12 — Prompt 6: Pipeline + Analytics routes

Copy the Pipeline Runs and Analytics sections from the PRD. Then say:

> "Build /routes/pipeline.js and /routes/analytics.js.
>
> [paste pipeline runs API spec from PRD]
> [paste analytics API spec from PRD]
>
> For POST /pipeline-runs/start — create a new PipelineRun document with status 'running'. Protect with both requireAuth OR requirePipeline (accept either header).
>
> For POST /pipeline-runs/complete — find the most recent PipelineRun with status 'running', update it to 'completed', set completedAt to now. Protect with requirePipeline.
>
> For GET /analytics/summary — use MongoDB aggregation:
> - $group by country for byCountry array
> - $group by status for byStatus array
> - $group by outreachChannel for byChannel array
> - Filter leads from last 14 days, $group by date string for byDay array
> - Count leads added in last 7 days for addedThisWeek
>
> Mount at /api/pipeline-runs and /api/analytics in server.js."

✅ Verify:
- POST /api/pipeline-runs/start creates a run document
- POST /api/pipeline-runs/complete updates it
- GET /api/analytics/summary returns all fields

---

### Step 13 — Prompt 7: Error handling review

> "Review all route files. Make sure:
> 1. Every route handler is wrapped in try/catch with a 500 error response
> 2. All error responses use consistent format { error: 'message here' }
> 3. Mongoose validation errors are caught and return 400 not 500
> 4. No route is missing its middleware
>
> Fix anything that's missing."

✅ Verify: test a bad request to each route, confirm you get a clean error response

---

### Step 14 — Prompt 8: Render deploy config

> "Create two files:
>
> 1. A render.yaml with:
> - service type: web
> - runtime: node
> - build command: npm install
> - start command: node server.js
> - environment variables listed (with empty values): MONGO_URI, JWT_SECRET, PIPELINE_SECRET, PORT
>
> 2. A Procfile with:
> web: node server.js"

**Now deploy:**
- Push the backend project to a GitHub repo
- Go to render.com → New → Web Service → connect your GitHub repo
- Add all 4 environment variables in Render dashboard:
  - `MONGO_URI` = your Atlas connection string
  - `JWT_SECRET` = any long random string (mash your keyboard)
  - `PIPELINE_SECRET` = another random string (save this — Make.com will need it)
  - `PORT` = 5000
- Deploy → wait for it to go live
- Visit `https://your-app.onrender.com/api/health` — must return `{ status: 'ok' }`
- Run seed script once: SSH into Render shell or run locally pointing to Atlas URI: `node scripts/seed.js`

✅ **DO NOT move to Make.com until /api/health is live on Render**

---

## PHASE 2 — Make.com Scenario (Day 1, ~2 hours, manual — NOT Antigravity)

**Important:** You do NOT need the frontend to test Make.com. You trigger runs manually from inside Make.com during this phase. The webhook URL you copy at the end just gets saved to your `.env` file — you'll paste it into the frontend later in Phase 3. Continue here without the frontend.

Make.com is a visual drag and drop tool. Each "module" is a box you add to a canvas and connect left to right. Think of it like a flowchart where each box does one thing — call an API, loop through results, filter bad data, etc.

---

### Step 15 — Create the scenario

- Log into make.com → click **Create a new scenario**
- Name it: `Namhya Lead Pipeline`
- You'll see an empty canvas with a `+` button in the center
- The PRD (Part 1) has all 14 modules listed — keep it open on the side

---

### Step 16 — Add Module 1: Schedule Trigger

This is what kicks off the pipeline automatically every day.

- Click the `+` in the center → search "Schedule" → select **Schedule**
- Set interval: Every **1 Day**
- Time: **03:30 UTC** (= 9 AM IST)
- Click OK

You'll also add a Webhook trigger for the "Run Now" button in your dashboard later. For now just the Schedule is fine.

---

### Step 17 — Add Module 2: Set your search queries

This module creates a list of 5 Google search queries — one per country.

- Click the `+` after Module 1 → search "Set variable" → pick **Tools → Set variable**
- Variable name: `queries`
- Variable value — paste this exact array:
```
[
  "ayurveda wellness tea distributor importer United States contact email",
  "herbal health food broker importing agency United Kingdom wellness contact",
  "organic wellness CPG distribution partner Canada ayurveda contact",
  "health food importing agency Dubai UAE wellness herbal contact",
  "ayurveda supplement natural food distributor Australia contact email"
]
```
- Click OK

---

### Step 18 — Add Module 3: Loop through each query

This makes the next modules run once per query string (5 times total).

- Click `+` → search "Iterator" → pick **Flow Control → Iterator**
- In the Array field: click the variable picker → select `queries` from Module 2 (it'll look like `{{2.queries}}`)
- Click OK

After this module, every following module runs 5 times — once per country query.

---

### Step 19 — Add Module 4: Call Tavily to search Google

This module calls Tavily's API with your query and gets back a list of companies.

- Click `+` → search "HTTP" → pick **HTTP → Make a request**
- Fill in:
  - URL: `https://api.tavily.com/search`
  - Method: **POST**
  - Body type: **Raw**
  - Content type: **JSON (application/json)**
  - Request content (paste this):
```json
{
  "api_key": "YOUR_TAVILY_KEY",
  "query": "{{3.value}}",
  "max_results": 10,
  "search_depth": "advanced"
}
```
  - `{{3.value}}` = the current query string from the iterator (Module 3)
  - Toggle **Parse response** to ON
- Click OK

What comes back: a `results` array. Each item in the array is one company Tavily found — it has a `title` (company/page name), `url` (their website), and `content` (a paragraph describing what they do).

---

### Step 20 — Add Module 5: Loop through each result

Tavily returns up to 10 companies per query. This module makes the next steps run once per company.

- Click `+` → **Flow Control → Iterator**
- Array field: click the variable picker → from Module 4 (Tavily), select `results`
  - It'll show as `{{4.results}}`
- Click OK

After this, every following module runs once per company result.

---

### Step 21 — Add Module 6: Pull out the company details

This module extracts the 3 fields you care about from each Tavily result and stores them as clean variables.

- Click `+` → **Tools → Set multiple variables**
- Add these 3 variables:

| Variable name | Value to set |
|---|---|
| `companyName` | Click the field → from Module 5 (Iterator), pick `title`. Then in the field also wrap it: `{{replace(replace(5.value.title; " - LinkedIn"; ""); " \| "; " ")}}` — this strips LinkedIn junk from the title |
| `companyWebsite` | From Module 5 → pick `url` → shows as `{{5.value.url}}` |
| `companyDescription` | From Module 5 → pick `content` → shows as `{{5.value.content}}` |

- Click OK

---

### Step 22 — Add Module 7: Find the company's email via Hunter

Hunter takes a company's website domain and returns any email addresses it knows for that company.

- Click `+` → **HTTP → Make a request**
- Fill in:
  - URL: `https://api.hunter.io/v2/domain-search`
  - Method: **GET**
  - Under **Query String** add these params:
    - `domain` → value: `{{6.companyWebsite}}` (the URL from Module 6)
    - `api_key` → value: `YOUR_HUNTER_KEY`
    - `limit` → value: `3`
  - Parse response: **ON**
- Click OK

What comes back: a `data` object with an `emails` array. Each email has `value` (the email address), `first_name`, `last_name`, `position`, and `confidence` (0-100 score of how sure Hunter is).

You want the first email where confidence > 70. If Hunter finds nothing, the email field will just be empty — that's fine.

---

### Step 23 — Add Module 8: Check if this lead already exists

Before saving, check your backend to see if this email is already in the database. Prevents duplicates.

- Click `+` → **HTTP → Make a request**
- Fill in:
  - URL: `https://YOUR-RENDER-URL.onrender.com/api/leads/check-duplicate`
  - Method: **GET**
  - Query String: add param `email` → value: `{{7.data.emails[].value}}`
    - The `[]` means "first item in the array" in Make syntax
  - Headers: add `x-pipeline-secret` → your PIPELINE_SECRET value
  - Parse response: **ON**
- Click OK

Returns either `{ "exists": true }` or `{ "exists": false }`.

---

### Step 24 — Add Module 9: Filter out duplicates

Only continue if this is a new lead.

- Click `+` → **Flow Control → Filter**
- Label: `Only new leads`
- Condition:
  - Left side: `{{8.exists}}` (the exists field from Module 8)
  - Operator: **Equal to**
  - Right side: type `false`
- Click OK

If `exists` is true → this branch stops here. The lead is skipped.
If `exists` is false → continues to the next module.

---

### Step 25 — Add Module 10: Generate relevance note with Groq

Groq takes the company name + description and writes a 1-2 sentence explanation of why they're a good fit for Namhya Foods.

- Click `+` → **HTTP → Make a request**
- Fill in:
  - URL: `https://api.groq.com/openai/v1/chat/completions`
  - Method: **POST**
  - Headers:
    - `Authorization` → `Bearer YOUR_GROQ_KEY`
    - `Content-Type` → `application/json`
  - Body type: **Raw**, Content type: **JSON**
  - Request content:
```json
{
  "model": "mixtral-8x7b-32768",
  "max_tokens": 120,
  "temperature": 0.4,
  "messages": [
    {
      "role": "system",
      "content": "You write short, specific business notes. No fluff. Always name the company and be specific about why they fit."
    },
    {
      "role": "user",
      "content": "Namhya Foods is an Ayurveda-led D2C wellness tea brand from India expanding to US, UK, Canada, UAE, Australia. In 1-2 sentences explain why {{6.companyName}} could be a distribution or partnership candidate. Context: {{6.companyDescription}}"
    }
  ]
}
```
  - Parse response: **ON**
- Click OK

The blurb text comes back at: `choices` → first item → `message` → `content`. In Make syntax: `{{10.choices[].message.content}}`

---

### Step 26 — Add Module 11: Set outreach channel

Quick logic to decide whether to reach out via email or LinkedIn.

- Click `+` → **Tools → Set variable**
- Variable name: `outreachChannel`
- Value:
```
{{if(7.data.emails[].value; "Email"; "LinkedIn DM")}}
```
This means: if Hunter found an email → "Email", otherwise → "LinkedIn DM"

---

### Step 27 — Add Module 12: Save the lead to your backend

POST the full lead object to your Express API.

- Click `+` → **HTTP → Make a request**
- Fill in:
  - URL: `https://YOUR-RENDER-URL.onrender.com/api/leads`
  - Method: **POST**
  - Headers:
    - `x-pipeline-secret` → your PIPELINE_SECRET value
    - `Content-Type` → `application/json`
  - Body type: **Raw**, Content type: **JSON**
  - Request content:
```json
{
  "fullName": "{{7.data.emails[].first_name}} {{7.data.emails[].last_name}}",
  "company": "{{6.companyName}}",
  "designation": "{{7.data.emails[].position}}",
  "country": "{{3.value}}",
  "city": "",
  "source": "Tavily",
  "email": "{{7.data.emails[].value}}",
  "linkedinUrl": "",
  "companyWebsite": "{{6.companyWebsite}}",
  "relevanceNote": "{{10.choices[].message.content}}",
  "outreachChannel": "{{11.outreachChannel}}"
}
```
  - Parse response: **ON**
- Click OK

---

### Step 28 — Add Module 13: Add a Webhook trigger for manual runs

This lets your frontend's "Run Now" button trigger the pipeline.

- Go back to the very start of your scenario
- Click the **Schedule** module → click the three dots → **Add another trigger**
- Or right-click the canvas → **Add module** before Module 1
- Search "Webhooks" → **Webhooks → Custom webhook**
- Click **Add** → name it `run-now` → click Save
- Make will generate a URL like `https://hook.eu1.make.com/abc123xyz`
- **Copy this URL and save it** → this goes in your frontend `.env` as `VITE_MAKE_WEBHOOK_URL`
- You don't need the frontend yet — just save the URL somewhere safe for now

---

### Step 29 — Add Module 14: Log the pipeline run as complete

After all leads are processed, tell your backend the run finished.

- Click `+` at the very end (after the iterator finishes) → **HTTP → Make a request**
- Fill in:
  - URL: `https://YOUR-RENDER-URL.onrender.com/api/pipeline-runs/complete`
  - Method: **POST**
  - Headers: `x-pipeline-secret` → your PIPELINE_SECRET
  - Body:
```json
{ "status": "completed", "triggeredBy": "schedule" }
```
- Click OK

---

### Step 30 — Test with ONE country first

Don't run all 5 countries yet — save your API credits.

- In Module 2 (Set variable), temporarily change the queries array to just ONE query:
```
["ayurveda wellness tea distributor importer United States contact email"]
```
- Click **Run once** (bottom left of the canvas)
- Watch each module light up as it executes
- If a module goes red → click it to see the error
- After it finishes → go to MongoDB Atlas → Collections → leads → check if a lead appeared
- Also check in Postman: GET `https://your-render-url.onrender.com/api/leads` with your JWT header → should return the lead

Common errors at this stage:
- Module 4 red → check your Tavily key is correct
- Module 7 red → check Hunter key, check the domain field is mapping correctly
- Module 12 red → check your Render URL and PIPELINE_SECRET header match exactly

---

### Step 31 — Run the full pipeline

Once the single test works:
- Put all 5 country queries back in Module 2
- Click **Run once** again
- Wait 3-5 minutes for it to finish
- Check MongoDB → should have 20-30 leads
- Manually Google 3-4 of the companies to confirm they're real

---

### Step 32 — Create the Keepalive scenario (prevents Render sleeping)

- Click **Create a new scenario** → name it `Namhya Keepalive`
- Add **Schedule** trigger → every **10 minutes**
- Add **HTTP → Make a request** → GET `https://YOUR-RENDER-URL.onrender.com/api/health`
- Turn it ON (toggle at bottom left)
- Done — this keeps your backend awake so the pipeline never hits a cold-start timeout

---

✅ **Phase 2 done when:** MongoDB has 25-30 real leads, you've verified a few manually, webhook URL is saved. Now go to Phase 3 (frontend).

**The webhook URL (`VITE_MAKE_WEBHOOK_URL`) just goes into your frontend `.env` file in Step 21. You don't need to paste it anywhere right now.**

---

## PHASE 3 — Frontend via Antigravity (Day 2, ~4 hours)

Start a new Antigravity project. Call it `namhya-leadflow-frontend`.
Keep the PRD open — you'll paste from the design system section.

---

### Step 21 — Prompt 9: Scaffold + design system

> "Create a React app using Vite. Install: axios, react-router-dom, recharts.
>
> Create src/styles/tokens.css with these exact CSS variables:
>
> [paste the entire Color Tokens section from PRD Part 3]
>
> Import tokens.css in src/main.jsx. Add this global CSS:
> *, *::before, *::after { box-sizing: border-box; }
> body { margin: 0; background: var(--color-bg); color: var(--color-text-primary); }
>
> In index.html, add this Google Fonts import in the <head>:
> <link href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap' rel='stylesheet'>
>
> Create src/api/axios.js:
> - Axios instance with baseURL from import.meta.env.VITE_API_URL
> - Request interceptor: read token from localStorage, add Authorization: Bearer header if exists
> - Response interceptor: if 401, clear localStorage and redirect to /login
>
> Create .env:
> VITE_API_URL=https://your-render-url.onrender.com
> VITE_MAKE_WEBHOOK_URL=https://hook.make.com/your-webhook-id
>
> Do not build any components yet."

✅ Verify: `npm run dev` works, no errors, fonts loading

---

### Step 22 — Prompt 10: Auth

> "Build src/context/AuthContext.jsx:
> - React context with token state
> - On mount: check localStorage for 'token', set it if found
> - login(token) function: saves to localStorage + sets state
> - logout() function: removes from localStorage + sets state to null
> - Export useAuth() hook
>
> Build src/pages/LoginPage.jsx:
> - Centered card layout (380px wide, surface background, 1px border, 8px radius, 40px padding)
> - Page background: color-bg with radial gradient (surface color at center fading out)
> - 'Namhya LeadFlow' title in Plus Jakarta Sans 700 28px jade color
> - 'Founder's Command Centre' subtitle in Inter 400 14px muted color
> - Email input + Password input (styled per PRD input spec)
> - Sign In button (full width, jade background, dark text, Inter 600 13px)
> - On submit: POST to /api/auth/login, on success call login(token) from AuthContext, redirect to /
> - Show error message below button if login fails
>
> Build src/components/PrivateRoute.jsx:
> - If no token in AuthContext → redirect to /login
> - Otherwise render children"

✅ Verify: login page looks right, logging in with admin@namhyafoods.com + namhya2026 redirects to /

---

### Step 23 — Prompt 11: App shell + Pipeline Pulse

> "Build the app shell layout in src/components/layout/AppShell.jsx:
> - Fixed PipelinePulse bar at top (height 48px, full width, z-index 100, background color-bg, border-bottom 1px color-border)
> - Fixed Sidebar on left (width 240px, height calc(100vh - 48px), top 48px, background color-bg, border-right 1px color-border)
> - Main content area: margin-left 240px, margin-top 48px, padding 32px 40px, min-height calc(100vh - 48px), overflow-y auto
>
> Build src/components/layout/Sidebar.jsx:
> - Top: 'Namhya LeadFlow' in Plus Jakarta Sans 700 18px jade color, padding 24px 20px
> - Divider: 1px color-border
> - Nav items: Dashboard (/), Analytics (/analytics), Pipeline (/pipeline)
> - Each item: Inter 500 14px, padding 12px 20px, cursor pointer
> - Active item (use useLocation to detect): border-left 3px solid jade, background color-jade-dim, color jade
> - Inactive: color text-secondary, no border
> - Bottom: user email in Inter 12px muted + Logout button (ghost small) that calls logout() from AuthContext
>
> Build src/components/layout/PipelinePulse.jsx:
> - GET /api/pipeline-runs/latest on mount and every 30 seconds
> - Left side: animated dot + text 'Last run X ago · +N leads added'
> - Dot: 8px circle, jade color, pulse animation if last run < 24h, grey if older or no runs
> - Right side: 'Run Now' ghost button (jade border + text)
> - Run Now: POST to VITE_MAKE_WEBHOOK_URL, button shows '● Running...' while polling, poll GET /api/pipeline-runs/latest every 5s until status = completed, then show toast
>
> CSS for pulse animation:
> @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
> .pulse-dot { animation: pulse 2s ease-in-out infinite; }"

✅ Verify: sidebar highlights correct nav item, Pipeline Pulse bar shows across all pages

---

### Step 24 — Prompt 12: Dashboard + table

> "Build src/pages/DashboardPage.jsx and these child components:
>
> src/components/common/StatusBadge.jsx:
> - Props: status (string)
> - Renders a pill: border-radius 12px, padding 4px 10px, Inter 600 11px uppercase
> - Color mapping (text + dim background):
>   new → #4F8EF7 text + #4F8EF715 bg
>   contacted → #F4A836 text + #F4A83618 bg
>   responded → #00C896 text + #00C89618 bg
>   converted → #22D3A0 text + #22D3A015 bg
>   not_relevant → #5C6478 text + #5C647818 bg
> - Small dot (6px circle, same color) before the label
>
> src/components/dashboard/StatsBar.jsx:
> - Fetch GET /api/analytics/summary on mount
> - Four cards in a CSS grid (4 columns), gap 16px
> - Each card: background color-surface, border 1px color-border, border-radius 8px, padding 20px, border-left 3px solid jade
> - Number: Plus Jakarta Sans 700 32px color-text-primary
> - Label: Inter 500 11px uppercase tracking-wide color-text-muted
> - Cards: Total Leads (summary.total), This Week (+summary.addedThisWeek), Countries Covered (summary.countriesCovered / 5), Contacted (summary.contacted)
>
> src/components/dashboard/FilterBar.jsx:
> - Row with gap 12px, margin-bottom 16px
> - Search input (flex: 1, styled per PRD token spec, placeholder 'Search by name, company or email...')
> - Debounce search input 300ms before emitting change
> - Country select dropdown (custom styled, not native select): All / United States / United Kingdom / Canada / UAE / Australia
> - Status select: All / new / contacted / responded / converted / not_relevant (display capitalized)
> - Channel select: All / Email / LinkedIn DM / WhatsApp / Website Contact Form
> - Export CSV button (ghost style, amber/saffron border + text) — calls GET /api/leads/export with current filters and triggers file download
> - On any filter change, call onFilterChange prop with { search, country, status, channel }
>
> src/components/dashboard/LeadsTable.jsx:
> - Props: filters object + onLeadClick callback
> - Fetch GET /api/leads on mount and whenever filters change
> - Table columns: Name+Designation | Company | Country (flag emoji + name) | Email | Channel | Status | Added | Actions
> - Name cell: full name Inter 500 14px + designation Inter 400 12px muted below
> - Email cell: JetBrains Mono 13px + copy icon that appears on row hover, click copies to clipboard
> - Status cell: StatusBadge component
> - Country cell: flag emoji + abbreviated name (US, UK, CA, UAE, AU)
> - Added cell: formatted date (Jul 22)
> - Actions cell: '···' that opens small dropdown with status options for quick change
> - Row hover: background color-jade-dim, cursor pointer, transition 0.1s
> - Click row → call onLeadClick with lead data
> - Empty state: centered icon + 'No leads match these filters' + 'Run Pipeline' button
>
> src/components/common/Pagination.jsx:
> - Props: page, pages, onPageChange
> - Previous / page numbers / Next
> - Current page highlighted in jade
>
> DashboardPage.jsx combines: page header + StatsBar + FilterBar + LeadsTable + Pagination + LeadModal (conditionally rendered)"

✅ Verify: leads table shows your real leads from MongoDB, filtering works, status badges look correct

---

### Step 25 — Prompt 13: Lead modal

> "Build src/components/dashboard/LeadModal.jsx:
>
> A drawer that slides in from the right. Position: fixed, top: 48px, right: 0, width: 440px, height: calc(100vh - 48px), background: color-surface-2, border-left: 1px solid color-border, z-index: 50, overflow-y: auto.
>
> Slide animation: when open prop is true, transform: translateX(0). When false: translateX(100%). Transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1).
>
> Semi-transparent backdrop behind drawer: position fixed, inset 0, top 48px, background rgba(0,0,0,0.5), z-index 49. Click backdrop to close.
>
> Layout inside drawer (padding 24px):
> 1. Header row: back arrow/close icon on left, StatusBadge (clickable — opens status dropdown) on right
> 2. Name (Plus Jakarta Sans 700 22px) + designation · company (Inter 400 14px muted) below
> 3. Section 'CONTACT' (label style: Inter 500 11px uppercase tracking muted):
>    - Email: JetBrains Mono 13px + copy icon — click copies, shows 'Copied!' briefly
>    - LinkedIn: show URL or 'Not found' + open in new tab icon
>    - Website: domain + open in new tab icon
>    - Channel: text value
> 4. Section 'WHY THIS LEAD':
>    - relevanceNote text, Inter 400 14px, line-height 1.7, color text-secondary
> 5. Section 'NOTES':
>    - Textarea (background color-surface, border color-border, 4px radius, width 100%, min-height 80px, auto-grows)
>    - Saves on blur via PUT /api/leads/:id with { notes: value }
>    - Shows 'Notes saved' toast on success
> 6. Section 'SOURCE & META':
>    - Source, Added date, Country in Inter 12px muted
>
> Status dropdown in header:
> - Click the StatusBadge → shows inline dropdown with all 5 status options
> - Selecting one: PUT /api/leads/:id with { status }, show 'Status updated' toast, update badge immediately
>
> Build src/components/common/Toast.jsx:
> - Fixed position: bottom 16px, right 16px, z-index 200
> - Stack multiple toasts vertically with 8px gap
> - Each toast: background color-surface-2, border 1px color-border, border-radius 8px, padding 12px 16px, min-width 240px
> - Left border 3px: jade for success, saffron for warning, red for error
> - Auto-dismiss after 3 seconds with fade-out
> - Build a useToast() hook that components can call: toast.success('msg'), toast.warning('msg'), toast.error('msg')"

✅ Verify: click a table row → drawer slides in, copy email works, status change updates badge, toast appears

---

### Step 26 — Prompt 14: Analytics page

> "Build src/pages/AnalyticsPage.jsx:
>
> Fetch GET /api/analytics/summary on mount.
>
> Layout: 2x2 grid of chart cards, gap 24px. Each card: background color-surface, border 1px color-border, border-radius 8px, padding 20px.
>
> Chart 1 — Leads by Country (top left):
> - Recharts BarChart, horizontal layout
> - Data: summary.byCountry array
> - Bars: fill #00C896 (jade)
> - CartesianGrid: stroke #262D40
> - Tooltip: contentStyle background #1E2436, border 1px #262D40
>
> Chart 2 — Outreach Channel (top right):
> - Recharts PieChart, donut style (innerRadius: 60, outerRadius: 90)
> - Data: summary.byChannel
> - Colors: ['#00C896', '#F4A836', '#5C6478', '#4F8EF7']
> - Labels on segments showing percentage
>
> Chart 3 — Status Funnel (bottom left):
> - Recharts BarChart, vertical bars
> - Data: summary.byStatus in order: new, contacted, responded, converted
> - Bars: fill #00C896
>
> Chart 4 — Leads Over Time (bottom right):
> - Recharts LineChart
> - Data: summary.byDay (last 14 days)
> - Line: stroke #00C896, strokeWidth 2, dot fill #00C896
> - Area fill below line: #00C89620
>
> All charts: height 220px, ResponsiveContainer width 100%."

✅ Verify: all 4 charts render with real data, tooltips work on hover

---

### Step 27 — Prompt 15: Pipeline page

> "Build src/pages/PipelinePage.jsx:
>
> Top section:
> - Page title 'Pipeline' (Plus Jakarta Sans 700 28px) + subtitle 'Automated lead generation · Tavily + Hunter + Groq' (Inter 400 14px muted)
> - 'Run Now' jade button on the right
> - Run Now behaviour: POST to import.meta.env.VITE_MAKE_WEBHOOK_URL, button switches to '● Running...' with jade pulse dot, poll GET /api/pipeline-runs/latest every 5s, when status = 'completed' show toast 'Pipeline complete', reset button
>
> Pipeline steps diagram (static, horizontal row):
> - 5 boxes connected by → arrows
> - Tavily Search → Hunter Email → Groq Blurb → Dedupe Filter → Dashboard
> - Each box: background color-surface-2, border 1px color-jade, border-radius 8px, padding 12px 16px, Inter 500 13px text
> - Arrows: jade color, Inter 600 16px, margin 0 8px
>
> Run history:
> - Heading 'Recent Runs' (Inter 600 16px)
> - Fetch GET /api/pipeline-runs on mount
> - Table: Date | Leads Added | Status | Triggered By | Duration
> - Status: StatusBadge (running = saffron, completed = jade, failed = red)
> - Duration: show in seconds if <60s, minutes if longer
> - Empty state: 'No pipeline runs yet. Click Run Now to start.'"

✅ Verify: page renders, run now button triggers Make webhook (check Make.com history), run history shows past runs

---

### Step 28 — Prompt 16: Router + wire everything

> "Set up the full app in src/App.jsx using React Router:
>
> Wrap everything in AuthProvider (from AuthContext).
>
> Routes:
> - /login → LoginPage (public)
> - / → DashboardPage (wrapped in PrivateRoute, rendered inside AppShell)
> - /analytics → AnalyticsPage (PrivateRoute + AppShell)
> - /pipeline → PipelinePage (PrivateRoute + AppShell)
> - Any unknown route → redirect to /
>
> AppShell wraps the page content with the sidebar + pulse bar.
>
> Make the ToastProvider available globally so any component can call useToast()."

✅ Full flow test:
- Open app → redirects to /login
- Login → goes to /
- See leads in table
- Click lead → modal slides in
- Change status → toast confirms
- Go to /analytics → charts show data
- Go to /pipeline → run history shows
- Click Run Now → triggers pipeline

---

### Step 29 — Prompt 17: Deploy config

> "Create a vercel.json file:
> {
>   'rewrites': [{ 'source': '/(.*)', 'destination': '/' }]
> }
>
> This makes client-side routing work on Vercel.
>
> Also list all environment variables I need to add in Vercel dashboard."

**Now deploy frontend:**
- Push to GitHub
- Go to vercel.com → New Project → import repo
- Add environment variables:
  - `VITE_API_URL` = your Render backend URL
  - `VITE_MAKE_WEBHOOK_URL` = your Make.com webhook URL
- Deploy

✅ Open the Vercel URL → test full flow from fresh tab (no localStorage)

---

## PHASE 4 — Final Checks (30 mins)

**Step 30 — Verify leads are real**
Manually Google 5-6 of your leads. Check the company exists. Check the website works. If some are junk (bad Tavily results), delete them from the dashboard.

**Step 31 — Run pipeline one more time**
Trigger via the dashboard Run Now button. Confirm new leads land in real-time.

**Step 32 — UI polish with Stitch MCP**
Open Stitch, connect it to your Vercel URL. Focus on:
- Card hover states
- Table responsiveness
- Empty states
- Mobile view of the dashboard

**Step 33 — Write the 1-page note**
Use the template at the bottom of the PRD. Fill in:
- Your actual Render URL
- Actual lead count
- Any real limitations you actually hit

**Step 34 — Submit**
Send Diya:
- Live dashboard URL (Vercel link)
- Login: admin@namhyafoods.com / namhya2026
- Attached 1-page PDF note

---

## Summary

| Phase | What | Time |
|---|---|---|
| 0 | Accounts + API keys | 30 mins |
| 1 | Backend via Antigravity (Prompts 1-8) | 3 hrs |
| — | Deploy backend to Render | 20 mins |
| 2 | Make.com scenario (manual) | 2 hrs |
| — | Run pipeline, get 25-30 leads | 30 mins |
| 3 | Frontend via Antigravity (Prompts 9-17) | 4 hrs |
| — | Deploy frontend to Vercel | 15 mins |
| 4 | Final checks + 1-page note | 1 hr |
| **Total** | | **~11 hrs across 2 days** |
