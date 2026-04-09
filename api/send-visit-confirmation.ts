import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, projectName, visitDate, timeSlot, referenceNumber } = req.body;

  try {
    // Email to visitor
    await resend.emails.send({
      from: 'Elite Properties <onboarding@resend.dev>',
      to: [email],
      subject: `Site Visit Confirmed ✓ — Ref: ${referenceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1931; padding: 20px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0;">ELITE PROPERTIES</h1>
            <p style="color: white;">Site Visit Confirmation</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #0A1931;">Dear ${name},</h2>
            <p>Your site visit has been confirmed!</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Reference:</strong> ${referenceNumber}</p>
              <p><strong>Project:</strong> ${projectName}</p>
              <p><strong>Date:</strong> ${visitDate}</p>
              <p><strong>Time:</strong> ${timeSlot}</p>
              <p><strong>Address:</strong> Elite Properties Office, Mumbai</p>
            </div>
            <p><strong>What to bring:</strong></p>
            <ul>
              <li>Aadhaar Card</li>
              <li>PAN Card</li>
              <li>Bank Statement (last 3 months)</li>
            </ul>
            <p>For queries call: <a href="tel:+917304954717">+91 73049 54717</a></p>
          </div>
          <div style="background: #0A1931; padding: 15px; text-align: center;">
            <p style="color: #C9A84C; margin: 0;">Elite Properties Mumbai</p>
            <p style="color: white; margin: 5px 0;">+91 73049 54717</p>
          </div>
        </div>
      `
    });

    // Email to admin
    await resend.emails.send({
      from: 'Elite Properties <onboarding@resend.dev>',
      to: ['theeliteproperties1@gmail.com'],
      subject: `New Site Visit: ${name} — ${visitDate} at ${timeSlot}`,
      html: `
        <p>New site visit booked!</p>
        <p>Name: ${name}</p>
        <p>Phone: ${phone}</p>
        <p>Project: ${projectName}</p>
        <p>Date: ${visitDate}</p>
        <p>Time: ${timeSlot}</p>
        <p>Ref: ${referenceNumber}</p>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Email failed' });
  }
}
