import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const packages = await prisma.classPackage.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      });

      return res.status(200).json(packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      return res.status(500).json({ error: 'Failed to fetch packages' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 