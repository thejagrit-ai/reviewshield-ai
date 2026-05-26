import { VercelRequest, VercelResponse } from '@vercel/node';
import { listInsights, upsertInsight } from '../../data-store.js';
import { requireAuth, denyMethod } from './_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  if (req.method === 'GET') {
    try {
      const insights = await listInsights(authUser.id, authUser.role === 'admin');
      return res.json({ insights });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to load insights.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { insight } = req.body || {};
      if (!insight || !insight.productName) {
        return res.status(400).json({ error: 'Insight payload is required.' });
      }

      await upsertInsight(insight, authUser.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to save insight.' });
    }
  }

  return denyMethod(res);
}