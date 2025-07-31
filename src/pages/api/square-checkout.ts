import type { NextApiRequest, NextApiResponse } from 'next';
import { SquareClient, SquareEnvironment } from 'square';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, classId, name, phone, waiverName, waiverAgreed } = req.body;
  const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
  const SQUARE_ENV = process.env.SQUARE_ENV || 'production';

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return res.status(500).json({ error: 'Missing Square credentials' });
  }

  try {
    // Check class capacity before creating payment
    const classItem = await prisma.class.findUnique({
      where: { id: Number(classId) },
      include: {
        bookings: true
      }
    });

    if (!classItem) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const currentBookings = classItem.bookings.length;
    if (currentBookings >= classItem.capacity) {
      return res.status(400).json({ 
        error: 'Class is full',
        details: {
          currentBookings,
          capacity: classItem.capacity,
          availableSpots: 0
        }
      });
    }

    // Check if user is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        classId: Number(classId),
        email: email
      }
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'You are already booked for this class' });
    }

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
        redirectUrl: `${req.headers.origin}/thank-you?classId=${classId}&email=${email}&name=${name}&phone=${phone}&waiverName=${waiverName}&waiverAgreed=${waiverAgreed}`,
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