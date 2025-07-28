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
    console.log('=== SPEED API TEST DEBUG ===');
    console.log('SPEED_SECRET_KEY starts with:', SPEED_SECRET_KEY.substring(0, 10) + '...');
    console.log('SPEED_SECRET_KEY ends with:', '...' + SPEED_SECRET_KEY.substring(SPEED_SECRET_KEY.length - 4));
    console.log('SPEED_SECRET_KEY length:', SPEED_SECRET_KEY.length);
    console.log('SPEED_SECRET_KEY contains "test":', SPEED_SECRET_KEY.includes('test'));
    console.log('SPEED_SECRET_KEY contains "live":', SPEED_SECRET_KEY.includes('live'));
    console.log('SPEED_ENV:', process.env.SPEED_ENV);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Use correct Speed API endpoints
    const SPEED_API_URL = process.env.SPEED_ENV === 'test' || process.env.NODE_ENV === 'development' 
      ? 'https://api-test.tryspeed.com/payments' 
      : 'https://api.tryspeed.com/payments';
    
    console.log('Using Speed API URL:', SPEED_API_URL);
    console.log('Expected environment based on key:', SPEED_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE');
    
    // Use Basic Auth with API key as username (no password required)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${SPEED_SECRET_KEY}:`).toString('base64')}`,
    };
    
    console.log('Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': headers['Authorization'].substring(0, 20) + '...'
    });
    
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
      console.error('Speed API error response:', errorText);
      return res.status(response.status).json({ 
        error: `Speed API test failed: ${response.status} - ${errorText}`,
        status: response.status,
        details: {
          authMethod: 'Basic Auth with API key as username',
          apiUrl: SPEED_API_URL,
          keyPrefix: SPEED_SECRET_KEY.substring(0, 7),
          keySuffix: SPEED_SECRET_KEY.substring(SPEED_SECRET_KEY.length - 4),
          environment: process.env.SPEED_ENV || 'not set',
          nodeEnv: process.env.NODE_ENV,
          keyLength: SPEED_SECRET_KEY.length,
          isTestKey: SPEED_SECRET_KEY.includes('test'),
          isLiveKey: SPEED_SECRET_KEY.includes('live'),
          expectedEnv: SPEED_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'
        }
      });
    }

    const data = await response.json();
    return res.status(200).json({ 
      success: true, 
      message: 'Speed API connection successful',
      data: data,
      debug: {
        apiUrl: SPEED_API_URL,
        keyPrefix: SPEED_SECRET_KEY.substring(0, 7),
        environment: process.env.SPEED_ENV || 'not set',
        expectedEnv: SPEED_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'
      }
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