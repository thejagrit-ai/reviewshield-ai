import { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteReviewById } from '../../../data-store.js';
import { requireAuth, denyMethod } from '../_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  if (req.method !== 'DELETE') {
    return denyMethod(res);
  }

  if (authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const reviewId = String(req.query.id || req.query[0] || '');
  if (!reviewId) {
    return res.status(400).json({ error: 'Review id is required.' });
  }

  try {
    await deleteReviewById(reviewId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete review.' });
  }
}