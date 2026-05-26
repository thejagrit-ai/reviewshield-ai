import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUser } from '../../auth-service.js';

export async function requireAuth(req: VercelRequest, res: VercelResponse) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    res.status(401).json({ error: 'Not authenticated.' });
    return null;
  }

  return authUser;
}

export function denyMethod(res: VercelResponse) {
  return res.status(405).json({ error: 'Method not allowed' });
}