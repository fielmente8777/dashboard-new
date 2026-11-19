# Booking engine deep links

Open **Booking Engine > Deep Links** for the currently selected property.
The route is `/dashboard/client/<hotel-id>/booking-engine/deep-links`.

## Test locally without pushing a production branch

1. From `gian`, run `npm run dev:deep-links`.
2. Keep these settings in the ignored `dashboard-new/.env.development.local`:

   ```dotenv
   VITE_BOOKING_DEEP_LINK_API_URL=http://localhost:8000/api/v1/booking/deep-links
   VITE_BOOKING_DEEP_LINK_DEMO=true
   ```

3. Restart the dashboard's `npm run dev` process. Open **Booking Engine > Deep
   Links** and check for the **Local demo mode** banner.
4. Save a link and use **Preview prefilled form** to test the complete flow.

The demo backend saves isolated test data in `gian/.local/booking-deep-links.json`
and simulates authentication; no MongoDB, production push or deployment is needed.
This tests the feature's behavior, not real account authentication. Other
dashboard API services retain their current configuration. These development
settings are not loaded by production builds. Localhost links work only on the
same computer. Remove the two variables and restart to switch back to the hosted
backend.

## Generate and hand off a link

1. Enter the public page hosting the hotel's booking engine, including its hotel
   path for a chain. An existing `pid` in this URL is retained; the optional public
   property ID field overrides it. A dashboard hotel ID is never substituted for a
   booking-engine public property ID automatically.
2. Choose the booking step, language and currency supported by the destination.
   Room selection is the default (`p=base&c=availability`).
3. Leave fixed dates off for a permanent website button. Enable them for a
   specific stay. Enter adults and, if needed, each child age-group ID and count
   from that hotel's booking engine configuration.
4. Optionally enter a promo code, preferred rate, campaign parameters or the
   advanced session/package/room/rate IDs.
5. Enter a link name and optional expiry, then **Save & generate link**. This
   stores it in the backend and returns a reusable public share URL. Use
   **Preview prefilled form** to load its dates/guests from the public API into a
   demo Book Now form inside the dashboard.
6. Copy the URL or escaped HTML anchor. **Client handoff** downloads a text file
   containing both, plus date-expiry and website integration guidance.

**Saved links** are stored in MongoDB by account and property, available across
browsers. Use **Copy link**, **Test prefill**, **Use settings** (to create a new
link), and **Disable/Enable**. Disabled, expired or past-stay links cannot be
resolved or followed through their share URL. Changing options invalidates the
current output until a new link is saved. Previously generated links keep their
original settings. Browser-only drafts from the first version are not migrated.

## URL contract

This implementation follows the supplied
`Deep_Link_URL_Structure_for_Booking_Engine.pdf`:

- `br=SESSION_ID,PACKAGE_ID,ROOM_ID,RATE_ID,ADULTS,CHILDREN`.
  Missing IDs remain `_` so all positional fields are preserved.
- Children use `GROUP-ID:COUNT`, separated by commas. IDs are entered from the
  hotel's configuration, not inferred from ages. No groups produces the PDF's
  no-children sentinel `0:0`.
- `d=YYYY-MM-DD,YYYY-MM-DD` is included only when fixed dates are enabled.
- `p=base` with `c=property-select|search|availability|item|summary|checkout|thank-you`.
  All documented steps can be generated; later steps may require existing
  booking state at the destination.
- Optional `lg`, `cu`, `fo=true`, `pc`, `pr`, and
  `utm_source`, `utm_medium`, `utm_campaign`.
- The rate ID within `br` and preferred rate `pr` are distinct settings. The
  destination applies preferred-rate validity and promo eligibility rules.
- Native URL serialization encodes commas and colons exactly once. Managed
  parameters from a pasted URL are replaced/removed by current form values;
  unrelated parameters and hotel paths are preserved.

## Backend and destination integration

The `gian` Express backend implements `/api/v1/booking/deep-links`:

| Method / path | Purpose |
| --- | --- |
| `POST /?hid=...` | Authenticated save; backend revalidates all settings |
| `GET /?hid=...&page=1` | Authenticated list, 20 links per page |
| `PATCH /:code?hid=...` | Authenticated enable/disable with `{active: boolean}` |
| `GET /public/:code` | Public normalized prefill data, without account credentials |
| `GET /go/:code` | Public redirect to the stored destination with PDF parameters |
| `GET /prefill.js` | Client form integration script |

The dashboard defaults to the existing `NODE_BASE_URL` backend setting.
`VITE_BOOKING_DEEP_LINK_API_URL` can override only this feature's API address.
Deploy the backend routes before using server saving in the hosted dashboard.
The regular backend uses the existing MongoDB connection, JWT middleware and
account/property profile; the standalone local demo uses its own test store.

The public share URL redirects to the stored destination with the PDF's query
parameters and an `eazotel_link` code. If a client's form does not already parse
deep links, **Client form integration** provides the script and
`data-eazotel-field` mappings to install once on that form. The script resolves
the saved link without authentication, verifies the destination origin/path,
sets initial form values, and supports popups mounted later. Guest edits are not
overwritten. Custom React/date-picker widgets can consume
`window.EazotelBookingPrefill` or the `document` event `eazotel:prefill` and update
their state directly. The same snippet is included in the handoff download.

The demo stays inside the Eazotel dashboard and does not submit a reservation.
No Manratan or other client website is modified. A real destination needs either
native support for the PDF parameters or this form integration.

The generator rejects malformed URLs, embedded login credentials, common auth
query parameters, invalid dates/occupancies and duplicate child groups. The
engine must independently validate public property/room/rate IDs, availability,
pricing, discounts and any existing session. Public URLs must not contain
dashboard tokens or guest personal information.

For an availability form on a client's website, generate `d` and `br` from the
visitor's current selections on submit. A fixed link does not read those form
values automatically. Template placeholders from the PDF's saved-search example
are not live guest data and should be resolved by the sending application.

## Validation

Run the URL-contract tests:

```sh
node --test tests/bookingDeepLink.test.mjs
```

Run focused lint and the dashboard production build:

```sh
npx --no-install eslint src/utils/bookingDeepLink.js src/pages/BookingEngine/DeepLinks.jsx
npm run build
```

Browser checks cover generation, copy controls, HTML escaping, handoff download,
stale output, validation, saved links across refresh, property isolation,
enable/disable, API-backed prefill preview, and desktop/mobile layouts. The
client script is checked against a separate fixture page and popup fields.
These checks use the actual API router with an injected test store, not a live
MongoDB database or booking engine.

Backend API tests (from `gian`):

```sh
node --test tests/bookingDeepLink.test.cjs
```

The new backend modules pass focused TypeScript checking. Full backend type
checking currently reports existing errors in `gmb.controller.ts`,
`gmb.route.ts`, and `googleClient.ts`; resolve those before a full production
backend build. No deployment or live database write is performed by these tests.
