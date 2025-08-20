import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface VirtualClassEmailData {
  customerName: string;
  customerEmail: string;
  className: string;
  classDate: string;
  classTime: string;
  virtualLink: string;
  instructorName?: string;
}

export async function sendVirtualClassConfirmation(data: VirtualClassEmailData) {
  try {
    const { customerName, customerEmail, className, classDate, classTime, virtualLink, instructorName = 'Wander Studios' } = data;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #9d174d; margin-bottom: 20px;">Virtual Class Confirmation</h2>
        
        <p>Hi ${customerName},</p>
        
        <p>Thank you for booking your virtual class! Here are the details:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #450a0a; margin-top: 0;">${className}</h3>
          <p><strong>Date:</strong> ${classDate}</p>
          <p><strong>Time:</strong> ${classTime}</p>
          <p><strong>Instructor:</strong> ${instructorName}</p>
        </div>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e40af; margin-top: 0;">🔗 Virtual Class Link</h4>
          <p>Click the link below to join your virtual class:</p>
          <a href="${virtualLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Join Virtual Class</a>
          <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Or copy and paste this link: ${virtualLink}</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">📋 Before Your Class</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Test your audio and video before joining</li>
            <li>Find a quiet space with good lighting</li>
            <li>Have water nearby</li>
            <li>Join 5 minutes early to ensure everything is working</li>
          </ul>
        </div>
        
        <p>If you have any questions or need to reschedule, please contact us at <a href="mailto:info@wanderstudios.com">info@wanderstudios.com</a>.</p>
        
        <p>We look forward to seeing you in class!</p>
        
        <p>Best regards,<br>The ${instructorName} Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'Wander Studios <noreply@wanderstudios.com>',
      to: [customerEmail],
      subject: `Virtual Class Confirmation: ${className}`,
      html: emailContent,
    });

    return result;
  } catch (error) {
    console.error('Error sending virtual class email:', error);
    throw error;
  }
}

export async function sendVirtualClassReminder(data: VirtualClassEmailData) {
  try {
    const { customerName, customerEmail, className, classDate, classTime, virtualLink, instructorName = 'Wander Studios' } = data;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #9d174d; margin-bottom: 20px;">Virtual Class Reminder</h2>
        
        <p>Hi ${customerName},</p>
        
        <p>This is a friendly reminder about your virtual class tomorrow:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #450a0a; margin-top: 0;">${className}</h3>
          <p><strong>Date:</strong> ${classDate}</p>
          <p><strong>Time:</strong> ${classTime}</p>
          <p><strong>Instructor:</strong> ${instructorName}</p>
        </div>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e40af; margin-top: 0;">🔗 Virtual Class Link</h4>
          <p>Click the link below to join your virtual class:</p>
          <a href="${virtualLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Join Virtual Class</a>
          <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Or copy and paste this link: ${virtualLink}</p>
        </div>
        
        <p>See you in class!</p>
        
        <p>Best regards,<br>The ${instructorName} Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'Wander Studios <noreply@wanderstudios.com>',
      to: [customerEmail],
      subject: `Reminder: Virtual Class Tomorrow - ${className}`,
      html: emailContent,
    });

    return result;
  } catch (error) {
    console.error('Error sending virtual class reminder:', error);
    throw error;
  }
} 