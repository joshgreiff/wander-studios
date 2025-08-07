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

  if (req.method === 'POST') {
    try {
      const { name, description, classCount, price, discount } = req.body;
      
      if (!name || !description || !classCount || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newPackage = await prisma.classPackage.create({
        data: {
          name,
          description,
          classCount: Number(classCount),
          price: Number(price),
          discount: discount ? Number(discount) : null,
          isActive: true
        }
      });

      return res.status(201).json(newPackage);
    } catch (error) {
      console.error('Error creating package:', error);
      return res.status(500).json({ error: 'Failed to create package' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 