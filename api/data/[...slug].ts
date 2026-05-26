import { VercelRequest, VercelResponse } from '@vercel/node';
import { appendLog, deleteReviewById, listInsights, listLogs, listReviews, listUsers, upsertInsight, upsertReview, upsertUserProfile } from '../../data-store.js';
import { normalizeUserRecord } from '../../auth-utils.js';
import { getAuthenticatedUser, readUserById } from '../../auth-service.js';

function denyMethod(res: VercelResponse) {
  return res.status(405).json({ error: 'Method not allowed' });
}

async function requireAuth(req: VercelRequest, res: VercelResponse) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    res.status(401).json({ error: 'Not authenticated.' });
    return null;
  }

  return authUser;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug : req.query.slug ? [String(req.query.slug)] : [];
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  const [collection, first, second] = slug;

  if (collection === 'reviews') {
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

    if (req.method === 'DELETE' && first) {
      if (authUser.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied.' });
      }

      try {
        await deleteReviewById(first);
        return res.json({ success: true });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to delete review.' });
      }
    }

    return denyMethod(res);
  }

  if (collection === 'insights') {
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

  if (collection === 'logs') {
    if (req.method === 'GET') {
      if (authUser.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied.' });
      }

      try {
        const logs = await listLogs(50);
        return res.json({ logs });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to load logs.' });
      }
    }

    if (req.method === 'POST') {
      try {
        const { action, details } = req.body || {};
        if (!action || !details) {
          return res.status(400).json({ error: 'Action and details are required.' });
        }

        const logEntry = {
          id: `log-${Math.random().toString(36).substring(2, 11)}`,
          userEmail: authUser.email,
          action: String(action),
          details: String(details),
          timestamp: new Date().toISOString(),
        };

        await appendLog(logEntry);
        return res.json({ success: true, log: logEntry });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to save log.' });
      }
    }

    return denyMethod(res);
  }

  if (collection === 'users') {
    if (req.method === 'GET') {
      if (first) {
        if (authUser.id !== first && authUser.role !== 'admin') {
          return res.status(403).json({ error: 'Access denied.' });
        }

        try {
          const user = await readUserById(first);
          if (!user) {
            return res.status(404).json({ error: 'Account not found.' });
          }

          return res.json({ user });
        } catch (err: any) {
          return res.status(500).json({ error: err.message || 'Failed to load user.' });
        }
      }

      if (authUser.role === 'admin') {
        try {
          const users = await listUsers();
          return res.json({ users });
        } catch (err: any) {
          return res.status(500).json({ error: err.message || 'Failed to load users.' });
        }
      }

      return res.json({ user: authUser });
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

  return res.status(404).json({ error: 'Not found.' });
}