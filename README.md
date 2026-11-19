# Eazotel hotel dashboard (dashboard-new)

The web dashboard hotel owners and their teams use every day: leads, calls, WhatsApp and
other chats, marketing, SEO and analytics, booking engine and reservations, guest requests,
the website CMS, settings and billing.

- **Stack:** React 19 + Vite, React Router 7 (data loaders), Redux Toolkit + RTK Query,
  Tailwind 4. Plain JavaScript (a few `.ts` files).
- **Hosting:** Vercel (`vercel.json` sends every path to `index.html`).
- **Branch:** active work is on `dashboard-v-2`.

---

## 1. Run it locally

```bash
npm install
cp .env.example .env     # optional: every value falls back to production
npm run dev              # http://localhost:5173
```

`npm run build` builds into `dist/`, `npm run lint` runs ESLint.

---

## 2. Backends

The dashboard calls several backends. **Never mix them up:** a feature broke before because it
called nexon for a route only gian has.

| Name in code | Backend | Default URL | Env |
|---|---|---|---|
| `core` | **nexon** (Python): login, profile (`getuser`), CMS, booking engine, contacts | `https://nexon.eazotel.com` | `VITE_CORE_API_URL` |
| `node` | **gian** (Node): leads, calls, WhatsApp, Meta, Google, SEO, AI, notifications, subscription, onboarding | `https://gian-1eve.onrender.com` | `VITE_NODE_API_URL` |
| `salesAgent` | AI sales agent | `https://ai-sales-agent-o4wi.onrender.com` | `VITE_SALES_AGENT_API_URL` |
| `grm` | HMSBackend (guest requests) | `https://hmsbackend-7pyp.onrender.com` | `VITE_GRM_API_URL` |
| `app` | **gian-new**: plans, payments, auto-renew (`redux/api/billingApi.js`) | `https://gn.eazotel.com` | `VITE_APP_API_URL` |
| WebSocket | gian, same host | `wss://gian-1eve.onrender.com` | `VITE_WS_URL` |

