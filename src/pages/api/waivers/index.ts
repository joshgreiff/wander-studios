import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        emergencyContact,
        emergencyPhone,
        relationship,
        healthConditions,
        injuries,
        medications,
        isPregnant,
        pregnancyWeeks,
        digitalSignature,
        waiverAgreed,
        healthInfoAgreed
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !emergencyContact || !emergencyPhone || 
          !digitalSignature || !waiverAgreed || !healthInfoAgreed) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create the waiver record
      const waiver = await prisma.waiver.create({
        data: {
          firstName,
          lastName,
          email,
          phone: phone || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          emergencyContact,
          emergencyPhone,
          relationship: relationship || null,
          healthConditions: healthConditions || null,
          injuries: injuries || null,
          medications: medications || null,
          isPregnant: isPregnant || false,
          pregnancyWeeks: isPregnant && pregnancyWeeks ? parseInt(pregnancyWeeks) : null,
          digitalSignature,
          waiverAgreed,
          healthInfoAgreed
        }
      });

      return res.status(201).json(waiver);
    } catch (error) {
      console.error('Error creating waiver:', error);
      return res.status(500).json({ error: 'Failed to create waiver' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { email } = req.query;
      
      if (email) {
        // Get waiver by email
        const waiver = await prisma.waiver.findFirst({
          where: { email: email as string },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(waiver);
      } else {
        // Get all waivers (for admin purposes)
        const waivers = await prisma.waiver.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(waivers);
      }
    } catch (error) {
      console.error('Error fetching waivers:', error);
      return res.status(500).json({ error: 'Failed to fetch waivers' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 