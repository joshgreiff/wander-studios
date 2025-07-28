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
    console.log('SPEED_SECRET_KEY starts with:', SPEED_SECRET_KEY.substring(0, 10) + '...');
    
    // Use correct Speed API endpoints
    const SPEED_API_URL = process.env.SPEED_ENV === 'test' || process.env.NODE_ENV === 'development' 
      ? 'https://api-test.tryspeed.com/payments' 
      : 'https://api.tryspeed.com/payments';
    
    console.log('Testing Speed API connection with URL:', SPEED_API_URL);
    
    // Use Basic Auth with API key as username (no password required)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${SPEED_SECRET_KEY}:`).toString('base64')}`,
    };
    
    console.log('Request headers:', headers);
    
    // Test with a minimal request
    const response = await fetch(SPEED_API_URL, {
      method: 'POST',
      headers,
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
        status: response.status,
        details: {
          authMethod: 'Basic Auth with API key as username'
        }
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