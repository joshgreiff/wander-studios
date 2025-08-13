import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: Number(id),
        class: {
          archived: false
        }
      },
      include: {
        class: {
          select: {
            id: true,
            date: true,
            time: true,
            description: true,
            address: true,
            isVirtual: true,
            virtualLink: true
          }
        }
      },
      orderBy: {
        class: {
          date: 'asc'
        }
      }
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
} 