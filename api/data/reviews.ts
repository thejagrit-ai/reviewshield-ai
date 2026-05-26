import { VercelRequest, VercelResponse } from '@vercel/node';
import { listReviews, upsertReview } from '../../data-store.js';
import { requireAuth, denyMethod } from './_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  if (req.method === 'GET') {
    try {
      const reviews = await listReviews(authUser.id, authUser.role === 'admin');
      return res.json({ reviews });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to load reviews.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { review } = req.body || {};
      if (!review || !review.id) {
        return res.status(400).json({ error: 'Review payload is required.' });
      }

      await upsertReview(review, authUser.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to save review.' });
    }
  }

  return denyMethod(res);
}