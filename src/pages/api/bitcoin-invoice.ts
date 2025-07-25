import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, classId } = req.body;
  const SPEED_SECRET_KEY = process.env.SPEED_SECRET_KEY;

  console.log('Bitcoin payment request:', { name, email, classId, hasKey: !!SPEED_SECRET_KEY });

  if (!SPEED_SECRET_KEY) {
    console.error('Missing SPEED_SECRET_KEY environment variable');
    return res.status(500).json({ error: 'Missing Speed credentials' });
  }

  try {
    console.log('Making request to Speed API...');
    
    const requestBody = {
      amount: 9.50,
      currency: 'USD',
      description: 'Class Booking',
      customer_email: email,
      metadata: { name, classId },
      success_url: `${req.headers.origin}/thank-you`,
      cancel_url: `${req.headers.origin}/book/${classId}`,
    };

    console.log('Request body:', requestBody);

    // Use test endpoint if in test mode
    const SPEED_API_URL = process.env.SPEED_ENV === 'test' || process.env.NODE_ENV === 'development' 
      ? 'https://api-test.speed.app/invoice' 
      : 'https://api.speed.app/invoice';
    
    console.log('Using Speed API URL:', SPEED_API_URL);
    
    const response = await fetch(SPEED_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SPEED_SECRET_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Speed API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speed API error response:', errorText);
      return res.status(response.status).json({ 
        error: `Speed API error: ${response.status} - ${errorText}` 
      });
    }

    const data = await response.json();
    console.log('Speed API success response:', data);

    if (!data || !data.invoice_url) {
      console.error('No invoice URL in response:', data);
      throw new Error('No invoice URL returned');
    }

    return res.status(200).json({ url: data.invoice_url });
  } catch (error: unknown) {
    console.error('Bitcoin payment error:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: `Failed to create Speed invoice: ${error.message}` 
      });
    }
    
    return res.status(500).json({ error: 'Failed to create Speed invoice' });
  }
} 