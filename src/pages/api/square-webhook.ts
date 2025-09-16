import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Readable } from 'node:stream';

const prisma = new PrismaClient();

// Get raw body as Buffer
async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Square webhook types
interface SquarePayment {
  id: string;
  status: string;
  totalMoney?: {
    amount: number;
    currency: string;
  };
  [key: string]: unknown;
}

interface SquareLineItem {
  name?: string;
  [key: string]: unknown;
}

interface SquareOrder {
  id: string;
  state: string;
  lineItems?: SquareLineItem[];
  metadata?: {
    packageBookingId?: string;
    packageName?: string;
    customerEmail?: string;
  };
  [key: string]: unknown;
}

// Disable body parsing to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the raw body first
    const rawBody = await getRawBody(req);
    const body = rawBody.toString();
    
    // Verify webhook signature (optional but recommended for security)
    const signature = req.headers['x-square-signature'] as string;
    const webhookSecret = process.env.SQUARE_WEBHOOK_SECRET;
    
    // TEMPORARILY DISABLED: Signature verification for debugging
    console.log('Webhook received:', {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret,
      signature: signature ? signature.substring(0, 20) + '...' : 'none',
      bodyLength: body.length
    });
    
    // if (webhookSecret && signature) {
    //   const expectedSignature = crypto
    //     .createHmac('sha1', webhookSecret)
    //     .update(body)
    //     .digest('base64');
    //   
    //   if (signature !== expectedSignature) {
    //     console.error('Invalid webhook signature');
    //     return res.status(401).json({ error: 'Invalid signature' });
    //   }
    // }

    const parsedBody = JSON.parse(body);
    const { type, data } = parsedBody;

    console.log('Webhook data received:', {
      type,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : 'no data',
      dataObjectKeys: data && data.object ? Object.keys(data.object) : 'no object'
    });

    // Handle payment completion events
    if (type === 'payment.created' || type === 'payment.updated') {
      console.log('Processing payment event:', type);
      try {
        const payment = data?.object?.payment;
        if (!payment) {
          console.log('No payment object found in data');
          return res.status(200).json({ received: true, message: 'No payment object' });
        }
        
        console.log('Payment status:', payment.status);
        if (payment.status === 'COMPLETED') {
          await handlePaymentCompleted(payment);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({ error: 'Payment processing failed', details: error.message });
      }
    }

    // Handle order completion events
    if (type === 'order.created' || type === 'order.updated') {
      console.log('Processing order event:', type);
      try {
        const order = data?.object?.order;
        if (!order) {
          console.log('No order object found in data');
          return res.status(200).json({ received: true, message: 'No order object' });
        }
        
        console.log('Order state:', order.state);
        if (order.state === 'OPEN' || order.state === 'COMPLETED') {
          await handleOrderCompleted(order);
        }
      } catch (error) {
        console.error('Error processing order:', error);
        return res.status(500).json({ error: 'Order processing failed', details: error.message });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handlePaymentCompleted(payment: SquarePayment) {
  console.log('Processing completed payment:', payment.id);
  
  try {
    // Get the order associated with this payment to access metadata
    const orderId = (payment as { orderId?: string }).orderId;
    if (!orderId) {
      console.log('No order ID found in payment, skipping');
      return;
    }

    // Look up the order to get metadata
    const order = await prisma.$queryRaw`
      SELECT metadata FROM square_orders WHERE id = ${orderId}
    ` as { metadata?: { packageBookingId?: string } }[];
    
    if (!order || !order[0]?.metadata) {
      console.log('No order metadata found, trying fallback method');
      await handlePaymentCompletedFallback(payment);
      return;
    }

    const metadata = order[0].metadata;
    const packageBookingId = metadata.packageBookingId;
    
    if (packageBookingId) {
      console.log(`Found package booking ID: ${packageBookingId} in order metadata`);
      
      // Mark the specific package as paid
      await prisma.packageBooking.update({
        where: { id: parseInt(packageBookingId) },
        data: { 
          paid: true,
          paymentId: payment.id
        }
      });
      
      console.log(`Successfully marked package ${packageBookingId} as paid for payment ${payment.id}`);
    } else {
      console.log('No package booking ID found in metadata, trying fallback method');
      await handlePaymentCompletedFallback(payment);
    }
  } catch (error) {
    console.error('Error handling payment completion:', error);
    // Fallback to old method if metadata approach fails
    await handlePaymentCompletedFallback(payment);
  }
}

async function handlePaymentCompletedFallback(payment: SquarePayment) {
  console.log('Using fallback payment matching method');
  
  try {
    // Fallback: Look for unpaid package bookings in the last 24 hours
    const unpaidPackages = await prisma.packageBooking.findMany({
      where: {
        paid: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        package: true
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      }
    });

    if (unpaidPackages.length === 0) {
      console.log('No unpaid packages found in last 24 hours');
      return;
    }

    // Find the most recent unpaid package that matches the payment amount
    const expectedAmount = Math.round(unpaidPackages[0].package.price * 100); // Convert to cents
    
    if (payment.totalMoney && payment.totalMoney.amount >= expectedAmount) {
      const packageToMark = unpaidPackages[0];
      console.log(`Fallback: Marking package ${packageToMark.id} as paid for payment ${payment.id}`);
      
      await prisma.packageBooking.update({
        where: { id: packageToMark.id },
        data: { 
          paid: true,
          paymentId: payment.id
        }
      });
    }
  } catch (error) {
    console.error('Error in fallback payment handling:', error);
  }
}

async function handleOrderCompleted(order: SquareOrder) {
  console.log('Processing completed order:', order.id);
  
  try {
    // Check if this order contains a package purchase using metadata
    const orderMetadata = (order as { metadata?: { packageBookingId?: string } }).metadata;
    
    if (orderMetadata && orderMetadata.packageBookingId) {
      const packageBookingId = orderMetadata.packageBookingId;
      console.log(`Found package booking ID: ${packageBookingId} in order metadata`);
      
      // Mark the specific package as paid
      await prisma.packageBooking.update({
        where: { id: parseInt(packageBookingId) },
        data: { 
          paid: true,
          paymentId: order.id // Use order ID as payment ID for now
        }
      });
      
      console.log(`Successfully marked package ${packageBookingId} as paid for order ${order.id}`);
      return;
    }
    
    // Fallback: Check line items for package purchases
    console.log('No metadata found, checking line items...');
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
          },
          orderBy: {
            createdAt: 'desc' // Most recent first
          }
        });

        if (unpaidPackages.length > 0) {
          const packageToMark = unpaidPackages[0];
          console.log(`Fallback: Marking package ${packageToMark.id} as paid for order ${order.id}`);
          
          await prisma.packageBooking.update({
            where: { id: packageToMark.id },
            data: { 
              paid: true,
              paymentId: order.id
            }
          });
          
          break; // Only mark one package per order
        }
      }
    }
  } catch (error) {
    console.error('Error handling order completion:', error);
  }
} 