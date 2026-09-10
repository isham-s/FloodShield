from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

BUNDLE_PATH = "floodshield_xgboost_bundle.joblib"
bundle = joblib.load(BUNDLE_PATH)
model = bundle["model"]
features = bundle["features"]
threshold = bundle["alert_threshold"]

app = FastAPI(title="FloodShield API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your Vercel domain after deployment
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    annual_rainfall_mm: float
    monsoon_rainfall_mm: float
    max_daily_rainfall_mm: float
    rainy_days: float
    extreme_rain_days_50mm: float
    mean_elevation_m: float
    min_elevation_m: float
    max_elevation_m: float
    mean_slope_deg: float
    max_slope_deg: float
    river_length_km: float
    river_density_km_per_km2: float
    river_reach_count: float
    mean_longterm_discharge_cms: float
    max_longterm_discharge_cms: float
    max_strahler_order: float
    drainage_density_km_per_km2: float
    avg_dist_drainage_km: float

@app.get("/")
def root():
    return {
        "name": "FloodShield API",
        "status": "ok",
        "warning": "Prototype risk model; not an official flood warning service."
    }

@app.post("/predict")
def predict(payload: PredictionInput):
    row = pd.DataFrame([payload.model_dump()])[features]
    p = float(model.predict_proba(row)[0, 1])

    if p < 0.20:
        risk = "LOW"
    elif p < 0.40:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    return {
        "flood_probability": round(p, 4),
        "risk_level": risk,
        "alert": bool(p >= threshold),
        "alert_threshold": threshold,
        "disclaimer": "Prototype FloodShield risk alert; verify with official NDMA/PDMA warnings."
    }
