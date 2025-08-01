import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all bookings
    const bookings = await prisma.booking.findMany({
      where: { paid: true },
      include: { class: true },
    });

    // Use the actual net amount received after Square fees: $10.09 per booking
    const bookingsWithPayments = bookings.map(booking => ({
      ...booking,
      paymentAmount: 10.09, // Net amount after Square fees ($10.70 - $0.61)
    }));

    res.status(200).json(bookingsWithPayments);
  } catch (error) {
    console.error('Error fetching Square revenue data:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
} 