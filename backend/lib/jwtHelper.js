const crypto = require('crypto');

function parseExpiry(expiresIn) {
  if (!expiresIn || expiresIn === '24h') return 86400;
  if (typeof expiresIn === 'number') return expiresIn;
  const match = String(expiresIn).match(/^(\d+)([smhd])$/);
  if (!match) return 86400;
  const n = parseInt(match[1], 10);
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * (units[match[2]] || 3600);
}

function signToken(payload, secret, options = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + parseExpiry(options.expiresIn);
  const body = { ...payload, exp };
  const payloadEnc = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payloadEnc}`)
    .digest('base64url');
  return `${header}.${payloadEnc}.${signature}`;
}

module.exports = { signToken };
