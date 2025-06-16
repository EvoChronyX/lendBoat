import nodemailer from 'nodemailer';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@boatrental.com';

// Create transporter based on available service
const createTransporter = () => {
  if (SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: SENDGRID_API_KEY,
      },
    });
  }
  
  // Fallback to Gmail or other SMTP
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER || '';
  const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

export interface EmailService {
  sendOwnerApprovalEmail(to: string, ownerName: string, businessName: string): Promise<boolean>;
  sendOwnerRejectionEmail(to: string, ownerName: string, reason: string): Promise<boolean>;
  sendBookingConfirmationEmail(to: string, bookingDetails: any): Promise<boolean>;
}

class NodemailerEmailService implements EmailService {
  async sendOwnerApprovalEmail(to: string, ownerName: string, businessName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: FROM_EMAIL,
        to,
        subject: 'Welcome to BoatRental - Owner Application Approved!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #0EA5E9, #0284C7); color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to BoatRental!</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Your owner application has been approved</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${ownerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! Your application to become a boat owner on BoatRental has been approved.</p>
              <p style="font-size: 16px; margin-bottom: 20px;"><strong>Business:</strong> ${businessName}</p>
              <p style="font-size: 16px; margin-bottom: 20px;">You can now:</p>
              <ul style="font-size: 16px; margin-bottom: 30px; color: #555;">
                <li>Add your boats to our platform</li>
                <li>Manage your listings</li>
                <li>Receive bookings from customers</li>
                <li>Track your earnings</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                   style="background: #0EA5E9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Get Started
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2024 BoatRental. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending owner approval email:', error);
      return false;
    }
  }

  async sendOwnerRejectionEmail(to: string, ownerName: string, reason: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: FROM_EMAIL,
        to,
        subject: 'BoatRental Owner Application Update',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #dc2626; color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Application Update</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Regarding your owner application</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${ownerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your interest in becoming a boat owner on BoatRental.</p>
              <p style="font-size: 16px; margin-bottom: 20px;">After careful review, we are unable to approve your application at this time.</p>
              ${reason ? `<p style="font-size: 16px; margin-bottom: 20px;"><strong>Reason:</strong> ${reason}</p>` : ''}
              <p style="font-size: 16px; margin-bottom: 20px;">You are welcome to reapply once you have addressed any concerns. Please feel free to contact our support team if you have any questions.</p>
              <div style="text-align: center;">
                <a href="mailto:support@boatrental.com" 
                   style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Contact Support
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2024 BoatRental. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending owner rejection email:', error);
      return false;
    }
  }

  async sendBookingConfirmationEmail(to: string, bookingDetails: any): Promise<boolean> {
    try {
      const mailOptions = {
        from: FROM_EMAIL,
        to,
        subject: 'Booking Confirmed - Your Boat Adventure Awaits!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Your boat adventure awaits</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${bookingDetails.customerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Your booking has been confirmed! Here are the details:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px; color: #333;">Booking Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                  <div><strong>Boat:</strong> ${bookingDetails.boatName}</div>
                  <div><strong>Location:</strong> ${bookingDetails.location}</div>
                  <div><strong>Check-in:</strong> ${bookingDetails.checkinDate}</div>
                  <div><strong>Check-out:</strong> ${bookingDetails.checkoutDate}</div>
                  <div><strong>Guests:</strong> ${bookingDetails.guests}</div>
                  <div><strong>Total:</strong> $${bookingDetails.totalAmount}</div>
                </div>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 15px;">What to bring:</p>
              <ul style="font-size: 16px; margin-bottom: 30px; color: #555;">
                <li>Valid ID for all passengers</li>
                <li>Sunscreen and hats</li>
                <li>Food and beverages (if allowed)</li>
                <li>Camera for memories</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                   style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Booking
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2024 BoatRental. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return false;
    }
  }
}

export const emailService = new NodemailerEmailService();
