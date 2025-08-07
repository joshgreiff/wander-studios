import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    packageId, 
    customerName, 
    customerEmail, 
    customerPhone, 
    waiverName, 
    waiverAgreed 
  } = req.body;

  if (!packageId || !customerName || !customerEmail || !waiverName || !waiverAgreed) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get package details
    const packageData = await prisma.classPackage.findUnique({
      where: { id: Number(packageId) }
    });

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Check if package is active
    if (!packageData.isActive) {
      return res.status(400).json({ error: 'Package is not available for purchase' });
    }

    // Get upcoming classes to ensure they exist
    const upcomingClasses = await prisma.class.findMany({
      where: {
        date: {
          gte: new Date()
        }
      },
      orderBy: { date: 'asc' },
      take: packageData.classCount
    });

    if (upcomingClasses.length < packageData.classCount) {
      return res.status(400).json({ 
        error: `Not enough upcoming classes available. Package includes ${packageData.classCount} classes but only ${upcomingClasses.length} are scheduled.` 
      });
    }

    // Calculate final price with discount if applicable
    const finalPrice = packageData.discount 
      ? packageData.price * (1 - packageData.discount / 100)
      : packageData.price;

    console.log('Making request to Speed API for package...');
    
    const requestBody = {
      amount: finalPrice,
      currency: 'USD',
      description: `Package: ${packageData.name}`,
      customer_email: customerEmail,
      metadata: { 
        name: customerName, 
        packageId, 
        packageName: packageData.name,
        classCount: packageData.classCount
      },
      success_url: `https://wandermovement.space/thank-you?packageId=${packageId}&customerEmail=${encodeURIComponent(customerEmail)}&customerName=${encodeURIComponent(customerName)}&customerPhone=${encodeURIComponent(customerPhone || '')}&waiverName=${encodeURIComponent(waiverName)}&waiverAgreed=${waiverAgreed}&type=package`,
      cancel_url: `https://wandermovement.space/packages`,
    };

    console.log('Request body:', requestBody);

    const SPEED_API_URL = 'https://api.tryspeed.com/payment-links';
    
    console.log('Using Speed API URL:', SPEED_API_URL);
    console.log('Origin:', req.headers.origin);

    const response = await fetch(SPEED_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SPEED_API_KEY}`,
        'Origin': req.headers.origin || 'https://wandermovement.space',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Speed API response status:', response.status);
    console.log('Speed API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speed API error response:', errorText);
      throw new Error(`Speed API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Speed API success response:', data);

    // Check if Speed provides a checkout URL directly
    let checkoutUrl = data.checkout_url || data.url || data.payment_url || data.hosted_url || data.redirect_url || data.payment_link || data.checkout_link || data.public_url;
    
    // If no direct URL provided, construct it manually
    if (!checkoutUrl) {
      checkoutUrl = `https://app.tryspeed.com/checkout/${data.id}`;
    }
    
    console.log('=== PACKAGE BITCOIN PAYMENT SUCCESS ===');
    console.log('Payment ID:', data.id);
    console.log('Checkout URL:', checkoutUrl);
    console.log('Full response data:', JSON.stringify(data, null, 2));
    
    return res.status(200).json({ url: checkoutUrl });
  } catch (error: unknown) {
    console.error('=== PACKAGE BITCOIN PAYMENT ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: `Failed to create Speed invoice for package: ${error.message}`,
        details: {
          type: error.constructor.name,
          stack: error.stack
        }
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create Speed invoice for package',
      details: {
        type: typeof error,
        error: String(error)
      }
    });
  }
} 