import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'GET') {
    try {
      const classItem = await prisma.class.findUnique({ where: { id: Number(id) } });
      if (!classItem) return res.status(404).json({ error: 'Class not found' });
      return res.status(200).json(classItem);
    } catch {
      return res.status(500).json({ error: 'Failed to fetch class' });
    }
  }
  if (req.method === 'DELETE') {
    try {
      await prisma.class.delete({ where: { id: Number(id) } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ error: 'Class not found' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 