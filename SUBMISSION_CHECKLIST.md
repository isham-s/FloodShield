# FloodShield — Final Submission Checklist

## Repository
- [x] Public GitHub repository exists
- [x] Frontend source included
- [x] Backend source included
- [x] Trained model bundle included
- [x] Detailed README included
- [x] Methodology file included
- [x] Demo guide included
- [x] Viva/Q&A guide included

## Deployment
- [x] FastAPI backend deployed on Render
- [x] Vercel frontend deployed
- [x] Frontend connected to Render through `VITE_API_URL`
- [x] Scenario Lab tested
- [x] Interactive district map tested
- [x] Tabs and district search tested

## Live URLs
- Frontend: https://floo-shield-l9ql359lp-capstone-fdc2.vercel.app/
- Backend: https://floodshield-api.onrender.com/
- API docs: https://floodshield-api.onrender.com/docs
- Repository: https://github.com/isham-s/FloodShield

## Before Final Presentation
- [ ] Open Render once before the demo so a free instance can wake up if it has slept
- [ ] Open the Vercel app and test Scenario Lab before presenting
- [ ] Keep the live app, GitHub README and API docs open in separate browser tabs
- [ ] Prepare one district to demonstrate, preferably one with clear historical context
- [ ] Know the three model-comparison results
- [ ] Know why grouped CV was used
- [ ] Know why accuracy is not the main metric
- [ ] Know why post-flood damage variables were excluded
- [ ] Be ready to explain the 0.30 alert threshold
- [ ] Be ready to explain hazard vs relief priority
- [ ] State clearly that FloodShield is a research prototype, not an official warning system

## Core Numbers to Remember

### Data
- 29 selected districts
- 2010–2025 modelling window
- 464 district-year rows in the master table

### Grouped-CV Model Comparison
- XGBoost ROC-AUC: 0.786
- XGBoost PR-AUC: 0.376
- Random Forest ROC-AUC: 0.759
- Logistic Regression ROC-AUC: 0.699

### Prototype Threshold
- Alert threshold: 0.30
- Out-of-fold recall at threshold: approximately 0.619
- Out-of-fold F1 at threshold: approximately 0.394

## Best 30-Second Explanation

FloodShield is a district-level flood-risk decision-support prototype for Pakistan. We combine rainfall, terrain, river and drainage features to estimate flood hazard using XGBoost, validate the model by keeping districts separated across folds, and then combine hazard with exposure context to produce a relief-priority ranking. The result is deployed as a FastAPI backend and an interactive Vercel dashboard covering 29 selected districts.