Both nexon and gian are being replaced by **gian-new**. Until a path moves there (behind
nexon's nginx, same URL), nothing changes here.

`src/config/env.js` is the only place that holds URLs and public keys. Import from it; never
hard-code a URL in a page. Everything `VITE_*` ends up in the browser, so never put a secret
there. Other values in `.env.example`: Google client id, onboarding URL, widget script URLs,
Razorpay key ids, weather and Maps keys, `VITE_SUPPORT_EMAIL` / `VITE_SUPPORT_PHONE` (shown on
the renew screen).

---

## 3. How it is built

### Project layout

```text
src/
  main.jsx, App.css, index.css
  Navigation/router.jsx      every route, with its loader
  routes/paths.js            every URL (ROUTES outside the dashboard, PAGES inside /dashboard/client/:hid)
  routes/dashboardRoutes.jsx
  Protected/
    protectedLoader.js       runs before a dashboard page: token check, loads the session, picks the hotel, onboarding redirect
    staffAccessLoader.js     /staff-access: signs Eazotel staff in from the admin console
  layout/DashboardLayout.jsx sidebar + navbar + subscription lock + balance alert
  redux/
    api/baseApi.js           one RTK Query API; each endpoint picks its backend
    api/*Api.js              one file per area (leads, calls, whatsapp, meta, seo, bookingEngine, …)
    slice/, session.js, Store
  pages/                     one folder per feature (Leads, Calls, ConversationalTool, SEO, BookingEngine, Grm, CMS, Setting(s), Wallet, …)
  components/                shared UI (ui/ = Dialog, Dropdown, DatePicker, SettingsCard …), Navbar, Sidebar, Notifications
  config/env.js              URLs and public keys
  utils/                     session, dates, phone numbers, CSV, …
```

### Rules

- **API calls** go through RTK Query in `redux/api/`. Pick the backend per endpoint with
  `extraOptions: { service: "node" }` (default `core`), and `skipAuth: true` for public ones.
- **Any 401 signs the user out** (`baseApi.js`). A backend must never pass on a third
  party's 401 (Exotel, Google …).
- **Links** use the helpers in `routes/paths.js`, never a hand-written `/dashboard/client/...`.
- **Tenancy:** `ndid` = the account, `hid` = the hotel location (in the URL). A URL for another
  hotel than the selected one ends the session.
- **Session:** the token is kept in a cookie (read by the route guard) and in localStorage (read
  by API calls) (`utils/session.js`).

---

## 4. Recent work (2026-10-20 → 2026-11-05)

| Area | What changed |
|---|---|
| **Staff access** | New `/staff-access` route. The admin console's **Open account** sends staff here with a one-hour hotel token after `#` (never sent to a server). `staffAccessLoader` clears any earlier session, stores the token, removes it from the address bar and opens the dashboard |
| **Subscription lock** | `SubscriptionLock` covers the dashboard when the subscription's end date has passed, or staff paused / expired it in the admin console (`staffStop`). It re-checks every minute and offers **Contact support** (email / WhatsApp from `VITE_SUPPORT_*`). Integrations and the Wallet → Subscription page show the same state |
| **Follow-ups** | Leads and calls get a follow-up date and time (`FollowUpDialog`). Picking the follow-up stage waits until the date is saved. gian sends reminders 10 minutes before and on time |
| **Meta leads** | **Refresh Meta leads** pulls a chosen date range again (gian bulk import) |
| **Calling balance** | `BalanceAlertDialog` pops up when gian says the Exotel balance is low or used up; the Exotel panel handles both old and new balance formats |
| **Notifications** | Notification centre with sound and visual alert in the navbar, settings per type, browser push (`public/sw-push.js`), live updates over the WebSocket |
| **Notification settings** | Settings → Notifications rebuilt (alert matrix per lead source, email / WhatsApp, call follow-up). Eazotel staff can edit the same settings from the admin console |
| **WhatsApp chat** | A failed message shows Meta's reason and a **Retry**, which replaces the failed message instead of adding another |
| **Mobile layout** | Dialogs can open as a bottom sheet on phones (`sheetOnPhone`); card lists for calls and bookings; responsive booking filters |
| **Settings** | Settings pages rebuilt on `SettingsCard` (profile, hotels, links, lead webhooks, marketing email, password) |
| **SEO, AI, integrations** | Local SEO and Website SEO screens, AI training (custom rules, Voice AI tab), integration health and detail pages |
| **Blank profiles** | Accounts with an empty profile are sent to onboarding instead of a broken dashboard (`getUserNdid`, `hasBlankProfile`) |

---

## 5. Plans, payments and app access

- **Plans page** (`/dashboard/client/:hid/plans`, `pages/Billing/PlansPage.jsx`; the old `/plans?plan=PRO&cycle=12` link from the website redirects there) is the one page to buy, renew and upgrade, inside the dashboard layout. The lock screen never covers it. It has two modes, **Renew my plan** (current plan, add-ons ticked) and **Upgrade or change plan** (every plan). The layout follows the page's own width (Tailwind container queries), so it fits beside the sidebar; on phones and tablets a bottom bar keeps the total and Pay in reach. It offers: billing cycle, plan cards (included apps, limits), add-on apps, extra seats, offer code, auto-renew, and an order summary priced by gian-new.  The payment flow is `usePlanCheckout.js` (Razorpay checkout, then confirm; a second window authorises auto-renew).
- **Settings → Subscription** shows the plan, auto-renew switch, which apps are on and why (in plan / add-on / trial), limits and every payment.
- **App access:** `config/entitlements.js` maps pages to the app that unlocks them. The sidebar hides apps the plan doesn't include, and opening one by URL shows "isn't in your plan" (`FeatureLock`). The source is the subscription's `appAccess`, which gian-new rebuilds after every payment.
- The lock screen's Renew / Upgrade buttons open `/plans`.

## 6. Known gaps

- The owner **client switcher** (`components/Sidebar/hooks/useClientAccounts.js`) still calls
  nexon's `/admin/switch-account`. That path is retired in gian-new (always 403), so the switcher
  stops working once nginx sends it there. Staff should use the admin console's **Open account**.
- After signing in, the dashboard doesn't return to `/plans` when the website sent someone there; they open it again from Settings or the lock screen.
- Team-member and property limits are shown, not enforced.
- Website and chatbot form leads come from nexon, which ignores the staff chatbot / leads
  switches until those paths move to gian-new.
