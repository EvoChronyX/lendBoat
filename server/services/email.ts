import sgMail from '@sendgrid/mail';

// Set SendGrid API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@lendboat.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid API key configured');
} else {
  console.warn('⚠️ SendGrid API key not found - email service will not work');
}

export interface EmailService {
  sendOwnerApprovalEmail(to: string, ownerName: string, businessName: string, ownerId: string, password: string): Promise<boolean>;
  sendOwnerRejectionEmail(to: string, ownerName: string, reason: string): Promise<boolean>;
  sendBookingConfirmationEmail(to: string, customerName: string, bookingDetails: {
    bookingId: number;
    boatName: string;
    boatType: string;
    checkinDate: string;
    checkoutDate: string;
    guests: number;
    totalAmount: string;
    location: string;
    description: string;
    ownerBusinessName: string;
    ownerPhone: string;
    ownerEmail: string;
  }): Promise<boolean>;
  sendBookingStatusEmail(to: string, userName: string, boatName: string, status: "accepted" | "declined", bookingDetails: any): Promise<boolean>;
  sendBookingReplyEmail(to: string, replyData: { customerName: string; boatName: string; replyMessage: string; ownerName: string; businessName: string }): Promise<boolean>;
  sendContactNotificationEmail(contactData: { customerName: string; customerEmail: string; subject: string; message: string; contactId: number }): Promise<boolean>;
  sendContactConfirmationEmail(to: string, contactData: { customerName: string; subject: string }): Promise<boolean>;
  sendContactReplyEmail(to: string, replyData: { customerName: string; originalSubject: string; replyMessage: string; adminName: string }): Promise<boolean>;
  sendPasswordResetEmail(email: string, name: string, resetLink: string, accountType: "admin" | "owner"): Promise<boolean>;
}

class SendGridEmailService implements EmailService {
  async sendOwnerApprovalEmail(to: string, ownerName: string, businessName: string, ownerId: string, password: string): Promise<boolean> {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured');
        return false;
      }

