const { spawn } = require('child_process');
const path = require('path');

const ML_DIR = path.join(__dirname, '..', '..', 'ml');
const PREDICT_SCRIPT = path.join(ML_DIR, 'predict.py');

function ruleBasedPredict(features) {
  const crimePenalty = Math.min(35, features.crime_count * 1.5 + features.avg_severity * 5);
  const nightPenalty = features.night_crime_ratio * 15;
  const envBonus =
    (features.lighting_score +
      features.walkability +
      features.visibility +
      features.public_transport +
      features.security_feeling) /
    5 *
    2;
  const reviewBonus = features.avg_rating * 5 + features.women_review_ratio * 10;
  const score = Math.max(20, Math.min(98, 90 - crimePenalty - nightPenalty + envBonus + reviewBonus - 30));

  return {
    safety_score: Math.round(score),
    confidence: 0.72,
    risk_level: score >= 75 ? 'Low' : score >= 55 ? 'Moderate' : 'High',
    model_used: 'rule_based_fallback',
    feature_breakdown: {
      crime_impact: Math.round(crimePenalty * 10) / 10,
      night_risk_impact: Math.round(nightPenalty * 10) / 10,
      environment_bonus: Math.round(envBonus * 10) / 10,
      community_bonus: Math.round(reviewBonus * 10) / 10,
    },
  };
}

function runPythonPredict(features) {
  return new Promise((resolve) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const proc = spawn(pythonCmd, [PREDICT_SCRIPT], {
      cwd: ML_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 || !stdout.trim()) {
        console.warn('ML predict fallback:', stderr || 'Python script failed');
        resolve(ruleBasedPredict(features));
        return;
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) {
          resolve(ruleBasedPredict(features));
        } else {
          resolve(result);
        }
      } catch {
        resolve(ruleBasedPredict(features));
      }
    });

    proc.on('error', () => resolve(ruleBasedPredict(features)));

    proc.stdin.write(JSON.stringify({ features }));
    proc.stdin.end();
  });
}

async function predictSafety(features) {
  return runPythonPredict(features);
}

module.exports = { predictSafety, ruleBasedPredict };
