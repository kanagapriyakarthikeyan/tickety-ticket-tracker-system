import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Change to your email provider if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends a password reset email to the specified address with the given reset link.
 * @param {string} to - Recipient's email address
 * @param {string} resetLink - Password reset link
 */
export async function sendPasswordResetEmail(to, resetLink) {
  const mailOptions = {
    from: `"Tickety Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    html: `<p>You requested a password reset.</p>
           <p><a href="${resetLink}">Click here to reset your password</a></p>
           <p>If you did not request this, please ignore this email.</p>`
  };

  await transporter.sendMail(mailOptions);
} 