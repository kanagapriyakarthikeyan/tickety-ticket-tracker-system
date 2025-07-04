import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER, // send to yourself for testing
  subject: 'Test Email',
  text: 'This is a test email from Nodemailer'
}).then(info => {
  console.log('Email sent:', info.response);
  process.exit(0);
}).catch(err => {
  console.error('Error sending email:', err);
  process.exit(1);
}); 