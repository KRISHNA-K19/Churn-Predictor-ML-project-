import joblib
import numpy as np
import pandas as pd
import shap
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, '..', '..', 'ml', 'saved_models')

# Load model and preprocessing objects
model = joblib.load(os.path.join(MODEL_DIR, 'XGBoost.pkl'))
scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.pkl'))


def preprocess_input(data: dict) -> np.ndarray:
    """Convert raw API input into model-ready feature vector."""
    df = pd.DataFrame([data])

    # Fill TotalCharges if not provided
    if df['TotalCharges'].isna().any():
        df['TotalCharges'] = df['MonthlyCharges'] * df['tenure']

    # Drop ID if present
    if 'customerID' in df.columns:
        df.drop('customerID', axis=1, inplace=True)

    # Encode binary fields
    binary_map = {'Yes': 1, 'No': 0, 'Male': 1, 'Female': 0}
    for col in ['gender', 'Partner', 'Dependents',
                'PhoneService', 'PaperlessBilling']:
        if col in df.columns:
            df[col] = df[col].map(binary_map)

    # One-hot encode
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

    # Feature engineering
    df['charges_per_tenure'] = df['MonthlyCharges'] / (df['tenure'] + 1)
    df['is_high_value'] = (df['MonthlyCharges'] > 70).astype(int)
    df['is_long_term'] = (df['tenure'] > 24).astype(int)

    # Align columns with training features
    for col in feature_names:
        if col not in df.columns:
            df[col] = 0
    df = df[feature_names]

    # Scale
    X_scaled = scaler.transform(df)
    return X_scaled, df


def get_risk_level(probability: float) -> str:
    if probability < 0.3:
        return "Low"
    elif probability < 0.6:
        return "Medium"
    else:
        return "High"


def predict_churn(data: dict) -> dict:
    X_scaled, X_df = preprocess_input(data)

    # Predict
    probability = float(model.predict_proba(X_scaled)[0][1])
    risk_level = get_risk_level(probability)

    # SHAP explanations
    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_scaled)
        importances = dict(zip(feature_names,
                               np.abs(shap_values[0])))
        top_reasons = sorted(importances.items(),
                              key=lambda x: x[1],
                              reverse=True)[:5]
        top_reasons = [{"feature": k, "importance": round(float(v), 4)}
                       for k, v in top_reasons]
    except Exception:
        top_reasons = []

    return {
        "churn_probability": round(probability, 4),
        "risk_level": risk_level,
        "top_reasons": top_reasons
    }