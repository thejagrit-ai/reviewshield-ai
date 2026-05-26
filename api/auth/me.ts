import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUser, readUserById } from '../../auth-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  const userRecord = await readUserById(authUser.id);
  const user = userRecord || authUser;
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}
