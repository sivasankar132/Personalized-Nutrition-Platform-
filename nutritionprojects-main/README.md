# Nutrition Dashboard

A mobile-first nutrition and wellness dashboard focused on Andhra Pradesh and Telangana food. The app lets a user maintain a basic profile, scan a meal photo for an AI-assisted nutrition estimate, log food intake, review daily and 30-day nutrition summaries, switch between English and Telugu, and track a personal food budget. It is delivered as a progressive web app (PWA) and is wrapped as an Android application with Capacitor.

> **Prototype and health notice:** Nutrition values, diet plans, condition-specific suggestions, doctor profiles, and consultation flows are illustrative. They are not clinical advice, diagnosis, emergency care, or a replacement for a qualified healthcare professional. Always validate model-generated food recognition and nutrition values before using them for a health decision.

## Contents

- [What the app does](#what-the-app-does)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Run the web app](#run-the-web-app)
- [Configure Supabase and AI analysis](#configure-supabase-and-ai-analysis)
- [Build the Android app](#build-the-android-app)
- [Data model](#data-model)
- [Food-analysis API](#food-analysis-api)
- [Persistence and offline behavior](#persistence-and-offline-behavior)
- [Internationalization and accessibility](#internationalization-and-accessibility)
- [Design system](#design-system)
- [Security and production checklist](#security-and-production-checklist)
- [Troubleshooting](#troubleshooting)
- [Development notes](#development-notes)

## What the app does

| Area | Current behavior |
| --- | --- |
| Dashboard | Displays calorie, protein, water, BMI, nutrition-score, vitamin, and personalized-focus cards. Targets are derived from the saved profile. |
| Profile | Saves name, age, height, weight, and activity level to Supabase. BMI, calorie, protein, and water targets are calculated in the browser. |
| Meal scan | Accepts a JPEG/PNG/WEBP image, sends it to a Supabase Edge Function, and shows a review screen before the user logs the result. |
| Intake logging | Stores confirmed scans, spoken Telugu logs, and prefilled regional-food swaps in `food_intake`. |
| Analytics | Reads the most recent 30 days of food records and computes totals, averages, active days, food frequency, and a dated history. |
| Language | Switches visible copy between English and Telugu; the preference is retained locally. |
| Health plan | Generates deterministic, condition-aware sample meal cards for diabetes, blood pressure, anemia, and PCOS selections. It is not an AI API call. |
| Budget | Stores daily budget amounts and food costs locally in the browser; it does not write to Supabase. |
| PWA / Android | Registers a service worker for the static shell and can be packaged into a portrait Android app. |

## Architecture

```text
Browser / Capacitor WebView
  └─ advanced_nutrition_dashboard_prototype/index.html
       ├─ UI, translations, calculations, local preferences and budget data
       ├─ Supabase JS client ────────────────► Supabase Postgres
       │                                      ├─ profiles (expected; schema is not included)
       │                                      └─ food_intake
       └─ Supabase Functions invoke ─────────► hyper-Analyze-Food Edge Function
                                               └─ Gemini 2.0 Flash image analysis

Static PWA shell ◄── service-worker.js
Android wrapper ◄── Capacitor (android/)
```

The front end is deliberately a self-contained HTML application. It imports Tailwind CSS, Material Symbols, Google Fonts, and `@supabase/supabase-js` from CDNs; there is no bundler, framework runtime, or `npm run dev` script.

## Repository layout

```text
.
├─ stitch_vitality_nutrition_dashboard/
│  ├─ advanced_nutrition_dashboard_prototype/
│  │  ├─ index.html                 # Main application: markup, styles, and JavaScript
│  │  ├─ service-worker.js          # PWA shell cache policy
│  │  ├─ manifest.webmanifest       # Installable PWA metadata
│  │  └─ icons/                     # PWA icons
│  ├─ clinical_clarity/DESIGN.md    # Design-token and visual-language reference
│  └─ nutrition_dashboard_prototype_* / # Earlier static design prototypes
├─ supabase/
│  ├─ sql/food_intake.sql           # Intake table and index migration
│  └─ functions/hyper-Analyze-Food/index.ts # Image-analysis Edge Function
├─ android/                          # Capacitor-generated Android project
├─ capacitor.config.json             # App ID, name, and web asset directory
├─ package.json                      # Capacitor and Supabase dependencies
└─ package-lock.json
```

`android/app/src/main/assets/public` is generated/copied Capacitor web content. Treat `stitch_vitality_nutrition_dashboard/advanced_nutrition_dashboard_prototype` as the editable web source, then run `npx cap sync android` to refresh Android assets.

## Prerequisites

- Node.js 22 or later and npm (the installed Capacitor 8 packages declare Node `>=22`).
- A Supabase project for persistent profiles and food records.
- Supabase CLI for database migration and Edge Function deployment.
- A Google AI Studio/Gemini API key for photo analysis.
- Android Studio plus an Android SDK/JDK for local Android builds.

## Run the web app

1. Install the declared dependencies:

   ```powershell
   npm install
   ```

2. Serve the app directory over HTTP. For example, using a one-off static server:

   ```powershell
   npx serve stitch_vitality_nutrition_dashboard/advanced_nutrition_dashboard_prototype
   ```

3. Open the local URL printed by the server. Do not double-click `index.html`: module imports, camera/file features, and service-worker registration work more predictably from a web server.

For service-worker testing, use `localhost` or HTTPS. Production hosting must serve the app over HTTPS.

## Configure Supabase and AI analysis

### 1. Create the database objects

In the Supabase SQL Editor, run [`supabase/sql/food_intake.sql`](supabase/sql/food_intake.sql). It creates `public.food_intake` and an index on `created_at`.

The UI also reads and writes a `profiles` table, but this repository does not currently include its migration. Create it before using the profile modal:

```sql
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null,
  height_cm numeric not null,
  weight_kg numeric not null,
  activity_level text not null,
  bmi numeric not null,
  daily_calorie_target numeric not null,
  protein_target numeric not null,
  water_target numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_created_at
  on public.profiles (created_at desc);
```

The current prototype has no user authentication or `user_id` columns. Without authentication, records are shared among anyone with permitted API access. For production, add authentication, a `user_id`, row-level security (RLS), and per-user policies before enabling client access.

### 2. Point the client at your Supabase project

In `index.html`, the `<script type="module">` near the top initializes the client with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Replace those values with your project URL and **publishable/anon** key. Never put a Supabase service-role key or a Gemini key in this file.

The existing published key is a client-safe publishable key, but moving these values to a build-time or hosted configuration layer is recommended for deployment flexibility.

### 3. Deploy the Edge Function

Authenticate and link the repository to the intended Supabase project, then set the server-only Gemini secret and deploy:

```powershell
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set GEMINI_API_KEY=<your-gemini-api-key>
supabase functions deploy hyper-Analyze-Food
```

The client invokes the function by its exact deployed name, `hyper-Analyze-Food`. The function handles CORS preflight and asks Gemini for a strict JSON response tailored to Indian and Telugu cuisine. It keeps only recognized numeric nutrition/vitamin fields in its returned object and clamps confidence to `0..1`.

### 4. Verify the connection

- Save a profile; it should appear in `profiles`.
- Upload a food image and confirm it is analyzed.
- Select **Yes** on the confirmation screen; a row should appear in `food_intake`.
- Refresh the dashboard and confirm the day totals/history update.

## Build the Android app

The Capacitor app identity is `com.nutrition.dashboard`, and the application is portrait-only. The Android project currently targets API 36 and requires API 24 or later.

After changing web files, copy them into the Android project:

```powershell
npx cap sync android
```

To open and build with Android Studio:

```powershell
npx cap open android
```

Alternatively, from the `android` directory on Windows:

```powershell
.\gradlew.bat assembleDebug
```

The resulting debug APK is normally written under `android/app/build/outputs/apk/debug/`. Android’s manifest requests only Internet permission. The app relies on the browser file picker for image selection rather than declaring a direct camera permission.

## Data model

### `food_intake`

The included migration defines the following fields. Numeric columns accept decimal values.

| Group | Columns |
| --- | --- |
| Identity/time | `id` (UUID), `created_at` (timestamp with time zone) |
| Meal | `food_name`, `serving_size` |
| Macronutrients | `calories_kcal`, `protein_g`, `carbohydrates_g`, `fat_g`, `fiber_g`, `sugar_g` |
| Vitamins | `vitamin_a_mcg`, `vitamin_c_mg`, `vitamin_d_mcg`, `vitamin_e_mg`, `vitamin_k_mcg`, `vitamin_b1_mg`, `vitamin_b2_mg`, `vitamin_b3_mg`, `vitamin_b6_mg`, `folate_mcg`, `vitamin_b12_mcg` |
| Minerals | `calcium_mg`, `iron_mg`, `magnesium_mg`, `potassium_mg`, `zinc_mg` |

The dashboard’s current daily query filters `created_at` between the local start and end of today. The history view loads the prior 30 calendar days. The database index on `created_at` supports both paths.

### `profiles` (expected by the UI)

The frontend expects an ID, creation timestamp, `name`, `age`, `height_cm`, `weight_kg`, `activity_level`, `bmi`, `daily_calorie_target`, `protein_target`, and `water_target`. The suggested schema above aligns with those reads and writes.

Target calculations occur client-side:

- `BMI = weightKg / (heightCm / 100)^2`
- `daily_calorie_target = round(22 × weightKg × activityMultiplier)`
- `protein_target = round(max(60, weightKg × 1.6))`
- `water_target = round(weightKg × 0.035, 1)` litres

Activity multipliers: sedentary `1.2`, lightly active `1.375`, moderately active `1.55`, and very active `1.725`. These are product heuristics, not individualized clinical prescriptions.

## Food-analysis API

The browser calls the Supabase function with `supabase.functions.invoke`.

**Request**

```json
{
  "imageBase64": "<base64 image bytes without a data URL prefix>",
  "mimeType": "image/jpeg"
}
```

**Successful response**

```json
{
  "success": true,
  "food": {
    "food_name": "…",
    "confidence": 0.0,
    "description": "…",
    "serving_size": "…",
    "nutrition": {
      "calories_kcal": 0,
      "protein_g": 0,
      "carbohydrates_g": 0,
      "fat_g": 0,
      "fiber_g": 0,
      "sugar_g": 0,
      "vitamin_c_mg": 0
    },
    "vitamins": {
      "vitamin_a_mcg": 0,
      "vitamin_c_mg": 0,
      "vitamin_d_mcg": 0,
      "vitamin_e_mg": 0,
      "vitamin_k_mcg": 0,
      "vitamin_b1_mg": 0,
      "vitamin_b2_mg": 0,
      "vitamin_b3_mg": 0,
      "vitamin_b6_mg": 0,
      "folate_mcg": 0,
      "vitamin_b12_mcg": 0,
      "calcium_mg": 0,
      "iron_mg": 0,
      "magnesium_mg": 0,
      "potassium_mg": 0,
      "zinc_mg": 0
    }
  }
}
```

Possible error responses use `{ "success": false, "error": "…" }`: invalid/missing image (400), missing Gemini secret (500), upstream Gemini failure or malformed model output (502), and unhandled failure (500). The Edge Function does not persist uploaded images or analysis output; the browser writes a confirmed food record separately.

## Persistence and offline behavior

| Data | Location | Notes |
| --- | --- | --- |
| Profiles and meal records | Supabase Postgres | Requires network and suitable API/RLS permissions. |
| Language preference | `localStorage.language` | Defaults to English (`en`); Telugu is `te`. |
| Theme preference | `localStorage.nutritionTheme` | Supports system, light, dark, and app-defined themes. |
| Food budget and expenses | `localStorage.nutritionDashboardDailyBudgetV1` and `nutritionDashboardFoodExpensesV1` | Device/browser-local only; clearing site data removes it. |
| Static app shell | Cache Storage via `service-worker.js` | Caches HTML, manifest, icons, and permitted static CDN assets. |

The service worker intentionally does **not** cache Supabase, Gemini, REST, or Edge Function traffic. Therefore, offline mode can show the cached interface but cannot read/write cloud profiles or analyze/log meals.

## Internationalization and accessibility

Text is maintained in an in-page translation dictionary and rendered via `data-i18n` attributes plus the `t()` helper. English and Telugu are supported. To add a language, add the translation keys, extend `applyLanguage`, and test all dynamic content paths (scanner result, history, diet cards, budget, and notifications).

The visual system uses textual status labels alongside colored indicators. Continue that approach when adding status UI. Verify keyboard navigation, focus behavior inside modals, contrast in every theme, screen-reader labels for icon-only controls, and Telugu font rendering before release.

## Design system

The detailed visual reference lives in [`stitch_vitality_nutrition_dashboard/clinical_clarity/DESIGN.md`](stitch_vitality_nutrition_dashboard/clinical_clarity/DESIGN.md). The intended style is calm, clinical, and modern: Inter typography, medical teal as the primary color, soft neutral surfaces, rounded cards, subtle borders, and glass-like overlays. The main implementation uses Tailwind utility classes and a few local CSS rules in `index.html`.

## Security and production checklist

Before a public release:

- [ ] Add Supabase Auth and associate every profile/intake row with `user_id`.
- [ ] Enable RLS on application tables and write tested select/insert/update policies.
- [ ] Move database migration(s), including `profiles`, into a versioned migration workflow.
- [ ] Keep `GEMINI_API_KEY` only in Supabase secrets; never expose it to the browser or Android assets.
- [ ] Apply request size/type limits and rate limiting to food analysis, and define an image-retention/privacy policy.
- [ ] Validate all user and model data server-side before persistence; retain confirmation before logging an estimate.
- [ ] Use HTTPS, set allowed origins narrowly, and audit CORS before production.
- [ ] Replace demo doctor/contact content and non-emergency alerts with real, consented provider integrations—or remove them.
- [ ] Validate calculation rules and all localized health copy with qualified nutrition/medical reviewers.
- [ ] Add automated tests, error monitoring, backup/retention rules, and a privacy notice.

## Troubleshooting

| Symptom | Likely cause and resolution |
| --- | --- |
| “Profile could not be saved” | Create the expected `profiles` table, confirm the client URL/key, and check Supabase RLS/API permissions. |
| “Food intake table does not exist” | Run `supabase/sql/food_intake.sql` in the same Supabase project configured in `index.html`. |
| Food scan fails | Deploy `hyper-Analyze-Food`, set `GEMINI_API_KEY` as a Supabase secret, and inspect the function logs for Gemini/API errors. |
| Camera/file control does nothing | Serve the page through HTTP(S), not `file://`; use a supported image type (JPEG, PNG, or WEBP). |
| Android does not show web edits | Run `npx cap sync android` after editing the prototype directory, then rebuild/relaunch. |
| Old UI remains after deployment | The service worker cache name is `nutrition-dashboard-shell-v2`. Bump the cache name when intentionally invalidating a deployed shell, or clear site data during development. |
| Dashboard data appears shared | This is expected without authenticated user scoping/RLS. Implement the production checklist before multi-user use. |

## Development notes

- The primary application is approximately a single HTML file, so UI and behavior changes should be made carefully and tested in desktop, mobile web, and Android WebView contexts.
- The project has dependencies but no npm scripts and no automated test suite at present. At minimum, manually test profile saving, scan success/failure, meal confirmation, daily totals, history, language/theme changes, budget storage, PWA refresh, and Android back-button modal handling after changes.
- `MainActivity` intercepts the Android back button: it closes an open modal first, otherwise navigates WebView history, then falls back to the default Android back behavior.
- Earlier `nutrition_dashboard_prototype_*` directories are static design references; they are not the configured Capacitor web directory.

## License

No license file is included. Add an explicit license before distributing or accepting contributions.
