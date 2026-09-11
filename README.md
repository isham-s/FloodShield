# FloodShield

**Pakistan Flood Risk Intelligence & Relief Prioritization Prototype**

FloodShield is a district-level flood-risk decision-support prototype for Pakistan. It combines rainfall, terrain, river, drainage, infrastructure, population and historical flood information to estimate flood hazard, visualize district-level risk, and rank areas for relief prioritization.

> **Important:** FloodShield is a research/capstone prototype. It is **not** an official early-warning system and must not replace NDMA/PDMA alerts or emergency guidance.

---

## Live Demo

- **Web App:** https://floo-shield-l9ql359lp-capstone-fdc2.vercel.app/
- **Backend API:** https://floodshield-api.onrender.com/
- **API Docs:** https://floodshield-api.onrender.com/docs
- **GitHub Repository:** https://github.com/isham-s/FloodShield

> The Render backend may take a short time to wake up after inactivity. If Scenario Lab does not respond immediately, open the API docs once, wait for the service to wake, then retry.

---

## Project Goal

FloodShield is built around one practical question:

> **Where is flood hazard likely to be higher, and where should limited relief attention be prioritized first?**

The project separates two ideas that are often mixed together:

- **Flood Hazard** — likelihood/risk signal based on rainfall, terrain, rivers and drainage.
- **Relief Priority** — hazard combined with exposure/context such as population and accessibility.

This separation avoids using post-flood damage as an input to the hazard model and keeps the methodology easier to explain.

---

## Coverage

- **29 selected districts** across Pakistan
- **Historical modelling window:** 2010–2025
- **District-year master table:** 464 rows
- **Main prediction target:** `flood_event`
  - `1` = historical flood event recorded
  - `0` = non-flood / negative label according to the compiled label set

The project uses 29 district boundary geometries for spatial extraction and interactive mapping.

### Districts

Badin, Charsadda, Dadu, Dera Ghazi Khan, Ghotki, Gujranwala, Hyderabad, Jacobabad, Jaffarabad, Jamshoro, Jhang, Kashmore, Khairpur, Larkana, Layyah, Mardan, Mianwali, Muzaffargarh, Nasirabad, Nowshera, Peshawar, Rahim Yar Khan, Rajanpur, Sheikhupura, Shikarpur, Sukkur, Swabi, Swat and Thatta.

---

## Main Features

### Interactive Flood Risk Map
- 29 district boundaries
- Low / Medium / High risk visualization
- Clickable district polygons
- Search and district selection

### District Risk Intelligence
For each district, the dashboard can show:
- flood hazard probability
- risk category
- annual rainfall
- monsoon rainfall
- maximum daily rainfall
- rainy days
- extreme rainfall days
- elevation and slope
- river density and river characteristics
- drainage density
- infrastructure context
- historical flood events

### FloodShield Risk Alert
A prototype alert is triggered when model probability crosses the configured alert threshold.

The alert is intentionally labelled as a **FloodShield Risk Alert**, not an official emergency warning.

### Relief Priority
Flood hazard is combined with exposure/context to produce a district ranking for relief prioritization.

The current prototype uses:
- population exposure
- accessibility gap
- model hazard probability

### Scenario Lab
Users can change rainfall-related inputs and send them to the deployed ML backend to test how the model hazard score changes.

### Explainability
The project includes:
- feature importance
- model comparison metrics
- ROC curve
- precision–recall curve
- confusion matrix
- historical evidence by district

---

## Data Sources

### Rainfall
**CHIRPS — Climate Hazards Center, UC Santa Barbara**

Used for district-level rainfall features for 2010–2025.

Typical derived features:
- annual rainfall
- monsoon rainfall
- maximum daily rainfall
- rainy-day count
- extreme-rain-day count

Source: https://www.chc.ucsb.edu/data/chirps

### Elevation & Slope
**SRTM 30 m elevation through OpenTopoData**

Used to derive:
- mean elevation
- minimum elevation
- maximum elevation
- mean slope
- maximum slope

Source: https://www.opentopodata.org/datasets/srtm/

### Rivers
**HydroRIVERS / HydroSHEDS**

Used for:
- river length
- river density
- river reach count
- long-term discharge estimates
- Strahler river order

Source: https://www.hydrosheds.org/products/hydrorivers

### Infrastructure
**OpenStreetMap-derived district summaries**

