import type { NextApiRequest, NextApiResponse } from 'next';
import { SquareClient, SquareEnvironment } from 'square';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, classId } = req.body;
  const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
  const SQUARE_ENV = process.env.SQUARE_ENV || 'production';

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return res.status(500).json({ error: 'Missing Square credentials' });
  }

  try {
    const client = new SquareClient({
      environment: SQUARE_ENV === 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
      token: SQUARE_ACCESS_TOKEN,
    });

    // Pass the full order object directly to paymentLinks.create
    const paymentLinkResponse = await client.checkout.paymentLinks.create({
      idempotencyKey: `${classId}-${Date.now()}`,
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems: [
          {
            name: 'Class Booking',
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(1000), // $10.00 in cents, bigint
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
        redirectUrl: `${req.headers.origin}/thank-you`,
        merchantSupportEmail: email,
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