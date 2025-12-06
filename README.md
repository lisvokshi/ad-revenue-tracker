# Ad Revenue Studio – AdSense & Header Bidding Calculator

Mobile application built with **React Native (Expo)** and **Supabase** for the course **Mobile Applications** at **AAB College (Prishtina)**.

Student: **Lis Vokshi**

The app helps a website owner estimate AdSense and header bidding revenue based on:
- Region tier (Tier 1, 2, 3)
- Content category (e.g. Finance, News, Sports)
- Monthly pageviews
- Simple traffic growth scenarios (+20% and +50%)

It also supports saving website profiles to Supabase, switching between dark and light theme, and copying a text summary of the results for reporting or analysis.

---

## 1. Features

### 1.1 Authentication (Supabase Auth)
- Email + password authentication (login / register).
- Accounts managed through **Supabase Auth**.
- Basic validation and clear error messages.
- Animated login/register button for a smoother user experience.

### 1.2 Website Profiles (Supabase Database)
- Table: `sites` (in Supabase).
- Each record includes:
  - `user_id`
  - `name` (site name)
  - `region_tier` (Tier 1 / Tier 2 / Tier 3)
  - `category` (content category)
  - `monthly_pageviews`
- Users can:
  - Create new website profiles.
  - See all their sites in a list.
  - Select a site to pre-fill the calculator inputs.

### 1.3 AdSense Revenue Calculator
- Region tiers:
  - **Tier 1** – highest-value countries (US, UK, DE, etc.).
  - **Tier 2** – medium-value markets.
  - **Tier 3** – emerging / long-tail markets.
- Content categories aligned with typical AdSense/content taxonomies (Finance, Real Estate, News, Sports, etc.).
- For each calculation:
  - Estimated **monthly AdSense revenue**.
  - Estimated **annual AdSense revenue**.
  - Estimated **annual header bidding revenue** (AdSense × 1.5 uplift).
- Scenario analysis:
  - Annual AdSense revenue with **+20% traffic**.
  - Annual AdSense revenue with **+50% traffic**.

### 1.4 RPM / CPM Profile Gauge
- Visual "gauge" showing how strong the RPM is:
  - Low / Medium / High scale.
  - Based on the effective CPM = Tier base CPM × category multiplier.
  - Animated bar updates when new results are calculated.

### 1.5 UI & UX
- Two themes:
  - **Dark** (default) – slate background and saturated accent colors.
  - **Light** – white/gray background, softer cards.
- Theme toggle:
  - Available on the **auth screen** and on the **calculator screen**.
- Components:
  - Pills for **tier selection**.
  - Chips for **category selection**.
  - Cards for:
    - Website profiles.
    - Traffic assumptions.
    - Results & scenarios.
    - Explanation / methodology.
- Small animations:
  - Login button scale animation.
  - Calculate button scale animation.
- Clipboard integration:
  - Button to **copy a plain-text summary** of the calculation (tier, category, traffic, monthly/annual AdSense, header bidding, scenarios).
  - Uses `expo-clipboard`.

---

## 2. Tech Stack

- **React Native** with **Expo**
- **Expo Router**
- **Supabase**
  - Auth (email/password)
  - Database table: `sites`
- **JavaScript**
- **expo-clipboard** (copy to clipboard)

---

## 3. Project Structure (simplified)

```text
ad-revenue-tracker/
  app/
    (tabs)/
      index.tsx        # Main screen: Auth + Calculator + Profiles
    supabaseClient.js  # Supabase client initialization
  assets/              # App assets (icons, etc.)
  package.json
  app.json
  README.md
  AI-log.txt           # AI support log (prompts and summaries)
