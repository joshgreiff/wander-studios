import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, email, phone, classId, waiverName, waiverAgreed } = req.body;

      // Validate required fields
      if (!name || !email || !classId || !waiverName || !waiverAgreed) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if class exists
      const classItem = await prisma.class.findUnique({
        where: { id: Number(classId) },
        include: {
          bookings: true
        }
      });

      if (!classItem) {
        return res.status(404).json({ error: 'Class not found' });
      }

      // Check capacity
      const currentBookings = classItem.bookings.length;
      if (currentBookings >= classItem.capacity) {
        return res.status(400).json({ 
          error: 'Class is full',
          details: {
            currentBookings,
            capacity: classItem.capacity,
            availableSpots: 0
          }
        });
      }

      // Check if user is already booked for this class
      const existingBooking = await prisma.booking.findFirst({
        where: {
          classId: Number(classId),
          email: email
        }
      });

      if (existingBooking) {
        return res.status(400).json({ error: 'You are already booked for this class' });
      }

      // Find existing user by email (for auto-linking)
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      // Create the booking
      const booking = await prisma.booking.create({
        data: {
          classId: Number(classId),
          name,
          email,
          phone: phone || null,
          waiverName,
          waiverAgreed,
          paid: true, // Since they've already paid
          userId: existingUser?.id || null // Auto-link to existing user if found
        }
      });

      return res.status(201).json({
        booking,
        classInfo: {
          currentBookings: currentBookings + 1,
          capacity: classItem.capacity,
          availableSpots: classItem.capacity - (currentBookings + 1)
        },
        userLinked: !!existingUser // Indicate if booking was linked to existing user
      });

    } catch (error) {
      console.error('Error creating booking:', error);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { classId } = req.query;
      
      if (classId) {
        // Get bookings for a specific class
        const bookings = await prisma.booking.findMany({
          where: { classId: Number(classId) },
          include: { class: true },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(bookings);
      } else {
        // Get all bookings
        const bookings = await prisma.booking.findMany({
          include: { class: true },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 