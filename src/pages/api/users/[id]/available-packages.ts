import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Get all active package bookings for the user that haven't expired and have remaining classes
    const availablePackages = await prisma.packageBooking.findMany({
      where: {
        userId: Number(id),
        paid: true,
        classesRemaining: {
          gt: 0
        },
        expiresAt: {
          gt: new Date()
        }
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
        }
      },
      orderBy: {
        expiresAt: 'asc' // Show packages expiring soon first
      }
    });

    return res.status(200).json(availablePackages);
  } catch (error) {
    console.error('Error fetching available packages:', error);
    return res.status(500).json({ error: 'Failed to fetch available packages' });
  }
} 