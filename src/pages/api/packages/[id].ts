import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const packageBooking = await prisma.packageBooking.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            classCount: true,
            price: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!packageBooking) {
      return res.status(404).json({ error: 'Package booking not found' });
    }

    return res.status(200).json(packageBooking);
  } catch (error) {
    console.error('Error fetching package booking:', error);
    return res.status(500).json({ error: 'Failed to fetch package booking' });
  }
} 