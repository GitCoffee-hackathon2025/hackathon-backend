import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface FormatMail {
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(email: string, { subject, text, html }: FormatMail) {
  await transporter.sendMail({
    from: `'Hackathon' <${process.env.EMAIL}>`,
    to: email,
    subject,
    text,
    html,
  });
}
