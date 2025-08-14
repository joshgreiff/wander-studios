import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const packageBookings = await prisma.packageBooking.findMany({
      where: { userId: Number(id) },
      include: {
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            classCount: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(packageBookings);
  } catch (error) {
    console.error('Error fetching user package bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch package bookings' });
  }
} 