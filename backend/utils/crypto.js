import { createHash, randomBytes } from 'crypto';

export function generateCodeChallenge() {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}

export function generateRandomState() {
  return randomBytes(16).toString('hex');
}