const nodemailer = require("nodemailer");
const {
  email_host,
  email_service,
  email_port,
  email_user,
  email_pass,
} = require("./secret");

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: email_service || 'gmail',
    host: email_host || 'smtp.gmail.com',
    port: email_port || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: email_user,
      pass: email_pass,
    },
    // Additional options for Gmail
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function (Promise-based)
const sendEmail = async (mailOptions) => {
  try {
    const transporter = createTransporter();

    // Verify connection configuration
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      from: `"Tourist Safety" <${email_user || process.env.EMAIL_USER}>`,
      ...mailOptions,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email for registration
const sendRegistrationOTP = async (to, name, otp) => {
  const subject = 'Welcome to Tourist Safety - Verify Your Account';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .otp-box { background: white; border: 2px dashed #3498db; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 3px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Tourist Safety</h1>
          <h2>Welcome ${name}!</h2>
        </div>
        <div class="content">
          <p>Thank you for registering with Tourist Safety. To complete your registration, please verify your email address.</p>
          <div class="otp-box">
            <p><strong>Your Verification Code:</strong></p>
            <div class="otp-code">${otp}</div>
          </div>
          <p><strong>⚠️ Important:</strong> This OTP will expire in 10 minutes. Do not share this code with anyone.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>Stay Safe • Travel Smart • Connect Securely</p>
          <p>&copy; 2025 Tourist Safety. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject,
    html,
    text: `Welcome ${name}! Your verification code is: ${otp}. This code will expire in 10 minutes.`
  });
};

// Send OTP email for login
const sendLoginOTP = async (to, name, otp) => {
  const subject = 'Tourist Safety - Login Verification Code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .otp-box { background: white; border: 2px dashed #27ae60; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 3px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Tourist Safety</h1>
          <h2>Hello ${name}!</h2>
        </div>
        <div class="content">
          <p>We received a login request for your Tourist Safety account. Please use the verification code below to complete your login.</p>
          <div class="otp-box">
            <p><strong>Your Login Code:</strong></p>
            <div class="otp-code">${otp}</div>
          </div>
          <p><strong>✅ Secure Login:</strong> This code will expire in 10 minutes for your security.</p>
          <p>If you didn't request to log in, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>Stay Safe • Travel Smart • Connect Securely</p>
          <p>&copy; 2025 Tourist Safety. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject,
    html,
    text: `Hello ${name}! Your login code is: ${otp}. This code will expire in 10 minutes.`
  });
};

// Send password reset OTP email
const sendPasswordResetOTP = async (to, name, otp) => {
  const subject = 'Tourist Safety - Password Reset Code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .otp-box { background: white; border: 2px dashed #e74c3c; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 3px; }
        .warning { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Tourist Safety</h1>
          <h2>Password Reset</h2>
        </div>
        <div class="content">
          <p>Hello ${name}, we received a request to reset your password.</p>
          <div class="otp-box">
            <p><strong>Your Reset Code:</strong></p>
            <div class="otp-code">${otp}</div>
          </div>
          <div class="warning">
            <strong>🔒 Security Notice:</strong> This code will expire in 15 minutes. Do not share this code with anyone.
          </div>
          <p>If you didn't request a password reset, please ignore this email and contact our support team.</p>
        </div>
        <div class="footer">
          <p>Stay Safe • Travel Smart • Connect Securely</p>
          <p>&copy; 2025 Tourist Safety. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject,
    html,
    text: `Hello ${name}! Your password reset code is: ${otp}. This code will expire in 15 minutes.`
  });
};

module.exports = {
  sendEmail,
  sendRegistrationOTP,
  sendLoginOTP,
  sendPasswordResetOTP,
  createTransporter
};
