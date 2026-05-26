import { VercelRequest, VercelResponse } from '@vercel/node';
import { listUsers, upsertUserProfile } from '../../data-store.js';
import { normalizeUserRecord } from '../../auth-utils.js';
import { requireAuth, denyMethod } from './_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  if (req.method === 'GET') {
    try {
      if (authUser.role === 'admin') {
        const users = await listUsers();
        return res.json({ users });
      }

      return res.json({ user: authUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to load users.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const nextUser = normalizeUserRecord(req.body);
      if (!nextUser) {
        return res.status(400).json({ error: 'Malformed user payload.' });
      }

      if (authUser.id !== nextUser.uid && authUser.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied.' });
      }

      const savedUser = await upsertUserProfile({
        id: nextUser.uid,
        email: nextUser.email,
        name: nextUser.name,
        role: nextUser.role,
        createdAt: nextUser.createdAt || new Date().toISOString(),
      });

      return res.json({ user: savedUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to save user.' });
    }
  }

  return denyMethod(res);
}