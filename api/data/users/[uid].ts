import { VercelRequest, VercelResponse } from '@vercel/node';
import { readUserById } from '../../../auth-service.js';
import { requireAuth, denyMethod } from '../_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  if (req.method !== 'GET') {
    return denyMethod(res);
  }

  const uid = String(req.query.uid || req.query[0] || '');
  if (!uid) {
    return res.status(400).json({ error: 'User id is required.' });
  }

  if (authUser.id !== uid && authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const user = await readUserById(uid);
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load user.' });
  }
}