import { VercelRequest, VercelResponse } from '@vercel/node';
import { signupUser } from '../../auth-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, name } = (req.body || {}) as any;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  try {
    const payload = await signupUser(String(email), String(password), String(name));
    return res.json(payload);
  } catch (err: any) {
    console.error('api:auth:signup:error', err);
    return res.status(err?.statusCode || 500).json({ error: err.message || 'Failed to create account.' });
  }
}
