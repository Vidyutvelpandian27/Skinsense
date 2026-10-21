"""
Train one classifier per skin concern from the feature CSV.
Usage: python train_models.py features.csv [models_dir]
features.csv = output of extract_skin_features.py merged with REAL labels
(or skin_analysis_dataset_6000.csv, which is synthetic - for testing the pipeline only).
Each target uses only the feature columns from its own algorithm group.
Requires: pip install scikit-learn pandas joblib
"""
import sys, os, joblib, pandas as pd, numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report

TARGETS = {   # label column : feature-column prefix
    "redness_label": "red_", "darkspot_label": "dark_", "wrinkle_label": "wr_",
    "texture_label": "tx_", "oiliness_label": "oil_", "dryness_label": "dry_",
    "pimple_label": "pim_", "skin_tone_category": "tone_",
}
df = pd.read_csv(sys.argv[1]); out = sys.argv[2] if len(sys.argv)>2 else "models"
os.makedirs(out, exist_ok=True)
if "haar_face_detected" in df: df = df[df.haar_face_detected==1]
for target, prefix in TARGETS.items():
    if target not in df.columns: print(f"skip {target}: no labels"); continue
    feats = [c for c in df.columns if c.startswith(prefix) and not c.endswith(("_score","_label"))
             and not c.startswith(("darkspot_","pimple_","redness_","wrinkle_","texture_","oiliness_","dryness_"))]
    if prefix=="dark_": feats += [c for c in ("darkspot_count","darkspot_area_pct") if c in df]
    if prefix=="pim_":  feats += [c for c in ("pimple_count",) if c in df and False]  # count is the label source -> leakage
    d = df.dropna(subset=[target]); X, y = d[feats], d[target].astype(str)
    Xtr,Xte,ytr,yte = train_test_split(X,y,test_size=.2,stratify=y,random_state=42)
    pipe = Pipeline([("imp",SimpleImputer(strategy="median")),("sc",StandardScaler()),
                     ("clf",GradientBoostingClassifier(random_state=42))])
    cv = cross_val_score(pipe,Xtr,ytr,cv=5,scoring="f1_macro").mean()
    pipe.fit(Xtr,ytr)
    print(f"\n=== {target} ({len(feats)} features) | 5-fold macro-F1 {cv:.3f}")
    print(classification_report(yte,pipe.predict(Xte),zero_division=0))
    joblib.dump({"model":pipe,"features":feats}, f"{out}/{target}.joblib")
print("\nSaved models to", out)
