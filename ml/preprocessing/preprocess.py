import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os

def load_and_clean_data(filepath):
    df = pd.read_csv(filepath)

    # Drop customerID — not useful for prediction
    df.drop('customerID', axis=1, inplace=True)

    # Fix TotalCharges — convert string to float
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')

    # Fill missing TotalCharges with median
    df['TotalCharges'] = df['TotalCharges'].fillna(df['TotalCharges'].median())

    return df


def encode_features(df):
    df = df.copy()

    # Convert target variable
    df['Churn'] = df['Churn'].map({'Yes': 1, 'No': 0})

    # Binary columns — map Yes/No to 1/0
    binary_cols = ['Partner', 'Dependents', 'PhoneService',
                   'PaperlessBilling', 'gender']

    for col in binary_cols:
        if col in df.columns:
            df[col] = df[col].map({'Yes': 1, 'No': 0,
                                    'Male': 1, 'Female': 0})

    # One-hot encode remaining categorical columns
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

    df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

    df = df.fillna(0)

    return df


def feature_engineering(df):
    df = df.copy()

    # Feature 1: Average monthly usage
    df['charges_per_tenure'] = df['MonthlyCharges'] / (df['tenure'] + 1)

    # Feature 2: High value customer flag
    df['is_high_value'] = (df['MonthlyCharges'] > 70).astype(int)

    # Feature 3: Long-term customer flag
    df['is_long_term'] = (df['tenure'] > 24).astype(int)

    return df


def split_and_scale(df, target_col='Churn', save_dir='../saved_models'):
    X = df.drop(target_col, axis=1)
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Save the scaler and feature names
    os.makedirs(save_dir, exist_ok=True)
    joblib.dump(scaler, os.path.join(save_dir, 'scaler.pkl'))
    joblib.dump(list(X.columns), os.path.join(save_dir, 'feature_names.pkl'))

    print(f"Training size: {X_train.shape}")
    print(f"Test size: {X_test.shape}")
    print(f"Churn rate in training: {y_train.mean():.2%}")

    return X_train_scaled, X_test_scaled, y_train, y_test, X.columns


if __name__ == "__main__":
    df = load_and_clean_data('../../data/telco_churn.csv')
    df = encode_features(df)
    df = feature_engineering(df)
    X_train, X_test, y_train, y_test, features = split_and_scale(df)
    print("Preprocessing complete.")
    print(f"Total features: {len(features)}")