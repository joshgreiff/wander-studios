import type { NextApiRequest, NextApiResponse } from 'next';
import { SquareClient, SquareEnvironment } from 'square';
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
  
  const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
  const SQUARE_ENV = process.env.SQUARE_ENV || 'production';

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return res.status(500).json({ error: 'Missing Square credentials' });
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

    const client = new SquareClient({
      environment: SQUARE_ENV === 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
      token: SQUARE_ACCESS_TOKEN,
    });

    // Calculate final price with discount if applicable
    const finalPrice = packageData.discount 
      ? packageData.price * (1 - packageData.discount / 100)
      : packageData.price;

    // Create Square payment link
    const paymentLinkResponse = await client.checkout.paymentLinks.create({
      idempotencyKey: `package-${packageId}-${Date.now()}`,
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems: [
          {
            name: packageData.name,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(Math.round(finalPrice * 100)), // Convert to cents
              currency: 'USD',
            },
          },
        ],
        taxes: [
          {
            name: 'Sales Tax',
            percentage: '7.00',
            scope: 'ORDER',
          },
        ],
      },
      checkoutOptions: {
        redirectUrl: `${req.headers.origin}/thank-you?packageId=${packageId}&customerEmail=${encodeURIComponent(customerEmail)}&customerName=${encodeURIComponent(customerName)}&customerPhone=${encodeURIComponent(customerPhone || '')}&waiverName=${encodeURIComponent(waiverName)}&waiverAgreed=${waiverAgreed}&type=package`,
        merchantSupportEmail: customerEmail,
        askForShippingAddress: false,
      },
    });

    const checkoutUrl = paymentLinkResponse.paymentLink?.url;
    if (!checkoutUrl) throw new Error('No checkout URL returned');
    
    return res.status(200).json({ url: checkoutUrl });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message || 'Failed to create Square checkout' });
    }
    return res.status(500).json({ error: 'Failed to create Square checkout' });
  }
} 