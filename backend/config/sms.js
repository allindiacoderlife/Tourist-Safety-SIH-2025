const twilio = require('twilio');
const config = require('./secret');

// Initialize Twilio client
const client = twilio(config.twilio_account_sid, config.twilio_auth_token);

// Send SMS OTP
const sendSMSOTP = async (phoneNumber, otp, type = 'login') => {
  try {
    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    let message = '';

    switch (type) {
      case 'login':
        message = `Your Tourist Safety login OTP is: ${otp}. Valid for 10 minutes.`;
        break;
      case 'registration':
        message = `Your Tourist Safety registration OTP is: ${otp}. Valid for 10 minutes.`;
        break;
      case 'reset':
        message = `Your Tourist Safety password reset OTP is: ${otp}. Valid for 15 minutes.`;
        break;
      default:
        message = `Your Tourist Safety OTP is: ${otp}`;
    }

    const sms = await client.messages.create({
      body: message,
      from: config.twilio_phone_number,
      to: formattedPhone
    });

    console.log(`SMS sent successfully to ${formattedPhone}. SID: ${sms.sid}`);
    return {
      success: true,
      messageId: sms.sid,
      phoneNumber: formattedPhone
    };

  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send login OTP via SMS
const sendLoginOTPSMS = async (phoneNumber, otp) => {
  console.log(`Attempting to send SMS OTP to: ${phoneNumber}, OTP: ${otp}`);
  const result = await sendSMSOTP(phoneNumber, otp, 'login');
  console.log(`SMS send result:`, result);
  return result;
};

// Send registration OTP via SMS
const sendRegistrationOTPSMS = async (phoneNumber, otp) => {
  return await sendSMSOTP(phoneNumber, otp, 'registration');
};

// Send password reset OTP via SMS
const sendPasswordResetOTPSMS = async (phoneNumber, otp) => {
  return await sendSMSOTP(phoneNumber, otp, 'reset');
};

module.exports = {
  sendSMSOTP,
  sendLoginOTPSMS,
  sendRegistrationOTPSMS,
  sendPasswordResetOTPSMS
};