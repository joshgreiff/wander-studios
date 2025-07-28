import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, classId } = req.body;
  const SPEED_SECRET_KEY = process.env.SPEED_SECRET_KEY;

  console.log('=== BITCOIN PAYMENT DEBUG ===');
  console.log('Request body:', { name, email, classId });
  console.log('SPEED_SECRET_KEY exists:', !!SPEED_SECRET_KEY);
  console.log('SPEED_SECRET_KEY length:', SPEED_SECRET_KEY?.length);
  console.log('SPEED_SECRET_KEY starts with:', SPEED_SECRET_KEY?.substring(0, 10) + '...');
  console.log('SPEED_ENV:', process.env.SPEED_ENV);
  console.log('NODE_ENV:', process.env.NODE_ENV);

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

    // Use correct Speed API endpoints
    const SPEED_API_URL = process.env.SPEED_ENV === 'test' || process.env.NODE_ENV === 'development' 
      ? 'https://api-test.tryspeed.com/payments' 
      : 'https://api.tryspeed.com/payments';
    
    console.log('Using Speed API URL:', SPEED_API_URL);
    console.log('Origin:', req.headers.origin);
    
    // Use Basic Auth with API key as username (no password required)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${SPEED_SECRET_KEY}:`).toString('base64')}`,
    };
    
    console.log('Request headers:', headers);
    
    const response = await fetch(SPEED_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('Speed API response status:', response.status);
    console.log('Speed API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speed API error response:', errorText);
      return res.status(response.status).json({ 
        error: `Speed API error: ${response.status} - ${errorText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: SPEED_API_URL,
          authMethod: 'Basic Auth with API key as username'
        }
      });
    }

    const data = await response.json();
    console.log('Speed API success response:', data);

    // Speed API returns a payment object, not an invoice_url
    // We need to construct the checkout URL using the payment ID
    if (!data || !data.id) {
      console.error('No payment ID in response:', data);
      throw new Error('No payment ID returned');
    }

    // Check if Speed provides a checkout URL directly
    let checkoutUrl = data.checkout_url || data.url || data.payment_url;
    
    // If no direct URL provided, construct it manually
    if (!checkoutUrl) {
      // Try different checkout URL formats based on Speed API patterns
      // Option 1: Direct checkout without /pay/ prefix
      checkoutUrl = `https://checkout.tryspeed.com/${data.id}`;
      
      // Option 2: Alternative domain
      // checkoutUrl = `https://pay.tryspeed.com/${data.id}`;
      
      // Option 3: With /pay/ prefix (original attempt)
      // checkoutUrl = `https://checkout.tryspeed.com/pay/${data.id}`;
      
      // Option 4: Using a different path structure
      // checkoutUrl = `https://checkout.tryspeed.com/payment/${data.id}`;
    }
    
    console.log('=== BITCOIN PAYMENT SUCCESS ===');
    console.log('Payment ID:', data.id);
    console.log('Checkout URL:', checkoutUrl);
    console.log('Full response data:', JSON.stringify(data, null, 2));
    
    return res.status(200).json({ url: checkoutUrl });
  } catch (error: unknown) {
    console.error('=== BITCOIN PAYMENT ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: `Failed to create Speed invoice: ${error.message}`,
        details: {
          type: error.constructor.name,
          stack: error.stack
        }
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create Speed invoice',
      details: {
        type: typeof error,
        error: String(error)
      }
    });
  }
} 