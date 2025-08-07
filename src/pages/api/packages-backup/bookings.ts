import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email parameter is required' });
      }

      const packageBookings = await prisma.packageBooking.findMany({
        where: { 
          customerEmail: email,
          paid: true
        },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              classCount: true
            }
          },
          class: {
            include: {
              bookings: true,
              packageBookings: {
                where: { redeemed: true }
              }
            }
          }
        },
        orderBy: [
          { redeemed: 'asc' },
          { class: { date: 'asc' } }
        ]
      });

      return res.status(200).json(packageBookings);
    } catch (error) {
      console.error('Error fetching package bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch package bookings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 