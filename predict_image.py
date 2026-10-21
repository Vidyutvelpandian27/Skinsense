"""Usage: python predict_image.py photo.jpg [models_dir]  -> prints each skin-concern prediction"""
import sys, glob, os, joblib, pandas as pd
from extract_skin_features import extract
row = extract(sys.argv[1]); mdir = sys.argv[2] if len(sys.argv)>2 else "models"
if not row.get("haar_face_detected"): sys.exit("No face detected (Haar cascade).")
X = pd.DataFrame([row])
for p in sorted(glob.glob(f"{mdir}/*.joblib")):
    m = joblib.load(p); name = os.path.basename(p)[:-7]
    print(f"{name:20s} -> {m['model'].predict(X.reindex(columns=m['features']))[0]}")
