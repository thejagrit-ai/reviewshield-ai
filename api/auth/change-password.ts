import { VercelRequest, VercelResponse } from '@vercel/node';
import { changePassword, getAuthenticatedUser } from '../../auth-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  const { oldPassword, newPassword } = (req.body || {}) as any;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new password are required.' });
  }

  try {
    await changePassword(authUser.id, String(oldPassword), String(newPassword));

    return res.json({ success: true });
  } catch (err: any) {
    console.error('api:auth:change-password:error', err);
    return res.status(err?.statusCode || 500).json({ error: err.message || 'Failed to change password.' });
  }
}
