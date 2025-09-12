const socketService = require('./socketService');

class NotificationService {
  constructor() {
    // Initialize any external service clients here
    // For example: SMS service, Email service
  }

  // Send SMS notification
  async sendSMS(phoneNumber, message, alertData = null) {
    try {
      console.log(`Sending SMS to ${phoneNumber}: ${message}`);
      
      // TODO: Implement actual SMS sending using your preferred service
      // Example services: Twilio, TextLocal, AWS SNS, etc.
      
      // For now, just log the SMS
      console.log('SMS Details:', {
        to: phoneNumber,
        message,
        alertId: alertData?.id,
        timestamp: new Date()
      });

      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        messageId: `sms_${Date.now()}`,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // Send Email notification
  async sendEmail(emailAddress, subject, message, alertData = null) {
    try {
      console.log(`Sending email to ${emailAddress}: ${subject}`);
      
      // TODO: Implement actual email sending using your preferred service
      // Example services: SendGrid, Mailgun, AWS SES, Nodemailer, etc.
      
      // For now, just log the email
      console.log('Email Details:', {
        to: emailAddress,
        subject,
        message,
        alertId: alertData?.id,
        timestamp: new Date()
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        success: true,
        messageId: `email_${Date.now()}`,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // Send notifications to emergency contacts
  async notifyEmergencyContacts(emergencyContacts, sosAlert) {
    const notifications = {
      sms: [],
      email: [],
      failed: []
    };

    if (!emergencyContacts || emergencyContacts.length === 0) {
      console.log('No emergency contacts to notify');
      return notifications;
    }

    const alertMessage = this.generateAlertMessage(sosAlert);
    const emailSubject = `🚨 EMERGENCY ALERT - ${sosAlert.userId?.name || 'Tourist'} needs help!`;

    // Send notifications to each emergency contact
    for (const contact of emergencyContacts) {
      try {
        // Send SMS if phone number is provided
        if (contact.phone) {
          const smsResult = await this.sendSMS(contact.phone, alertMessage, sosAlert);
          if (smsResult.success) {
            notifications.sms.push({
              contact: contact.name,
              phone: contact.phone,
              messageId: smsResult.messageId,
              sentAt: smsResult.timestamp
            });
          } else {
            notifications.failed.push({
              contact: contact.name,
              type: 'SMS',
              phone: contact.phone,
              error: smsResult.error
            });
          }
        }

        // Send Email if email address is provided
        if (contact.email) {
          const emailResult = await this.sendEmail(
            contact.email, 
            emailSubject, 
            this.generateDetailedEmailMessage(sosAlert, contact),
            sosAlert
          );
          if (emailResult.success) {
            notifications.email.push({
              contact: contact.name,
              email: contact.email,
              messageId: emailResult.messageId,
              sentAt: emailResult.timestamp
            });
          } else {
            notifications.failed.push({
              contact: contact.name,
              type: 'Email',
              email: contact.email,
              error: emailResult.error
            });
          }
        }

      } catch (error) {
        console.error(`Error notifying contact ${contact.name}:`, error);
        notifications.failed.push({
          contact: contact.name,
          type: 'General',
          error: error.message
        });
      }
    }

    console.log('Emergency contact notifications sent:', {
      smsCount: notifications.sms.length,
      emailCount: notifications.email.length,
      failedCount: notifications.failed.length
    });

    return notifications;
  }

  // Generate alert message for SMS
  generateAlertMessage(sosAlert) {
    const userName = sosAlert.userId?.name || 'A tourist';
    const location = sosAlert.location?.address || 
      `${sosAlert.location?.latitude}, ${sosAlert.location?.longitude}`;
    
    return `🚨 EMERGENCY ALERT: ${userName} has triggered an SOS alert and needs immediate help! Location: ${location}. Time: ${new Date(sosAlert.createdAt).toLocaleString()}. Please contact local emergency services if you cannot reach them directly.`;
  }

  // Generate detailed email message
  generateDetailedEmailMessage(sosAlert, contact) {
    const userName = sosAlert.userId?.name || 'Tourist';
    const userPhone = sosAlert.userId?.phone || 'Not available';
    const userEmail = sosAlert.userId?.email || 'Not available';
    const location = sosAlert.location?.address || 
      `Coordinates: ${sosAlert.location?.latitude}, ${sosAlert.location?.longitude}`;
    
    return `
Dear ${contact.name || 'Emergency Contact'},

This is an EMERGENCY ALERT from the Tourist Safety System.

ALERT DETAILS:
- Person: ${userName}
- Phone: ${userPhone}
- Email: ${userEmail}
- Location: ${location}
- Time: ${new Date(sosAlert.createdAt).toLocaleString()}
- Alert ID: ${sosAlert.id}
${sosAlert.description ? `- Description: ${sosAlert.description}` : ''}

IMMEDIATE ACTIONS REQUIRED:
1. Try to contact ${userName} directly at ${userPhone}
2. If you cannot reach them, contact local emergency services immediately
3. Share this location information with emergency responders
4. Stay available for updates from emergency services

This alert has been automatically sent to emergency responders and relevant authorities.

If this is a false alarm, please contact us immediately.

Tourist Safety Emergency System
Time sent: ${new Date().toLocaleString()}
    `.trim();
  }

  // Send SOS notification through multiple channels
  async sendSOSNotification(sosAlert) {
    try {
      console.log(`Sending SOS notifications for alert: ${sosAlert.id}`);
      
      const results = {
        dashboard: false,
        emergencyContacts: null,
        timestamp: new Date()
      };

      // 1. Emit to dashboard via Socket.IO
      try {
        if (socketService.isInitialized()) {
          socketService.emitSOSAlert(sosAlert);
          results.dashboard = true;
          console.log('✅ Dashboard notification sent');
        } else {
          console.log('⚠️ Socket.IO not initialized, skipping dashboard notification');
        }
      } catch (error) {
        console.error('Error sending dashboard notification:', error);
      }

      // 2. Notify emergency contacts
      if (sosAlert.emergencyContacts && sosAlert.emergencyContacts.length > 0) {
        try {
          results.emergencyContacts = await this.notifyEmergencyContacts(
            sosAlert.emergencyContacts, 
            sosAlert
          );
          console.log('✅ Emergency contacts notified');
        } catch (error) {
          console.error('Error notifying emergency contacts:', error);
          results.emergencyContacts = { error: error.message };
        }
      } else {
        console.log('ℹ️ No emergency contacts to notify');
        results.emergencyContacts = { message: 'No emergency contacts provided' };
      }

      return results;

    } catch (error) {
      console.error('Error in sendSOSNotification:', error);
      throw error;
    }
  }

  // Send SOS update notification
  async sendSOSUpdateNotification(sosAlert, updateType = 'updated') {
    try {
      console.log(`Sending SOS update notifications for alert: ${sosAlert.id}`);
      
      // Emit to dashboard via Socket.IO
      if (socketService.isInitialized()) {
        socketService.emitSOSUpdate(sosAlert, updateType);
        console.log('✅ Dashboard update notification sent');
      }

      // If alert is resolved, notify emergency contacts
      if (sosAlert.status === 'resolved' && sosAlert.emergencyContacts?.length > 0) {
        const resolvedMessage = `✅ ALERT RESOLVED: The emergency alert for ${sosAlert.userId?.name || 'Tourist'} has been resolved by emergency responders. Time: ${new Date().toLocaleString()}. Alert ID: ${sosAlert.id}`;
        
        const emailSubject = `✅ Emergency Alert Resolved - ${sosAlert.userId?.name || 'Tourist'}`;
        
        for (const contact of sosAlert.emergencyContacts) {
          if (contact.phone) {
            await this.sendSMS(contact.phone, resolvedMessage, sosAlert);
          }
          if (contact.email) {
            await this.sendEmail(contact.email, emailSubject, resolvedMessage, sosAlert);
          }
        }
      }

      return { success: true, timestamp: new Date() };

    } catch (error) {
      console.error('Error in sendSOSUpdateNotification:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
