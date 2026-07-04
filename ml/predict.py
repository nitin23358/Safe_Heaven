"""
SafeHaven ML Prediction
Location -> Crime Count -> Reviews -> Safetipin Features -> Model -> Prediction

Called by Express backend on every Analyze request.
Usage: echo '{"crime_count":5,...}' | python predict.py
"""

import sys
import json
import os
import numpy as np
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
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


def engineer_single(features: dict) -> dict:
    f = features.copy()
    f['crime_severity_index'] = f['crime_count'] * f['avg_severity']
    f['night_risk_index'] = f['night_crime_ratio'] * f['crime_count']
    f['environment_score'] = (
        f['lighting_score'] + f['walkability'] + f['visibility']
        + f['public_transport'] + f['security_feeling']
    ) / 5
    f['community_trust'] = f['avg_rating'] * f['women_review_ratio']
    return f


def get_risk_level(score: float) -> str:
    if score >= 75:
        return 'Low'
    if score >= 55:
        return 'Moderate'
    return 'High'


def fallback_predict(features: dict) -> dict:
    """Rule-based fallback when model file is missing."""
    crime_penalty = min(35, features['crime_count'] * 1.5 + features['avg_severity'] * 5)
    night_penalty = features['night_crime_ratio'] * 15
    env_bonus = (
        features['lighting_score'] + features['walkability'] + features['visibility']
        + features['public_transport'] + features['security_feeling']
    ) / 5 * 2
    review_bonus = features['avg_rating'] * 5 + features['women_review_ratio'] * 10
    score = max(20, min(98, 90 - crime_penalty - night_penalty + env_bonus + review_bonus - 30))

    return {
        'safety_score': round(score),
        'confidence': 0.72,
        'risk_level': get_risk_level(score),
        'model_used': 'rule_based_fallback',
        'feature_breakdown': {
            'crime_impact': round(crime_penalty, 1),
            'night_risk_impact': round(night_penalty, 1),
            'environment_bonus': round(env_bonus, 1),
            'community_bonus': round(review_bonus, 1),
        },
    }


def predict(features: dict) -> dict:
    for col in FEATURE_COLUMNS:
        if col not in features:
            raise ValueError(f'Missing feature: {col}')

    engineered = engineer_single(features)

    if not os.path.exists(MODEL_PATH):
        result = fallback_predict(features)
        result['features_used'] = FEATURE_COLUMNS
        return result

    bundle = joblib.load(MODEL_PATH)
    model = bundle['model']
    columns = bundle['feature_columns']

    X = np.array([[engineered[c] for c in columns]])
    raw_score = float(model.predict(X)[0])
    score = max(0, min(100, round(raw_score)))

    meta = {}
    if os.path.exists(META_PATH):
        with open(META_PATH) as f:
            meta = json.load(f)

    return {
        'safety_score': score,
        'confidence': round(min(0.95, meta.get('r2', 0.85) + 0.05), 2),
        'risk_level': get_risk_level(score),
        'model_used': 'RandomForestRegressor',
        'feature_breakdown': {
            'crime_impact': round(engineered['crime_severity_index'], 2),
            'night_risk_index': round(engineered['night_risk_index'], 2),
            'environment_score': round(engineered['environment_score'], 2),
            'community_trust': round(engineered['community_trust'], 2),
        },
        'top_features': meta.get('top_features', []),
        'features_used': columns,
    }


def main():
    try:
        raw = sys.stdin.read().strip()
        if not raw:
            print(json.dumps({'error': 'No input provided'}))
            sys.exit(1)

        payload = json.loads(raw)
        features = payload.get('features', payload)
        result = predict(features)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    main()