Used for context/exposure features such as:
- road density
- drainage density
- bridges
- buildings
- hospitals
- schools
- accessibility-related distances

Pakistan extracts can be obtained through providers such as Geofabrik:
https://download.geofabrik.de/asia/pakistan.html

### Flood Events & Damage
Historical event information was compiled from project datasets citing sources including:
- NDMA Pakistan
- OCHA situation reports / flash updates
- World Bank / GFDRR post-disaster assessments
- other cited historical flood reports used in the compiled tables

Post-flood consequences such as deaths, houses destroyed, people affected and severity are kept for analysis/context, **not used as hazard-model predictors**.

### District Boundaries
Pakistan ADM2 district boundary clips were used for geospatial extraction and the interactive web map.

---

## Machine Learning Approach

### Problem Type
Binary classification:

```text
Environmental + rainfall + river/drainage conditions
                ↓
          ML classifier
                ↓
        Flood hazard probability
```

Target:

```text
flood_event = 0 or 1
```

### Models Compared
The project compares:
- Logistic Regression
- Random Forest
- XGBoost

### Selected Model
**XGBoost Classifier** is used as the current primary hazard model because it produced the strongest overall discrimination under grouped validation on the available dataset.

### Validation Strategy
The model uses **district-grouped cross-validation** so that years from the same district are kept together within folds. This reduces leakage caused by repeated static district characteristics appearing in both train and validation data.

### Current Grouped-CV Results

| Model | ROC-AUC | PR-AUC | Recall | F1 |
|---|---:|---:|---:|---:|
| XGBoost | **0.786** | **0.376** | 0.363 | **0.297** |
| Random Forest | 0.759 | 0.373 | 0.323 | 0.279 |
| Logistic Regression | 0.699 | 0.332 | **0.640** | 0.257 |

The classes are imbalanced, so raw accuracy is not treated as the main success metric. Flood recall, F1, ROC-AUC and PR-AUC are more informative.

### Prototype Alert Threshold
The current prototype uses a probability threshold of **0.30** for the risk-alert layer to catch more flood cases.

At this threshold, out-of-fold XGBoost results were approximately:

- **Precision:** 0.289
- **Recall:** 0.619
- **F1:** 0.394
- **ROC-AUC:** 0.765
- **PR-AUC:** 0.333

This threshold intentionally trades more false alarms for higher flood-event recall.

---

## Hazard Features Used by the Model

The current hazard model uses pre-event/environmental variables including:

### Rainfall
- `annual_rainfall_mm`
- `monsoon_rainfall_mm`
- `max_daily_rainfall_mm`
- `rainy_days`
- `extreme_rain_days_50mm`

### Terrain
- `mean_elevation_m`
- `min_elevation_m`
- `max_elevation_m`
- `mean_slope_deg`
- `max_slope_deg`

### River Network
- `river_length_km`
- `river_density_km_per_km2`
- `river_reach_count`
- `mean_longterm_discharge_cms`
- `max_longterm_discharge_cms`
- `max_strahler_order`

### Drainage
- `drainage_density_km_per_km2`
- `avg_dist_drainage_km`

---

## What Is Deliberately NOT Used to Predict Flood Occurrence

The following are excluded from hazard-model inputs to avoid leakage:

- flood type
- flood severity
- deaths
- houses destroyed
- houses damaged
- people affected
- cropland affected
- post-event humanitarian indicators
- direct flood-label/source metadata

Infrastructure and population are primarily used for **exposure and relief-priority analysis**, rather than being forced into the physical hazard model.

---

## Project Architecture

```text
                 FloodShield

   CHIRPS rainfall ───────────────┐
   Elevation + slope ─────────────┤
   Rivers + drainage ─────────────┤
                                 ↓
                        XGBoost hazard model
                                 ↓
                         Flood probability
                                 ↓
                     LOW / MEDIUM / HIGH
                                 ↓
                   FloodShield Risk Alert

   Population + accessibility + infrastructure
                                 ↓
                       Exposure / context
                                 ↓
                Hazard × Exposure / Context
                                 ↓
                      Relief Priority Score
```

---

## Web Application

### Frontend
- React
- Vite
- Leaflet / React-Leaflet
- Recharts
- Lucide React
- responsive custom dashboard styling
- deployed on **Vercel**

### Backend
- FastAPI
- XGBoost
- scikit-learn pipeline
- pandas / NumPy
- joblib model bundle
- deployed on **Render**

