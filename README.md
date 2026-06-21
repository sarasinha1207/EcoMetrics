# EcoMetrics

A professional, local-first personal carbon intelligence platform designed to track lifestyle footprints, simulate habit mitigation strategies, and visualize global planetary telemetry in real-time.

---

## 2. Overview
**EcoMetrics** is a premium, dark-themed SaaS-style platform that empowers individuals to take charge of their carbon footprint. Unlike generic environmental calculators, EcoMetrics utilizes real-time client-side calculation models, gamification tiers, an interactive habit modeling simulator, and a live global climate pulse console. It operates in a private, zero-knowledge, local-only mode to safeguard personal data.

---

## 3. Chosen Vertical
* **Vertical**: Carbon Footprint Awareness, Environmental Technology, and Climate Action Systems.

---

## 4. Problem Statement
Personal carbon tracking tools are often static, dry, and disconnected from the broader, global climate context. They suffer from:
1. **Privacy Concerns**: Requiring third-party sign-ins and uploading sensitive daily lifestyle data to external databases.
2. **Lack of Relatable Context**: Displaying abstract numbers (e.g., "12.5 tonnes of CO2e per year") without explaining how that relates to global boundaries or real-world equivalents.
3. **No Direct Interactivity**: Providing rigid questionnaires rather than allowing users to model and see the immediate impacts of potential habit changes before committing.

---

## 5. Approach & Logic
* **Local-First & Zero-Knowledge**: All calculations, logs, daily actions, streaks, and unlocked badges are saved directly in browser LocalStorage. There are no tracking scripts, cookies, or external databases, ensuring 100% data ownership.
* **Continuous Real-Time Telemetry**: Uses high-accuracy ticking mathematical state equations on the homepage to represent live global climate telemetry (emissions, glacier melt, forest canopy loss, carbon budget) based on real-world IPCC and NOAA metrics.
* **Habit Modeling Formulae**: Allows live sliders to feed into custom carbon-reduction multipliers (e.g., converting driving reductions, electrical savings, and thermostat offsets directly into annualized CO2 tonnes saved).

---

## 6. How the Solution Works
1. **Interactive Homepage**:
   - **Hero Visual**: Displays a modern 3D illustration and value proposition.
   - **Planetary Health Pulse**: Telemetry dashboard that lets users choose different global carbon reduction scenarios (BAU, 2°C Path, 1.5°C Path) and watch how global ticking speeds adapt.
   - **Carbon Simulator**: Dynamic sliders that instantly update level scoring and projected carbon ratings.
2. **Main Dashboard**:
   - Displays Donut Charts showing emissions category breakdown (Transport, Energy, Food, Waste).
   - Displays SVG Line Charts detailing historical emission trends.
   - Tracks streaks, levels, and unlocked achievement badges.
3. **Carbon Calculator**:
   - Structured step-by-step form to log entries for *Transit*, *Energy*, *Food*, *Shopping*, and *Waste*.
4. **AI Coach**:
   - Allows text-based chat queries with a simulated environmental coach to get sustainability tips.
5. **Google Calendar Syncer**:
   - Packages chosen habits into calendar events and synchronizes them using standard local OAuth mappings.

---

## 7. Key Features
* **Live Scenario Simulation**: Instantly modifies global tickers according to selected policy paths (e.g., BAU vs. Net Zero).
* **1.5°C Carbon Budget Countdown**: Visualizes the remaining global emissions budget in real-time.
* **Gamified Progression**: Unlocks custom titles (e.g., Sapling, Guardian, Champion) and badges as users achieve sustainability milestones.
* **Contextual Analogies**: Translates tonnes of emissions or ice melt into relatable equivalents (e.g., passenger cars driven, Olympic pools melted).
* **Fully Responsive UI**: Optimizes layouts for mobile screens and widescreen displays.

---

## 8. Technology Stack
* **Frontend**: React 18, Vite, JavaScript (ES6+)
* **Styling**: Custom CSS3 grid/flex layout sheets
* **Backend Mock Services**: Node.js, Express (for mock OAuth / Google Calendar sync handlers)
* **Unit Testing**: Vitest, React Testing Library

---

## 9. Assumptions Made
1. **Emission Factors**: Carbon calculation multipliers are averages modeled from standard EPA and DEFRA databases (e.g., `0.18 kg CO2e` per km driven, `0.38 kg CO2e` per kWh electricity).
2. **Global Rates**: Live tickers are approximations based on annualized global averages:
   - CO2 emissions: ~36.8 billion tonnes/year (~1,166.9 tonnes/second).
   - Glacier melt: ~328 billion tonnes/year (~10,400 tonnes/second).
   - Deforestation: ~100,000 sq. km/year (~3,170 square meters/second).
3. **Carbon Budget**: The remaining carbon budget for a 50% chance of limiting warming to 1.5°C is initialized near 250 billion tonnes.

---

## 10. Setup & Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd "Carbon Footprint Awareness Platform"
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Start the mock backend server:
   ```bash
   node server.js
   ```
   *(The server runs on `http://localhost:3000`)*
2. In a separate terminal tab, launch the Vite dev client:
   ```bash
   npm run dev
   ```
   *(The app opens at `http://localhost:5173`)*

### Production Build
1. Build the production static bundle:
   ```bash
   npm run build
   ```
2. Preview the built application:
   ```bash
   npm run preview
   ```

### Running Tests
1. Execute the Vitest test suite:
   ```bash
   npm test
   ```

---

## 11. Future Improvements
* **Active API Integrations**: Directly fetch local utility provider APIs or smart meter feeds to automate energy logging.
* **Real-time Local AI Coach**: Deploy a tiny localized language model (e.g. WebLLM/Gemma) running client-side inside the browser sandbox.
* **Geolocation-based Transport Auditing**: Integrate phone-GPS tracking parameters to log vehicle vs. transit commutes automatically.
