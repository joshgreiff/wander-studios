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
      success_url: `https://wandermovement.space/thank-you`,
      cancel_url: `https://wandermovement.space/book/${classId}`,
    };

    console.log('Request body:', requestBody);

    // Use Speed's Payment Links API instead of Payments API
    // Payment Links create shareable URLs that customers can use directly
    const SPEED_API_URL = 'https://api.tryspeed.com/payment-links';
    
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

    // Log all possible URL fields to see what Speed provides
    console.log('=== SPEED RESPONSE URL FIELDS ===');
    console.log('data.checkout_url:', data.checkout_url);
    console.log('data.url:', data.url);
    console.log('data.payment_url:', data.payment_url);
    console.log('data.hosted_url:', data.hosted_url);
    console.log('data.redirect_url:', data.redirect_url);
    console.log('data.payment_link:', data.payment_link);
    console.log('data.checkout_link:', data.checkout_link);
    console.log('data.public_url:', data.public_url);
    console.log('All data keys:', Object.keys(data));

    // Check if Speed provides a checkout URL directly
    let checkoutUrl = data.checkout_url || data.url || data.payment_url || data.hosted_url || data.redirect_url || data.payment_link || data.checkout_link || data.public_url;
    
    // If no direct URL provided, construct it manually
    if (!checkoutUrl) {
      // Based on Speed's hosted checkout documentation, try these formats:
      // Option 1: Speed's hosted checkout format
      checkoutUrl = `https://app.tryspeed.com/checkout/${data.id}`;
      
      // Option 2: Alternative hosted checkout format
      // checkoutUrl = `https://checkout.tryspeed.com/${data.id}`;
      
      // Option 3: Using Speed's app domain
      // checkoutUrl = `https://app.tryspeed.com/pay/${data.id}`;
      
      // Option 4: Direct payment link format
      // checkoutUrl = `https://pay.tryspeed.com/${data.id}`;
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