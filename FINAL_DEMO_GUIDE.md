# FloodShield — Final Demo Guide

## Live Links

- **Frontend (Vercel):** https://floo-shield-l9ql359lp-capstone-fdc2.vercel.app/
- **Backend (Render):** https://floodshield-api.onrender.com/
- **FastAPI Docs:** https://floodshield-api.onrender.com/docs
- **GitHub:** https://github.com/isham-s/FloodShield

---

## 2–3 Minute Demo Flow

### 1. Problem — 15–20 seconds

Pakistan faces repeated floods, but risk is not the same everywhere and limited relief resources cannot be sent everywhere at once. FloodShield asks two practical questions:

1. **Which districts show higher flood hazard?**
2. **Where should limited relief attention be prioritized first?**

FloodShield is a district-level research prototype, not an official NDMA/PDMA warning system.

### 2. Data — 25–30 seconds

The project combines several data types for 29 selected districts:

- CHIRPS rainfall
- SRTM elevation and slope through OpenTopoData
- HydroRIVERS / HydroSHEDS river-network features
- OpenStreetMap-derived roads, drainage, bridges, hospitals and schools
- population and accessibility context
- compiled historical flood-event records and impact information
- Pakistan ADM2 district boundaries for mapping

The modelling window is **2010–2025**.

### 3. Model — 35–40 seconds

The hazard problem is treated as binary classification: whether a flood event is recorded for a district-year.

Three models were compared:

- Logistic Regression
- Random Forest
- XGBoost

The primary model is **XGBoost**. Validation is performed using **district-grouped 5-fold cross-validation**, so years from the same district are kept together and do not leak static district characteristics across train and validation folds.

Current grouped-CV results:

- XGBoost ROC-AUC: **0.786**
- XGBoost PR-AUC: **0.376**

Because the classes are imbalanced, accuracy is not treated as the main metric. Recall, F1, PR-AUC and ROC-AUC are emphasized instead.

A prototype alert threshold of **0.30** is used to improve flood-event recall.

### 4. Web App — 50–60 seconds

#### Overview

Open the national overview and show:

- interactive 29-district map
- Low / Medium / High hazard categories
- district selection
- rainfall, river, terrain and population summary

Clarify that the map shown is a **2025 retrospective model view**, not a live operational forecast.

#### District Risk

Select one district, for example **Swat**.

Show:

- hazard score
- risk category
- annual and monsoon rainfall
- elevation and slope
- river and drainage information
- mapped infrastructure context
- historical flood evidence

Then briefly show the **Scenario Lab**. Change rainfall inputs and run the model to demonstrate that the frontend calls the deployed FastAPI/XGBoost backend.

#### Relief Priority

Open the Relief Priority page.

Explain that hazard and relief priority are intentionally separate. A district can have high hazard but different population/access constraints.

The current relief-priority layer combines:

- hazard probability
- population exposure
- accessibility gap

This is a transparent decision-support heuristic rather than a second trained model.

### 5. Closing — 15 seconds

FloodShield demonstrates an end-to-end pipeline from geospatial and historical data to machine learning, API deployment and an interactive decision-support dashboard. Its main value is not claiming perfect prediction; it is combining risk, evidence and exposure in one interpretable prototype that can be improved with live rainfall and river-gauge feeds in future.

---

## One-Sentence Summary

**FloodShield is a district-level flood-risk and relief-prioritization prototype for Pakistan that combines rainfall, terrain, river, drainage and exposure data with an XGBoost model and an interactive web dashboard.**

---

## What NOT to Claim During the Demo

Do not say:

- “This predicts floods in real time.”
- “This is an official warning system.”
- “This probability means there is exactly a 72% real-world chance of flooding.”
- “Zero hospitals means the district has no hospitals.”
- “The model is 78.6% accurate.”

Instead say:

- “This is a research prototype.”
- “The national dashboard currently shows a retrospective 2025 model view.”
- “The model score is used as a hazard signal.”
- “OSM counts depend on mapping/tag completeness.”
- “XGBoost achieved a mean grouped-CV ROC-AUC of 0.786.”
