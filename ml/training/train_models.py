import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'preprocessing'))

import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (accuracy_score, precision_score,
                              recall_score, f1_score, roc_auc_score,
                              classification_report, confusion_matrix)
import matplotlib.pyplot as plt
import seaborn as sns
from preprocess import (load_and_clean_data, encode_features,
                         feature_engineering, split_and_scale)


def evaluate_model(name, model, X_test, y_test):
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    results = {
        'Model': name,
        'Accuracy': accuracy_score(y_test, y_pred),
        'Precision': precision_score(y_test, y_pred),
        'Recall': recall_score(y_test, y_pred),
        'F1-Score': f1_score(y_test, y_pred),
        'ROC-AUC': roc_auc_score(y_test, y_prob)
    }

    print(f"\n{'='*40}")
    print(f"Model: {name}")
    print(f"{'='*40}")
    for k, v in results.items():
        if k != 'Model':
            print(f"  {k}: {v:.4f}")
    print(classification_report(y_test, y_pred))

    return results


def plot_comparison(results_df, save_dir):
    metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC']
    x = np.arange(len(metrics))
    width = 0.25

    fig, ax = plt.subplots(figsize=(12, 6))

    for i, (_, row) in enumerate(results_df.iterrows()):
        ax.bar(x + i * width, [row[m] for m in metrics], width, label=row['Model'])

    ax.set_xlabel('Metrics')
    ax.set_ylabel('Score')
    ax.set_title('Model Comparison')
    ax.set_xticks(x + width)
    ax.set_xticklabels(metrics)
    ax.legend()
    ax.set_ylim(0, 1)
    ax.grid(axis='y', alpha=0.3)

    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'model_comparison.png'))
    print(f"Saved comparison chart to {save_dir}")
    plt.show()


def train_all(data_path='../../data/telco_churn.csv',
              save_dir='../saved_models'):

    # Preprocessing
    df = load_and_clean_data(data_path)
    df = encode_features(df)
    df = feature_engineering(df)
    X_train, X_test, y_train, y_test, features = split_and_scale(df, save_dir=save_dir)

    os.makedirs(save_dir, exist_ok=True)

    # Define models
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': XGBClassifier(use_label_encoder=False,
                                  eval_metric='logloss',
                                  random_state=42)
    }

    results = []
    trained_models = {}

    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        result = evaluate_model(name, model, X_test, y_test)
        results.append(result)
        trained_models[name] = model
        joblib.dump(model, os.path.join(save_dir, f"{name.replace(' ', '_')}.pkl"))

    results_df = pd.DataFrame(results)

    # Find best model by ROC-AUC
    best_model_name = results_df.loc[results_df['ROC-AUC'].idxmax(), 'Model']
    best_model = trained_models[best_model_name]

    print(f"\n✅ Best Model: {best_model_name}")
    joblib.dump(best_model, os.path.join(save_dir, 'best_model.pkl'))
    joblib.dump(best_model_name, os.path.join(save_dir, 'best_model_name.pkl'))

    # Save results
    results_df.to_csv(os.path.join(save_dir, 'model_results.csv'), index=False)

    plot_comparison(results_df, save_dir)

    return results_df, best_model, features


if __name__ == "__main__":
    results, best_model, features = train_all()
    print("\nAll models trained and saved.")
    print(results[['Model', 'Accuracy', 'F1-Score', 'ROC-AUC']])