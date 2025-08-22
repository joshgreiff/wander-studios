import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature (optional but recommended for security)
    const signature = req.headers['x-square-signature'] as string;
    const webhookSecret = process.env.SQUARE_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { type, data } = req.body;

    // Handle payment completion events
    if (type === 'payment.created' || type === 'payment.updated') {
      const payment = data.object.payment;
      
      if (payment.status === 'COMPLETED') {
        await handlePaymentCompleted(payment);
      }
    }

    // Handle order completion events
    if (type === 'order.created' || type === 'order.updated') {
      const order = data.object.order;
      
      if (order.state === 'OPEN' || order.state === 'COMPLETED') {
        await handleOrderCompleted(order);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handlePaymentCompleted(payment: any) {
  console.log('Processing completed payment:', payment.id);
  
  try {
    // Look for package bookings that might be associated with this payment
    // We can identify package payments by looking at the order metadata or line items
    
    // For now, we'll check if there are any unpaid package bookings
    // In a more robust implementation, you'd store the payment ID with the package booking
    const unpaidPackages = await prisma.packageBooking.findMany({
      where: {
        paid: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        package: true
      }
    });

    // For each unpaid package, check if the payment amount matches
    for (const packageBooking of unpaidPackages) {
      const expectedAmount = Math.round(packageBooking.package.price * 100); // Convert to cents
      
      // Check if payment amount matches package price (with some tolerance for tax)
      if (payment.totalMoney && payment.totalMoney.amount >= expectedAmount) {
        console.log(`Marking package ${packageBooking.id} as paid for payment ${payment.id}`);
        
        await prisma.packageBooking.update({
          where: { id: packageBooking.id },
          data: { paid: true }
        });
        
        // Only mark one package as paid per payment
        break;
      }
    }
  } catch (error) {
    console.error('Error handling payment completion:', error);
  }
}

async function handleOrderCompleted(order: any) {
  console.log('Processing completed order:', order.id);
  
  try {
    // Check if this order contains a package purchase
    const lineItems = order.lineItems || [];
    
    for (const item of lineItems) {
      // Look for package line items
      if (item.name && item.name.includes('Package')) {
        // Find unpaid package bookings that match this order
        const unpaidPackages = await prisma.packageBooking.findMany({
          where: {
            paid: false,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          include: {
            package: true
          }
        });

        for (const packageBooking of unpaidPackages) {
          if (item.name.includes(packageBooking.package.name)) {
            console.log(`Marking package ${packageBooking.id} as paid for order ${order.id}`);
            
            await prisma.packageBooking.update({
              where: { id: packageBooking.id },
              data: { paid: true }
            });
            
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling order completion:', error);
  }
} 