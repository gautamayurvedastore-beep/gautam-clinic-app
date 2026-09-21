# Gautam Ayurveda — Patient App

A React + Vite frontend for the Gautam Clinic patient mobile app, wired to
the `mobileapi` PHP backend, and packaged for iOS/Android with Capacitor.

Design tokens ported 1:1 from `DESIGN.md` (the "AyurClinical Holistic
Interface" system) and the 4 Stitch screens you generated (Home, OTP
verification, Appointments, Prescriptions).

---

## 1. What's in here

```
src/
  api/
    client.js        fetch wrapper: API key header, Bearer token, error handling
    endpoints.js      one function per backend endpoint (sendOtp, bookAppointment, ...)
  context/
    AuthContext.jsx   holds the logged-in patient + token, checked on app start
  components/
    Icon.jsx          bundled icon set (lucide-react) — see note below
    Button.jsx, StatusBadge.jsx, TopBar.jsx, BottomNav.jsx, AppLayout.jsx, ProtectedRoute.jsx
  pages/
    auth/MobileEntry.jsx      mobile number entry
    auth/VerifyOtp.jsx        4-digit OTP screen
    auth/Register.jsx         new-patient registration form
    Home.jsx                  dashboard
    Appointments.jsx          upcoming/past list, cancel
    BookAppointment.jsx       3-step book/reschedule flow
    Prescriptions.jsx         list
    PrescriptionDetail.jsx    single record
    Profile.jsx                view/edit + logout
  index.css           Tailwind v4 + all design tokens from DESIGN.md
capacitor.config.ts
.env.example
```

**Why lucide-react instead of the Google Material Symbols web font the
Stitch export used:** a mobile app can't depend on fetching an icon font
from Google's CDN every time it opens — it'll flash missing icons on a
slow connection or fail entirely if that domain is blocked. `lucide-react`
bundles the icons into the app itself, so they always render, online or
off. `src/components/Icon.jsx` maps the same icon names Stitch used
(`local_hospital`, `event`, `stethoscope`, ...) to the closest lucide icon,
so if you paste in more Stitch-exported markup later, you only need to add
new names to that one file.

---

## 2. Set this up in VS Code

**Prerequisites:** [Node.js](https://nodejs.org) 20+, VS Code, and the
**ES7+ React/Redux/JS snippets** + **Tailwind CSS IntelliSense** extensions
(optional but helpful).

1. Unzip the project and open the folder in VS Code (`File → Open Folder`).
2. Open a terminal in VS Code (`` Ctrl+` ``) and run:
   ```bash
   npm install
   cp .env.example .env
   ```
3. Open `.env` and confirm it points at your live API:
   ```
   VITE_API_BASE_URL=https://gautamclinics.com/admin/mobileapi
   VITE_API_KEY=<your APP_API_KEY from mobileapi/config.php>
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   VS Code will show a `http://localhost:5173` link — Ctrl/Cmd-click it,
   or open it in a browser and use DevTools' device toolbar (Ctrl+Shift+M)
   to preview it at phone width.
5. Every time you save a file, the browser updates instantly (hot reload).

**Debugging in VS Code:** install the **JavaScript Debugger** (built in)
and add this to `.vscode/launch.json` to launch Chrome attached to the
dev server with breakpoints:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

---

## 3. Phased plan to finish the project

### Phase 0 — Local setup & smoke test (you are here)
- [x] Vite + React + Tailwind v4 scaffold, design tokens from `DESIGN.md`
- [x] API client wired to every `mobileapi` endpoint
- [x] All 8 screens built: login, OTP, register, home, appointments, book/reschedule, prescriptions, profile
- [ ] Run `npm run dev`, point `.env` at your **live** `gautamclinics.com` API, and click through the whole flow with a real phone number (CORS is already open on the backend via `Access-Control-Allow-Origin: *`)

### Phase 1 — Polish against the real backend
- [ ] Confirm field names coming back from `doctors_list.php` / `branches_list.php` match what's rendered (specialty/experience text shown in the Stitch mockup isn't in the API yet — either add those columns to `tbl_admin` and the endpoint, or drop that copy from the UI)
- [ ] Decide what "Vitals" and "Reports" (home screen quick actions) actually do — they're placeholder tiles right now with no linked screen or endpoint
- [ ] Add the empty/error states you want for slow networks (a basic skeleton loader is already in place on every list)
- [ ] Real prescription download — `PrescriptionDetail.jsx` renders the HTML content inline; if you want an actual PDF, that's the follow-up we discussed (reusing `admin/DownloadPrescription.php`)

### Phase 2 — Wrap it with Capacitor (native shell)
Run these once you're happy with Phase 1, from the project root:
```bash
npm run build
npx cap add android
npx cap add ios          # macOS + Xcode only
npx cap sync
```
This creates `android/` and `ios/` native project folders. `npx cap sync`
re-copies your `dist/` build and any Capacitor plugin config into them —
run it again after every `npm run build` whenever you change native
config (not needed for pure JS/React changes if you use live reload, see
below).

- [ ] **Android:** open `android/` in Android Studio (`npx cap open android`), run on an emulator or a USB-connected phone.
- [ ] **iOS:** open `ios/App/App.xcworkspace` in Xcode (`npx cap open ios`), run on the Simulator or a device (needs an Apple Developer account for a real device / the App Store).
- [ ] App icon & splash screen — replace the defaults using `@capacitor/assets` once you have your final logo artwork.
- [ ] Test OTP autofill: Android supports SMS Retriever/autofill out of the box for a 4–6 digit code typed into a standard `<input>`; no extra plugin needed for the current UI.

### Phase 3 — Native-only features (only if you want them)
- [ ] Push notifications for appointment reminders → `@capacitor/push-notifications` + a notification-sending endpoint on the backend
- [ ] Native share sheet for prescriptions → `@capacitor/share`
- [ ] Biometric app-unlock (Face ID / fingerprint) on top of the existing token → a biometric-auth plugin or a native wrapper

### Phase 4 — Store submission
- [ ] Play Store: signed release build (`android/app/build.gradle`), privacy policy URL, data-safety form (mention: mobile number, name, health records — collected, not sold, used only to run the clinic app)
- [ ] App Store: Xcode archive → App Store Connect, same privacy disclosures, screenshots for required device sizes
- [ ] Point `VITE_API_BASE_URL` at production before the final release build — double-check `.env` isn't left pointing at a staging/test key

### Phase 5 — Ongoing
- [ ] Add automated screenshots/visual regression (Playwright, same tool used to verify this build) so future Stitch/design changes don't silently break a screen
- [ ] Version the API (`/mobileapi/v2/...`) before making any breaking change to a response shape, since the app will be installed and not force-updated instantly

---

## 4. Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the `dist/` build locally, to sanity-check before a native build |
| `npx cap sync` | Push the latest `dist/` build + config into `android/`/`ios/` |
| `npx cap open android` / `ios` | Open the native project in Android Studio / Xcode |

## 5. Live reload on a real device (optional, speeds up Phase 2)

Instead of rebuilding for every change while testing on a phone, point
Capacitor at your running dev server:
```ts
// capacitor.config.ts, temporarily, for development only
server: {
  url: 'http://<your-computer's-LAN-IP>:5173',
  cleartext: true,
}
```
Run `npm run dev -- --host`, then `npx cap sync`, then run the native app —
it'll load straight from your dev server and hot-reload on the device.
**Remove this `server.url` block before building the real release** or the
app will try to load from your laptop instead of its bundled files.
#   g a u t a m - c l i n i c - a p p  
 