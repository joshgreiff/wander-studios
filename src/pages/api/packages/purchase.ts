import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { SquareClient, SquareEnvironment } from 'square';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { packageId, userId, customerName, customerEmail, waiverName, waiverAgreed } = req.body;
  const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
  const SQUARE_ENV = process.env.SQUARE_ENV || 'production';

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return res.status(500).json({ error: 'Missing Square credentials' });
  }

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get package details
    const packageData = await prisma.classPackage.findUnique({
      where: { id: Number(packageId) }
    });

    if (!packageData || !packageData.isActive) {
      return res.status(404).json({ error: 'Package not found or inactive' });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + packageData.expiresInDays);

    // Create package booking record
    const packageBooking = await prisma.packageBooking.create({
      data: {
        packageId: Number(packageId),
        classId: 1, // Placeholder - will be updated when classes are redeemed
        customerName,
        customerEmail,
        waiverName,
        waiverAgreed,
        paid: false, // Will be set to true after payment
        expiresAt,
        userId: Number(userId)
      }
    });

    const client = new SquareClient({
      environment: SQUARE_ENV === 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
      token: SQUARE_ACCESS_TOKEN,
    });

    // Create Square checkout session
    const paymentLinkResponse = await client.checkout.paymentLinks.create({
      idempotencyKey: `package-${packageId}-${Date.now()}`,
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems: [
          {
            name: packageData.name,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(Math.round(packageData.price * 100)), // Convert to cents
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
        redirectUrl: `${req.headers.origin}/thank-you?type=package&packageBookingId=${packageBooking.id}`,
        merchantSupportEmail: customerEmail,
        askForShippingAddress: false,
      },
    });

    const checkoutUrl = paymentLinkResponse.paymentLink?.url;
    if (!checkoutUrl) throw new Error('No checkout URL returned');
    
    return res.status(200).json({ 
      url: checkoutUrl,
      packageBookingId: packageBooking.id
    });

  } catch (error) {
    console.error('Error creating package purchase:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message || 'Failed to create package purchase' });
    }
    return res.status(500).json({ error: 'Failed to create package purchase' });
  }
} 