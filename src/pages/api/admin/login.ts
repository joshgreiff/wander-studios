import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Server-side only, no NEXT_PUBLIC_

  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  if (password === ADMIN_PASSWORD) {
    // In a production app, you'd want to use proper session management
    // For now, we'll return a simple success response
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful' 
    });
  } else {
    return res.status(401).json({ 
      success: false, 
      error: 'Incorrect password' 
    });
  }
} 