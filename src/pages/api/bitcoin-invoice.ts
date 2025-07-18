import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, classId } = req.body;
  const SPEED_SECRET_KEY = process.env.SPEED_SECRET_KEY;

  if (!SPEED_SECRET_KEY) {
    return res.status(500).json({ error: 'Missing Speed credentials' });
  }

  try {
    const response = await fetch('https://api.speed.app/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SPEED_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: 9.50,
        currency: 'USD',
        description: 'Class Booking',
        customer_email: email,
        metadata: { name, classId },
        success_url: `${req.headers.origin}/thank-you`,
        cancel_url: `${req.headers.origin}/book/${classId}`,
      }),
    });
    const data = await response.json();
    if (!data || !data.invoice_url) throw new Error('No invoice URL returned');
    return res.status(200).json({ url: data.invoice_url });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create Speed invoice' });
  }
} 