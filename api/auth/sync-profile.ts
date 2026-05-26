import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUser, syncProfile } from '../../auth-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    const { name, email } = (req.body || {}) as any;
    const user = await syncProfile(authUser.id, String(email || authUser.email), String(name || authUser.name || 'Verified Partner'));
    return res.json({ success: true, user });
  } catch (err: any) {
    console.error('api:sync-profile:error', err);
    return res.status(err?.statusCode || 500).json({ error: err.message || 'Failed to reconcile profile configuration' });
  }
}