### Deployment

**Frontend:** https://floo-shield-l9ql359lp-capstone-fdc2.vercel.app/

**Backend:** https://floodshield-api.onrender.com/

**API Docs:** https://floodshield-api.onrender.com/docs

---

## Repository Structure

```text
FloodShield/
│
├── frontend/
│   ├── public/
│   │   └── data/
│   │       ├── districts.geojson
│   │       ├── latest.json
│   │       ├── history.json
│   │       ├── feature_importance.csv
│   │       └── model_comparison_metrics.csv
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── index.html
│   ├── .env.example
│   └── vercel.json
│
├── backend/
│   ├── app.py
│   ├── floodshield_xgboost_bundle.joblib
│   ├── requirements.txt
│   ├── feature_importance.csv
│   ├── model_comparison_metrics.csv
│   ├── district_risk_and_relief_2025.csv
│   └── METHODOLOGY.md
│
└── README.md
```

---

## Run Locally

### Backend

```bash
cd backend
python -m venv .venv
```

Activate the environment.

Windows:

```bash
.venv\Scripts\activate
```

macOS / Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run API:

```bash
uvicorn app:app --reload --port 8000
```

Backend should then be available at:

```text
http://localhost:8000
```

FastAPI docs:

```text
http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```text
VITE_API_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

---

## Production Deployment Configuration

### Render Backend

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT
```

### Vercel Frontend

```text
Root Directory: frontend
Framework: Vite
Environment Variable:
VITE_API_URL=https://floodshield-api.onrender.com
```

---

## API

### Health Check

```http
GET /
```

### Prediction

```http
POST /predict
```

The prediction endpoint expects the hazard-model input features and returns output in the form:

```json
{
  "flood_probability": 0.72,
  "risk_level": "HIGH",
  "alert": true,
  "alert_threshold": 0.30
}
```

---

## Risk Categories

Current prototype display bands:

```text
0.00 – 0.20  → LOW
0.20 – 0.40  → MEDIUM
0.40 – 1.00  → HIGH
```

These are prototype display thresholds and should not be interpreted as official operational flood-warning cutoffs.

---

## Key Methodological Decisions

1. **Hazard and exposure are separated.** Physical flood prediction is not mixed with post-flood damage.
2. **Data leakage is removed.** Severity and disaster outcomes are excluded from model inputs.
3. **District-grouped validation is used.** This reduces leakage from repeated static features.
4. **Class imbalance is acknowledged.** PR-AUC, recall and F1 are emphasized instead of accuracy alone.
5. **Model comparison is reported.** XGBoost is selected based on validation rather than assumption.
6. **Alerts are labelled as prototype model alerts.** FloodShield does not claim to be an official emergency-warning authority.

---

## Limitations

- Flood-event labels are sparse relative to non-flood years.
- Some negative labels are less certain than positive event labels.
- The 29 districts were selected for project relevance and are not a random national sample.
- Historical event compilations can have inconsistent reporting quality.
- OpenStreetMap counts depend on mapping/tag completeness.
- HydroRIVERS discharge values are long-term estimates rather than live gauge readings.
- The current national dashboard is primarily a **retrospective / research view**, not live operational forecasting.
- True real-time flood warning would require current rainfall, river-gauge/forecast inputs, validation and operational alert protocols.
- The free Render service can sleep after inactivity, so the first Scenario Lab request may be delayed while the backend wakes up.

---

## Future Improvements

Potential extensions include:

- live rainfall ingestion
- CHIRPS-GEFS forecast rainfall
- live river gauge data
- union-council level predictions
- Sentinel-1 flood extent detection
- calibrated probability models
- SHAP-based local explanations
- SMS / push alert integration
- evacuation-route overlays
- shelter / hospital accessibility analysis
- historical flood map playback
- official NDMA/PDMA alert integration

---

## Intended Use

FloodShield is designed as a **student/research decision-support prototype** demonstrating how geospatial data, historical flood records and machine learning can be combined into an interpretable flood-risk dashboard for Pakistan.

It should be used for analysis, demonstration and research — **not as a substitute for official disaster-management warnings or emergency decisions**.

---

## Status

**Deployed capstone prototype** — model pipeline prepared, 29-district geospatial dataset consolidated, XGBoost hazard model deployed through FastAPI on Render, and the interactive frontend deployed on Vercel.
