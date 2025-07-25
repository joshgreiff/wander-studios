import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SPEED_SECRET_KEY = process.env.SPEED_SECRET_KEY;

  if (!SPEED_SECRET_KEY) {
    return res.status(500).json({ error: 'Missing SPEED_SECRET_KEY environment variable' });
  }

  try {
    console.log('Testing Speed API connection...');
    
    // Use test endpoint if in test mode
    const SPEED_API_URL = process.env.SPEED_ENV === 'test' || process.env.NODE_ENV === 'development' 
      ? 'https://api-test.speed.app/invoice' 
      : 'https://api.speed.app/invoice';
    
    console.log('Testing Speed API connection with URL:', SPEED_API_URL);
    
    // Test with a minimal request
    const response = await fetch(SPEED_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SPEED_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: 1.00,
        currency: 'USD',
        description: 'Test Invoice',
        customer_email: 'test@example.com',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
      }),
    });

    console.log('Speed API test response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Speed API test failed: ${response.status} - ${errorText}`,
        status: response.status
      });
    }

    const data = await response.json();
    return res.status(200).json({ 
      success: true, 
      message: 'Speed API connection successful',
      data: data
    });

  } catch (error: unknown) {
    console.error('Speed API test error:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: `Speed API test failed: ${error.message}`,
        type: error.constructor.name
      });
    }
    
    return res.status(500).json({ 
      error: 'Speed API test failed: Unknown error',
      type: 'Unknown'
    });
  }
} 