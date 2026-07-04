"""
SafeHaven ML Training Pipeline
Dataset -> Cleaning -> Feature Engineering -> Training -> safety_model.pkl

Run once: python train_model.py
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, 'delhi_dataset.csv')
MODEL_PATH = os.path.join(SCRIPT_DIR, 'safety_model.pkl')
META_PATH = os.path.join(SCRIPT_DIR, 'model_meta.json')

FEATURE_COLUMNS = [
    'crime_count',
    'avg_severity',
    'night_crime_ratio',
    'avg_rating',
    'women_review_ratio',
    'lighting_score',
    'walkability',
    'visibility',
    'public_transport',
    'people_density',
    'security_feeling',
]

TARGET_COLUMN = 'safety_score'


def load_and_clean(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df.dropna()
    df = df.drop_duplicates(subset=['Area'])

    for col in FEATURE_COLUMNS + [TARGET_COLUMN]:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    df = df.dropna()
    return df


def augment_dataset(df: pd.DataFrame, n_samples: int = 200) -> pd.DataFrame:
    """Bootstrap synthetic samples for robust training."""
    rng = np.random.default_rng(42)
    rows = []

    for _ in range(n_samples):
        base = df.sample(1, random_state=int(rng.integers(0, 10000))).iloc[0].copy()
        for col in FEATURE_COLUMNS:
            noise = rng.normal(0, 0.08 * abs(base[col]) if base[col] != 0 else 0.5)
            if col in ('crime_count',):
                base[col] = max(0, base[col] + noise)
            elif col in ('night_crime_ratio', 'women_review_ratio'):
                base[col] = float(np.clip(base[col] + noise * 0.05, 0, 1))
            elif col in ('avg_rating',):
                base[col] = float(np.clip(base[col] + noise * 0.1, 1, 5))
            else:
                base[col] = float(np.clip(base[col] + noise, 1, 10))

        crime_penalty = min(30, base['crime_count'] * 1.2 + base['avg_severity'] * 4)
        night_penalty = base['night_crime_ratio'] * 12
        env_bonus = (
            base['lighting_score'] * 1.5
            + base['walkability'] * 1.2
            + base['visibility'] * 1.0
            + base['public_transport'] * 0.8
            + base['security_feeling'] * 2.0
        ) / 5
        review_bonus = base['avg_rating'] * 4 + base['women_review_ratio'] * 8

        base[TARGET_COLUMN] = float(np.clip(
            95 - crime_penalty - night_penalty + env_bonus + review_bonus - 25,
            20, 98
        ))
        rows.append(base)

    return pd.concat([df, pd.DataFrame(rows)], ignore_index=True)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df['crime_severity_index'] = df['crime_count'] * df['avg_severity']
    df['night_risk_index'] = df['night_crime_ratio'] * df['crime_count']
    df['environment_score'] = (
        df['lighting_score'] + df['walkability'] + df['visibility']
        + df['public_transport'] + df['security_feeling']
    ) / 5
    df['community_trust'] = df['avg_rating'] * df['women_review_ratio']
    return df


def train():
    print('Loading Delhi integrated dataset...')
    df = load_and_clean(DATASET_PATH)
    print(f'  Base records: {len(df)}')

    df = augment_dataset(df)
    df = engineer_features(df)
    print(f'  Augmented records: {len(df)}')

    extra_features = ['crime_severity_index', 'night_risk_index', 'environment_score', 'community_trust']
    all_features = FEATURE_COLUMNS + extra_features

    X = df[all_features]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    print('Training Random Forest model...')
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='r2')

    print(f'  MAE:  {mae:.2f}')
    print(f'  R2:   {r2:.3f}')
    print(f'  CV R2 mean: {cv_scores.mean():.3f}')

    importances = dict(zip(all_features, model.feature_importances_.tolist()))
    top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]

    bundle = {
        'model': model,
        'feature_columns': all_features,
        'base_features': FEATURE_COLUMNS,
    }
    joblib.dump(bundle, MODEL_PATH)

    meta = {
        'model_type': 'RandomForestRegressor',
        'features': all_features,
        'mae': round(mae, 2),
        'r2': round(r2, 3),
        'cv_r2_mean': round(float(cv_scores.mean()), 3),
        'top_features': [{'name': k, 'importance': round(v, 4)} for k, v in top_features],
        'trained_on': 'Delhi integrated dataset (NCRB + Safetipin + community reviews)',
    }
    with open(META_PATH, 'w') as f:
        json.dump(meta, f, indent=2)

    print(f'Model saved to {MODEL_PATH}')
    print(f'Metadata saved to {META_PATH}')
    return bundle


if __name__ == '__main__':
    train()
