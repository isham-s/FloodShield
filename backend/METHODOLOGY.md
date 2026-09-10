# FloodShield Model Methodology

## Objective
Predict district-year flood hazard probability from pre-event/environmental variables.

## Coverage
- 29 Pakistan districts
- 2010–2025
- Consolidated table: 464 district-year rows
- Primary training subset: 192 confirmed-label rows
- Confirmed positives: 21
- Confirmed negatives: 171

## Why assumed negatives were excluded
The master table contains rows labelled `assumed_negative`. Absence from an event compilation does not prove a flood did not occur. To reduce label noise, the primary model is trained only on confirmed positives and confirmed negatives.

## Hazard features
Rainfall, elevation/slope, river-network characteristics, drainage-network characteristics.

Infrastructure, population, flood severity and flood damage are not used to predict whether a flood occurs. Population/accessibility are kept for a separate relief-priority layer.

## Validation
5-fold StratifiedGroupKFold grouped by district. This reduces leakage caused by repeating static district features across years.

## Models compared
Logistic Regression, Random Forest, XGBoost.

## Selected model
XGBoost, selected because it had the strongest overall grouped-validation discrimination in this dataset.

Grouped CV metrics:
- ROC-AUC: 0.786
- PR-AUC: 0.376
- Recall at default 0.5 varies by fold; prototype alert threshold is 0.30.

At threshold 0.30 using out-of-fold predictions:
- Precision: 0.289
- Recall: 0.619
- F1: 0.394
- TP / FN / FP / TN: 13 / 8 / 32 / 139

## Important limitation
This is a capstone prototype, not an operational early-warning system. The model should never be presented as an official NDMA/PDMA warning. Real-time deployment requires current rainfall/river observations matching the training feature definitions and external validation.
