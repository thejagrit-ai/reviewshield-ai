import { VercelRequest, VercelResponse } from '@vercel/node';
import { loginUser } from '../../auth-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = (req.body || {}) as any;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const payload = await loginUser(String(email), String(password));
    return res.json(payload);
  } catch (err: any) {
    console.error('api:auth:login:error', err);
    return res.status(err?.statusCode || 500).json({ error: err.message || 'Failed to sign in.' });
  }
}