      const msg = {
        to,
        from: FROM_EMAIL,
        subject: 'Welcome to lendBoat - Owner Application Approved!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #0EA5E9, #0284C7); color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to lendBoat!</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Your owner application has been approved</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${ownerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! Your application to become a boat owner on lendBoat has been approved.</p>
              <p style="font-size: 16px; margin-bottom: 20px;"><strong>Business:</strong> ${businessName}</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0EA5E9;">
                <h3 style="margin: 0 0 15px; color: #0EA5E9;">Your Login Credentials</h3>
                <p style="font-size: 16px; margin-bottom: 10px;"><strong>Owner ID:</strong> ${ownerId}</p>
                <p style="font-size: 16px; margin-bottom: 10px;"><strong>Password:</strong> ${password}</p>
                <p style="font-size: 14px; color: #666; margin: 0;">Please keep these credentials safe. You can change your password after logging in.</p>
              </div>
              
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
              <p>&copy; 2025 lendBoat. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Owner approval email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending owner approval email:', error);
      return false;
    }
  }

  async sendOwnerRejectionEmail(to: string, ownerName: string, reason: string): Promise<boolean> {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured');
        return false;
      }

      const msg = {
        to,
        from: FROM_EMAIL,
        subject: 'lendBoat Owner Application Update',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #dc2626; color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Application Update</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Regarding your owner application</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${ownerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your interest in becoming a boat owner on lendBoat.</p>
              <p style="font-size: 16px; margin-bottom: 20px;">After careful review, we are unable to approve your application at this time.</p>
              
              ${reason ? `
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
                  <h3 style="margin: 0 0 15px; color: #dc2626;">Reason for Rejection</h3>
                  <p style="font-size: 16px; margin: 0; color: #dc2626;">${reason}</p>
                </div>
              ` : ''}
              
              <p style="font-size: 16px; margin-bottom: 20px;">You are welcome to reapply once you have addressed any concerns. Please feel free to contact our support team if you have any questions.</p>
              
              <div style="text-align: center;">
                <a href="mailto:support@lendboat.com" 
                   style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Contact Support
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              
              <p>&copy; 2025 lendBoat. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Owner rejection email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending owner rejection email:', error);
      return false;
    }
  }

  async sendBookingConfirmationEmail(to: string, customerName: string, bookingDetails: {
    bookingId: number;
    boatName: string;
    boatType: string;
    checkinDate: string;
    checkoutDate: string;
    guests: number;
    totalAmount: string;
    location: string;
    description: string;
    ownerBusinessName: string;
    ownerPhone: string;
    ownerEmail: string;
  }): Promise<boolean> {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured');
        return false;
      }

      const msg = {
        to,
        from: FROM_EMAIL,
        subject: '🎉 Booking Confirmed - Your Boat Adventure Awaits!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Your boat adventure awaits</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Your booking has been confirmed! Here are the complete details:</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
                <h3 style="margin: 0 0 15px; color: #059669;">📋 Booking Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                  <div><strong>Booking ID:</strong> #${bookingDetails.bookingId}</div>
                  <div><strong>Boat Name:</strong> ${bookingDetails.boatName}</div>
                  <div><strong>Boat Type:</strong> ${bookingDetails.boatType}</div>
                  <div><strong>Location:</strong> ${bookingDetails.location}</div>
                  <div><strong>Check-in Date:</strong> ${new Date(bookingDetails.checkinDate).toLocaleDateString()}</div>
                  <div><strong>Check-out Date:</strong> ${new Date(bookingDetails.checkoutDate).toLocaleDateString()}</div>
                  <div><strong>Number of Guests:</strong> ${bookingDetails.guests}</div>
                  <div><strong>Total Amount:</strong> $${bookingDetails.totalAmount}</div>
                </div>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px; color: #333;">🚤 Boat Information</h3>
                <p style="font-size: 16px; margin-bottom: 15px; color: #555;">${bookingDetails.description}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                  <div><strong>Owner:</strong> ${bookingDetails.ownerBusinessName}</div>
                  <div><strong>Contact:</strong> ${bookingDetails.ownerPhone}</div>
                  <div><strong>Email:</strong> ${bookingDetails.ownerEmail}</div>
                </div>
              </div>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 15px; color: #d97706;">🎒 What to Bring</h3>
                <ul style="font-size: 16px; margin-bottom: 0; color: #92400e;">
                  <li>Valid ID for all passengers</li>
                  <li>Sunscreen and hats for sun protection</li>
                  <li>Food and beverages (if allowed by the boat owner)</li>
                  <li>Camera for capturing memories</li>
                  <li>Comfortable clothing and swimwear</li>
                  <li>Towels and personal items</li>
                </ul>
              </div>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 15px; color: #dc2626;">⚠️ Important Reminders</h3>
                <ul style="font-size: 16px; margin-bottom: 0; color: #991b1b;">
                  <li>Arrive 15 minutes before your scheduled time</li>
                  <li>Follow all safety instructions provided by the boat owner</li>
                  <li>Respect the boat and equipment</li>
                  <li>Have a wonderful time on the water!</li>
                </ul>
              </div>
              
              <div style="text-align: center; background: #f0fdf4; padding: 20px; border-radius: 8px; border: 2px solid #059669;">
                <h3 style="margin: 0 0 15px; color: #059669;">🌟 Happy Journey!</h3>
                <p style="font-size: 16px; margin-bottom: 0; color: #047857; font-style: italic;">
                  "The sea, once it casts its spell, holds one in its net of wonder forever." - Jacques Cousteau
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                   style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Booking Details
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2025 lendBoat. All rights reserved.</p>
              <p>Thank you for choosing lendBoat for your adventure!</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Booking confirmation email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending booking confirmation email:', error);
      return false;
    }
  }

  async sendBookingStatusEmail(to: string, userName: string, boatName: string, status: "accepted" | "declined", bookingDetails: any): Promise<boolean> {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured');
        return false;
      }

      const statusText = status === "accepted" ? "accepted" : "declined";
      const statusColor = status === "accepted" ? "#059669" : "#dc2626";
      const statusTitle = status === "accepted" ? "Booking Accepted!" : "Booking Declined";
      
      const msg = {
        to,
        from: FROM_EMAIL,
        subject: `Your booking has been ${statusText}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: ${statusColor}; color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">${statusTitle}</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Boat: ${boatName}</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Your booking for <strong>${boatName}</strong> has been <strong>${statusText}</strong> by the boat owner.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px; color: #333;">Booking Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                  <div><strong>Check-in:</strong> ${bookingDetails.checkinDate}</div>
                  <div><strong>Check-out:</strong> ${bookingDetails.checkoutDate}</div>
                  <div><strong>Guests:</strong> ${bookingDetails.guests}</div>
                  <div><strong>Total:</strong> $${bookingDetails.totalAmount}</div>
                </div>
              </div>
              
              ${status === "accepted" ? `
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
                  <h3 style="margin: 0 0 15px; color: #059669;">Next Steps</h3>
                  <p style="font-size: 16px; margin-bottom: 0; color: #0c4a6e;">The boat owner will contact you with specific pickup instructions and any additional details for your adventure!</p>
                </div>
              ` : `
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
                  <h3 style="margin: 0 0 15px; color: #dc2626;">What's Next?</h3>
                  <p style="font-size: 16px; margin-bottom: 0; color: #991b1b;">Don't worry! You can browse other available boats and make a new booking. We have many great options for you.</p>
                </div>
              `}
              
              <p style="font-size: 16px; margin-bottom: 20px;">Thank you for using lendBoat.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                   style="background: ${statusColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  ${status === "accepted" ? "View Booking" : "Browse More Boats"}
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2025 lendBoat. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Booking status email sent to ${to} (${status})`);
      return true;
    } catch (error) {
      console.error('❌ Error sending booking status email:', error);
      return false;
    }
  }

  async sendBookingReplyEmail(to: string, replyData: { customerName: string; boatName: string; replyMessage: string; ownerName: string; businessName: string }): Promise<boolean> {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured');
        return false;
      }

      const msg = {
        to,
        from: FROM_EMAIL,
        subject: `Re: ${replyData.boatName}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #0EA5E9, #0284C7); color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Re: ${replyData.boatName}</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Reply from ${replyData.ownerName} (${replyData.businessName})</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${replyData.customerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Here is the reply to your message:</p>
              <p style="font-size: 16px; margin-bottom: 20px;">${replyData.replyMessage}</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                   style="background: #0EA5E9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Your Message
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2025 lendBoat. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Booking reply email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending booking reply email:', error);
      return false;
    }
  }

  async sendContactNotificationEmail(contactData: { customerName: string; customerEmail: string; subject: string; message: string; contactId: number }): Promise<boolean> {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured');
        return false;
      }

      const msg = {
        to: 'support@lendboat.com',
        from: FROM_EMAIL,
        subject: `New Contact Notification - ${contactData.subject}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #0EA5E9, #0284C7); color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">New Contact Notification</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">A new contact form submission has been received</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Name: ${contactData.customerName}</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Email: ${contactData.customerEmail}</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Subject: ${contactData.subject}</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Message: ${contactData.message}</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Contact ID: ${contactData.contactId}</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                   style="background: #0EA5E9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Contact Details
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2025 lendBoat. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Contact notification email sent to support@lendboat.com`);
      return true;
    } catch (error) {
      console.error('❌ Error sending contact notification email:', error);
      return false;
    }
  }

  async sendContactConfirmationEmail(to: string, contactData: { customerName: string; subject: string }): Promise<boolean> {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured');
        return false;
      }

      const msg = {
        to,
        from: FROM_EMAIL,
        subject: `Thank you for contacting lendBoat - ${contactData.subject}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #0EA5E9, #0284C7); color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Thank you for contacting lendBoat!</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">We'll get back to you as soon as possible</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${contactData.customerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Thank you for reaching out to us regarding ${contactData.subject}.</p>
              <p style="font-size: 16px; margin-bottom: 20px;">We'll review your message and get back to you as soon as possible.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                   style="background: #0EA5E9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Your Message
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2025 lendBoat. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Contact confirmation email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending contact confirmation email:', error);
      return false;
    }
  }

  async sendContactReplyEmail(to: string, replyData: { customerName: string; originalSubject: string; replyMessage: string; adminName: string }): Promise<boolean> {
    try {
      if (!SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured');
        return false;
      }

      const msg = {
        to,
        from: FROM_EMAIL,
        subject: `Re: ${replyData.originalSubject}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #0EA5E9, #0284C7); color: white; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Re: ${replyData.originalSubject}</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Reply from ${replyData.adminName}</p>
            </div>
            <div style="padding: 40px 20px; background: white;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${replyData.customerName},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Here is the reply to your message:</p>
              <p style="font-size: 16px; margin-bottom: 20px;">${replyData.replyMessage}</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                   style="background: #0EA5E9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Your Message
                </a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>&copy; 2025 lendBoat. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ Contact reply email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending contact reply email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetLink: string,
    accountType: "admin" | "owner"
  ): Promise<boolean> {
    try {
      const msg = {
        to: email,
        from: process.env.FROM_EMAIL!,
        subject: "Password Reset Request - BoatRental",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🔐 Password Reset Request</h2>
            <p>Dear ${name},</p>
            <p>We received a request to reset your password for your ${accountType} account on BoatRental.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="font-size: 12px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                ${resetLink}
              </p>
            </div>
            
            <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>The BoatRental Team</p>
          </div>
        `,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error("SendGrid error:", error);
      return false;
    }
  }
}

export const emailService = new SendGridEmailService();
