import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
    const classes = await prisma.class.findMany({ 
        where: { archived: false },
        include: { bookings: true },
        orderBy: { date: 'asc' }
    });
    return res.status(200).json(classes);
    } catch {
      return res.status(500).json({ error: 'Failed to fetch classes' });
    }
  }
  if (req.method === 'POST') {
    const { date, time, description, address, capacity, isVirtual, virtualLink } = req.body;
    if (!date || !time || !description || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (isVirtual && !virtualLink) {
      return res.status(400).json({ error: 'Virtual link is required for virtual classes' });
    }
    try {
    const newClass = await prisma.class.create({
      data: {
        date: new Date(date),
        time,
        description,
          address: address || null,
        capacity: Number(capacity),
          archived: false,
          isVirtual: Boolean(isVirtual),
          virtualLink: virtualLink || null,
      },
    });
    return res.status(201).json(newClass);
    } catch {
      return res.status(500).json({ error: 'Failed to create class' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 