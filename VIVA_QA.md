# FloodShield — Viva / Q&A Preparation

## What problem does FloodShield solve?
FloodShield helps compare flood hazard across selected Pakistani districts and then adds exposure/context to rank where relief attention may be more urgent. It is a district-level decision-support prototype.

## Why did you use XGBoost?
We compared Logistic Regression, Random Forest and XGBoost under district-grouped cross-validation. XGBoost gave the strongest overall discrimination on the available dataset, with a mean ROC-AUC of about 0.786 and PR-AUC of about 0.376.

## Why not use accuracy?
The flood label is imbalanced, so a model can look accurate by predicting the majority class too often. That is why we focus more on recall, F1, PR-AUC and ROC-AUC.

## Why grouped cross-validation?
The dataset contains multiple years for the same district while many terrain, river and infrastructure variables are static or slowly changing. A random split can place the same district in both train and validation sets, making validation too optimistic. Grouping by district reduces that leakage.

## What is target leakage and how did you avoid it?
Target leakage happens when information that would only be known after a flood is used to predict whether the flood happened. We excluded post-event variables such as deaths, people affected, houses damaged/destroyed, severity and flood type from the hazard model.

## Why are population and infrastructure not all inside the flood model?
We separated physical hazard from exposure. Rainfall, terrain, rivers and drainage describe the hazard. Population and accessibility are more useful for deciding potential impact and relief priority. Keeping the layers separate also makes the system easier to explain.

## How is relief priority calculated?
The current prototype combines the model hazard score with a transparent exposure index based mainly on population and accessibility gap. It is a heuristic decision-support score, not a second trained model.

## Why is the alert threshold 0.30 instead of 0.50?
For floods, missing a true flood can be more costly than generating some extra false alarms. A lower prototype threshold improved recall. At 0.30, out-of-fold XGBoost recall was about 0.619, with precision about 0.289 and F1 about 0.394.

## What does ROC-AUC 0.786 mean?
It measures how well the model ranks positive flood cases above negative cases across thresholds. A value around 0.786 indicates useful discrimination on this dataset, but it does not mean the model is 78.6% accurate.

## Why is PR-AUC important here?
Precision–Recall AUC is useful when the positive class is relatively rare because it focuses on performance for the positive class rather than being dominated by many negatives.

## Is this a real-time flood warning system?
No. The deployed application is a research prototype. The national map currently represents a retrospective 2025 model view. A true operational warning system would require live/forecast rainfall, real-time river gauges, operational validation and official alert protocols.

## What happens in the Scenario Lab?
The user changes rainfall-related values and the frontend sends the hazard features to the deployed FastAPI backend. The backend loads the trained XGBoost bundle and returns a model hazard score, risk band and prototype alert result.

## What data sources did you use?
Rainfall comes from CHIRPS; elevation/slope from SRTM 30 m through OpenTopoData; river-network features from HydroRIVERS/HydroSHEDS; infrastructure from OpenStreetMap-derived summaries; historical flood data from the compiled project records citing sources including NDMA, OCHA and World Bank/GFDRR reports; and district boundary files are used for spatial extraction and mapping.

## Why 29 districts?
The project scope was limited to 29 selected districts so the team could build a complete end-to-end pipeline within the available capstone time. The aim is to demonstrate a scalable methodology rather than claim full national operational coverage.

## What is the biggest limitation?
Historical flood labels are sparse and some negative labels are less certain than positive event records. This limits how confidently the model can generalize. Better verified historical labels and live hydrometeorological data would be the highest-value improvements.

## What about zero hospitals/schools in some districts?
Those values are derived from OpenStreetMap tagging. A zero can reflect incomplete mapping or tagging and should not automatically be interpreted as true absence. The dashboard explicitly warns about this.

## Why not use deep learning?
The main dataset is structured tabular district-year data and is not large. Tree-based methods such as XGBoost are more appropriate, easier to validate and easier to explain than adding deep learning just for complexity.

## Why not use satellite segmentation?
Satellite flood-extent detection is a useful future extension, but it is a different task from district-level pre-event hazard classification and would require imagery preprocessing, labels and substantial additional validation. The capstone prioritizes a complete and feasible end-to-end system.

## How would you improve FloodShield next?
The next improvements would be live or forecast rainfall, real-time river-gauge data, better verified labels, calibrated probabilities, local SHAP explanations, finer administrative resolution and operational validation with disaster-management stakeholders.

## What is the main innovation?
The project does not stop at a classifier. It combines heterogeneous geospatial and historical data, separates physical hazard from relief exposure, deploys the trained model as an API and presents the result in an interactive district-level decision-support dashboard.

## If a judge says the model performance is not perfect, what do you say?
That is correct, and the project does not claim perfect prediction. Flood modelling is difficult with sparse historical labels. We report the validation results transparently, use grouped validation to avoid inflated scores, identify limitations, and treat the system as a prototype whose data pipeline and deployment can be improved as higher-quality data becomes available.
