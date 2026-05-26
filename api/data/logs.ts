import { VercelRequest, VercelResponse } from '@vercel/node';
import { appendLog, listLogs } from '../../data-store.js';
import { requireAuth, denyMethod } from './_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authUser = await requireAuth(req, res);
  if (!authUser) return;

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