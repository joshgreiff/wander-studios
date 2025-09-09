import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'GET') {
    try {
      const classItem = await prisma.class.findUnique({ 
        where: { id: Number(id) },
        include: {
          bookings: true
        }
      });
      if (!classItem) return res.status(404).json({ error: 'Class not found' });
      
      // Remove virtual link from public API response for security
      const publicClassItem = {
        ...classItem,
        virtualLink: undefined // Remove virtual link from public API
      };
      
      return res.status(200).json(publicClassItem);
    } catch {
      return res.status(500).json({ error: 'Failed to fetch class' });
    }
  }
  if (req.method === 'PUT') {
    try {
      const { date, time, description, address, capacity, price, archived, isVirtual, virtualLink } = req.body;
      if (!date || !time || !description || !capacity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (isVirtual && !virtualLink) {
        return res.status(400).json({ error: 'Virtual link is required for virtual classes' });
      }
      const updatedClass = await prisma.class.update({
        where: { id: Number(id) },
        data: {
          date: new Date(date),
          time,
          description,
          address: address || null,
          capacity: Number(capacity),
          price: price ? Number(price) : null,
          archived: archived !== undefined ? Boolean(archived) : false,
          isVirtual: Boolean(isVirtual),
          virtualLink: virtualLink || null,
        },
      });
      return res.status(200).json(updatedClass);
    } catch {
      return res.status(500).json({ error: 'Failed to update class' });
    }
  }
  if (req.method === 'DELETE') {
    try {
      // Instead of hard deleting, archive the class
      await prisma.class.update({
        where: { id: Number(id) },
        data: { archived: true }
      });
      return res.status(200).json({ message: 'Class archived successfully' });
    } catch {
      return res.status(500).json({ error: 'Failed to archive class' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 