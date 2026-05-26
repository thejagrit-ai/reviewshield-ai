import { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteAccount, getAuthenticatedUser } from '../../auth-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    await deleteAccount(authUser.id);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('api:auth:account:delete:error', err);
    return res.status(500).json({ error: err.message || 'Failed to delete account.' });
  }
}
