import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const classes = await prisma.class.findMany({ 
      include: {
        bookings: true
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }] 
    });
    return res.status(200).json(classes);
  }
  if (req.method === 'POST') {
    const { date, time, description, capacity } = req.body;
    if (!date || !time || !description || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newClass = await prisma.class.create({
      data: {
        date: new Date(date),
        time,
        description,
        capacity: Number(capacity),
      },
    });
    return res.status(201).json(newClass);
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 