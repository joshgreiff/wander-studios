import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Wander Movement <noreply@wandermovement.space>',
      to: ['ltwander@gmail.com'],
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong style="color: #92400e;">Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong style="color: #92400e;">Email:</strong> <a href="mailto:${email}" style="color: #ea580c;">${email}</a></p>
            <p style="margin: 10px 0;"><strong style="color: #92400e;">Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #ea580c;">
            <h3 style="color: #92400e; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #374151; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            <p>This message was sent from the Wander Movement contact form.</p>
            <p>Timestamp: ${new Date().toLocaleString('en-US', { 
              timeZone: 'America/New_York',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} EST</p>
          </div>
        </div>
      `,
      replyTo: email, // This allows you to reply directly to the sender
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        error: 'Failed to send email' 
      });
    }

    console.log('Email sent successfully:', data);

    return res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Error sending contact form:', error);
    return res.status(500).json({ 
      error: 'Failed to send message' 
    });
  }
} 