import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { 
        packageId, 
        customerName, 
        customerEmail, 
        customerPhone, 
        waiverName, 
        waiverAgreed,
        action // 'purchase' or 'redeem'
      } = req.body;

      if (!packageId || !customerName || !customerEmail || !waiverName || !waiverAgreed || !action) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (action === 'purchase') {
        // Create package bookings for all classes in the package
        const packageData = await prisma.classPackage.findUnique({
          where: { id: Number(packageId) }
        });

        if (!packageData) {
          return res.status(404).json({ error: 'Package not found' });
        }

        // Get upcoming classes
        const upcomingClasses = await prisma.class.findMany({
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: { date: 'asc' },
          take: packageData.classCount
        });

        if (upcomingClasses.length < packageData.classCount) {
          return res.status(400).json({ 
            error: `Not enough upcoming classes available. Package includes ${packageData.classCount} classes but only ${upcomingClasses.length} are scheduled.` 
          });
        }

        // Create package bookings for each class
        const packageBookings = await Promise.all(
          upcomingClasses.map(classItem => 
            prisma.packageBooking.create({
              data: {
                packageId: Number(packageId),
                classId: classItem.id,
                customerName,
                customerEmail,
                customerPhone: customerPhone || null,
                waiverName,
                waiverAgreed,
                paid: false // Will be set to true after payment
              }
            })
          )
        );

        return res.status(201).json({
          packageBookings,
          package: packageData,
          totalPrice: packageData.price
        });

      } else if (action === 'redeem') {
        // Redeem a class from an existing package
        const { classId } = req.body;

        if (!classId) {
          return res.status(400).json({ error: 'Class ID is required for redemption' });
        }

        // Find an unused package booking for this customer and class
        const packageBooking = await prisma.packageBooking.findFirst({
          where: {
            customerEmail,
            classId: Number(classId),
            redeemed: false,
            paid: true
          },
          include: {
            package: true,
            class: true
          }
        });

        if (!packageBooking) {
          return res.status(404).json({ 
            error: 'No available package booking found for this class. Please purchase a package first.' 
          });
        }

        // Check if class has capacity
        const classItem = await prisma.class.findUnique({
          where: { id: Number(classId) },
          include: {
            bookings: true,
            packageBookings: {
              where: { redeemed: true }
            }
          }
        });

        if (!classItem) {
          return res.status(404).json({ error: 'Class not found' });
        }

        const totalBookings = classItem.bookings.length + classItem.packageBookings.length;
        if (totalBookings >= classItem.capacity) {
          return res.status(400).json({ error: 'Class is full' });
        }

        // Mark the package booking as redeemed
        const redeemedBooking = await prisma.packageBooking.update({
          where: { id: packageBooking.id },
          data: {
            redeemed: true,
            redeemedAt: new Date()
          },
          include: {
            package: true,
            class: true
          }
        });

        return res.status(200).json({
          message: 'Class successfully redeemed',
          packageBooking: redeemedBooking
        });

      } else if (action === 'mark-paid') {
        // Mark a package booking as paid
        const { bookingId } = req.body;

        if (!bookingId) {
          return res.status(400).json({ error: 'Booking ID is required for mark-paid action' });
        }

        const updatedBooking = await prisma.packageBooking.update({
          where: { id: Number(bookingId) },
          data: { paid: true },
          include: {
            package: true,
            class: true
          }
        });

        return res.status(200).json({
          message: 'Package booking marked as paid',
          packageBooking: updatedBooking
        });

      } else {
        return res.status(400).json({ error: 'Invalid action. Use "purchase", "redeem", or "mark-paid".' });
      }

    } catch (error) {
      console.error('Error processing package booking:', error);
      return res.status(500).json({ error: 'Failed to process package booking' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 