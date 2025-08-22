import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { sendVirtualClassConfirmation } from '@/utils/email';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { packageBookingId, classId, userId, customerName, customerEmail, phone, waiverName, waiverAgreed } = req.body;

    // Validate required fields
    if (!packageBookingId || !classId || !userId || !customerName || !customerEmail || !waiverName || !waiverAgreed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the package booking exists and is valid
    const packageBooking = await prisma.packageBooking.findUnique({
      where: { id: Number(packageBookingId) },
      include: {
        package: true
      }
    });

    if (!packageBooking) {
      return res.status(404).json({ error: 'Package booking not found' });
    }

    // Verify the package belongs to the user
    if (packageBooking.userId !== Number(userId)) {
      return res.status(403).json({ error: 'Package does not belong to this user' });
    }

    // Check if package is paid
    if (!packageBooking.paid) {
      return res.status(400).json({ error: 'Package is not paid' });
    }

    // Check if package has expired
    if (packageBooking.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Package has expired' });
    }

    // Check if package has remaining classes
    if (packageBooking.classesRemaining <= 0) {
      return res.status(400).json({ error: 'No classes remaining in package' });
    }

    // Check if class exists and is not archived
    const classItem = await prisma.class.findUnique({
      where: { id: Number(classId) }
    });

    if (!classItem || classItem.archived) {
      return res.status(404).json({ error: 'Class not found or archived' });
    }

    // Check if user is already booked for this class
    const existingBooking = await prisma.booking.findFirst({
      where: {
        classId: Number(classId),
        email: customerEmail
      }
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'You are already booked for this class' });
    }

    // Check if class has capacity
    const currentBookings = await prisma.booking.count({
      where: { classId: Number(classId) }
    });

    if (currentBookings >= classItem.capacity) {
      return res.status(400).json({ error: 'Class is full' });
    }

    // Create the booking using package redemption
    const booking = await prisma.booking.create({
      data: {
        classId: Number(classId),
        name: customerName,
        email: customerEmail,
        phone: phone || null,
        waiverName,
        waiverAgreed,
        paid: true, // Package classes are pre-paid
        userId: Number(userId),
        packageBookingId: Number(packageBookingId) // Link to the package booking
      }
    });

    // Create package redemption record
    const packageRedemption = await prisma.packageRedemption.create({
      data: {
        packageBookingId: Number(packageBookingId),
        classId: Number(classId)
      }
    });

    // Update package booking to decrement remaining classes
    await prisma.packageBooking.update({
      where: { id: Number(packageBookingId) },
      data: {
        classesUsed: packageBooking.classesUsed + 1,
        classesRemaining: packageBooking.classesRemaining - 1
      }
    });

    // Send virtual class email if applicable
    if (classItem.isVirtual && classItem.virtualLink) {
      try {
        await sendVirtualClassConfirmation({
          customerName: customerName,
          customerEmail: customerEmail,
          className: classItem.description,
          classDate: new Date(classItem.date).toLocaleDateString(),
          classTime: classItem.time,
          virtualLink: classItem.virtualLink,
        });
      } catch (emailError) {
        console.error('Error sending virtual class email:', emailError);
        // Don't fail the booking if email fails
      }
    }

    return res.status(201).json({
      booking,
      packageRedemption,
      remainingClasses: packageBooking.classesRemaining - 1,
      message: 'Class booked successfully using package'
    });

  } catch (error) {
    console.error('Error redeeming package class:', error);
    return res.status(500).json({ error: 'Failed to redeem package class' });
  }
} 