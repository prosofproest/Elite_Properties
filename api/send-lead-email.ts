import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, projectInterest, message, budgetRange } = req.body;

  try {
    await resend.emails.send({
      from: 'Elite Properties <onboarding@resend.dev>',
      to: ['hruthwick701@gmail.com'],
      subject: `New Lead: ${name} — ${projectInterest || 'General Enquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1931; padding: 20px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0;">ELITE PROPERTIES</h1>
            <p style="color: white; margin: 5px 0;">New Lead Received!</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #0A1931;">Name:</td>
                <td style="padding: 10px;">${name}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; font-weight: bold; color: #0A1931;">Phone:</td>
                <td style="padding: 10px;"><a href="tel:${phone}">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #0A1931;">Email:</td>
                <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; font-weight: bold; color: #0A1931;">Project Interest:</td>
                <td style="padding: 10px;">${projectInterest || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #0A1931;">Budget:</td>
                <td style="padding: 10px;">${budgetRange || 'Not specified'}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; font-weight: bold; color: #0A1931;">Message:</td>
                <td style="padding: 10px;">${message || 'No message'}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://www.theeliteproperties.in/admin/leads" 
                 style="background: #C9A84C; color: #0A1931; padding: 12px 24px; 
                        text-decoration: none; font-weight: bold; border-radius: 4px;">
                View in Admin Panel
              </a>
            </div>
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://wa.me/${phone}" 
                 style="background: #25D366; color: white; padding: 12px 24px; 
                        text-decoration: none; font-weight: bold; border-radius: 4px;">
                WhatsApp This Lead
              </a>
            </div>
          </div>
          <div style="background: #0A1931; padding: 15px; text-align: center;">
            <p style="color: #C9A84C; margin: 0;">Elite Properties Mumbai</p>
            <p style="color: white; margin: 5px 0;">+91 73049 54717</p>
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Email failed' });
  }
}
