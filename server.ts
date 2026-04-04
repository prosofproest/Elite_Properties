/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import cron from 'node-cron';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || 'onboarding@resend.dev';

async function logEmail(recipientEmail: string, recipientName: string, templateName: string, status: 'sent' | 'failed', relatedId?: string) {
  try {
    await addDoc(collection(db, 'emailLogs'), {
      recipientEmail,
      recipientName,
      templateName,
      status,
      sentAt: serverTimestamp(),
      relatedId: relatedId || null
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

const getEmailTemplate = (content: string, recipientEmail: string = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #0A1931; padding: 30px 20px; text-align: center; border-bottom: 4px solid #C9A84C; }
    .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: 2px; }
    .content { padding: 24px; color: #333333; line-height: 1.6; }
    .footer { background-color: #f1f1f1; padding: 24px; text-align: center; font-size: 12px; color: #666666; }
    .btn { display: inline-block; background-color: #C9A84C; color: #0A1931; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .contact-box { background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .contact-box p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
    th { color: #666; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ELITE PROPERTIES</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2025 Elite Properties Mumbai. All Rights Reserved.</p>
      <p>+91 88845 30510 | info@eliteproperties.in</p>
      <p style="font-size: 10px; margin-top: 15px;">Disclaimer: The information provided in this email is for informational purposes only. Elite Properties is a RERA registered real estate consultancy.</p>
      <p style="margin-top: 15px;"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?email=${recipientEmail}" style="color: #999;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ROUTE 1: /api/send-lead-email
  app.post('/api/send-lead-email', async (req, res) => {
    const { id, name, email, phone, projectInterest, budget, source } = req.body;

    try {
      // Email A -> To lead
      if (email) {
        try {
          await resend.emails.send({
            from: `Elite Properties <${FROM_EMAIL}>`,
            to: [email],
            subject: `Thank You ${name}! Elite Properties Will Call You Shortly`,
            html: getEmailTemplate(`
              <p>Dear ${name},</p>
              <p>We received your enquiry for <strong>${projectInterest || 'our properties'}</strong>.</p>
              <p>Our expert will call you within 2 hours on <strong>${phone}</strong>.</p>
              
              <h3 style="color: #0A1931; margin-top: 30px;">3 Reasons to Choose Elite Properties:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;">✓ RERA Registered & Compliant</li>
                <li style="margin-bottom: 10px;">✓ 30+ Years of Excellence</li>
                <li style="margin-bottom: 10px;">✓ 15,000+ Happy Families</li>
              </ul>

              <div style="text-align: center;">
                <a href="https://eliteproperties.in/projects" class="btn">View Our Projects</a>
              </div>

              <div class="contact-box">
                <p>📞 +91 88845 30510</p>
                <p>💬 <a href="https://wa.me/918884530510" style="color: #25d366; text-decoration: none; font-weight: bold;">WhatsApp Us</a></p>
                <p>⏰ Mon-Sat: 10AM - 7PM</p>
              </div>
            `, email)
          });
          await logEmail(email, name, 'Lead Confirmation', 'sent', id);
        } catch (err) {
          console.error('Failed to send lead confirmation email:', err);
          await logEmail(email, name, 'Lead Confirmation', 'failed', id);
        }
      }

      // Email B -> To admin
      try {
        await resend.emails.send({
          from: `Elite System <${FROM_EMAIL}>`,
          to: ['info@eliteproperties.in'], // Default admin email
          subject: `🔔 New Lead: ${name} interested in ${projectInterest || 'properties'}`,
          html: getEmailTemplate(`
            <h2 style="color: #0A1931; margin-top: 0;">New Lead Notification</h2>
            <table>
              <tr><th>Name</th><td>${name}</td></tr>
              <tr><th>Phone</th><td>${phone}</td></tr>
              <tr><th>Email</th><td>${email || 'N/A'}</td></tr>
              <tr><th>Project</th><td>${projectInterest || 'N/A'}</td></tr>
              <tr><th>Budget</th><td>${budget || 'N/A'}</td></tr>
              <tr><th>Source</th><td>${source || 'Website'}</td></tr>
              <tr><th>Time</th><td>${new Date().toLocaleString()}</td></tr>
            </table>

            <div style="margin-top: 30px;">
              <a href="tel:${phone}" class="btn" style="background-color: #0A1931; color: #fff; margin-right: 10px;">Call Now</a>
              <a href="https://wa.me/${phone.replace(/\D/g, '')}" class="btn" style="background-color: #25d366; color: #fff; margin-right: 10px;">WhatsApp Lead</a>
              <a href="https://eliteproperties.in/admin/leads" class="btn" style="background-color: #f1f1f1; color: #333;">View in Admin</a>
            </div>
          `)
        });
        await logEmail('info@eliteproperties.in', 'Admin', 'Admin Lead Notification', 'sent', id);
      } catch (err) {
        console.error('Failed to send admin lead notification:', err);
        await logEmail('info@eliteproperties.in', 'Admin', 'Admin Lead Notification', 'failed', id);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Lead email route error:', error);
      res.status(500).json({ error: 'Failed to process emails' });
    }
  });

  // ROUTE 2: /api/send-visit-confirmation
  app.post('/api/send-visit-confirmation', async (req, res) => {
    const { id, name, email, phone, projectName, visitDate, timeSlot, referenceNumber } = req.body;

    try {
      // Email A -> To visitor
      if (email) {
        try {
          await resend.emails.send({
            from: `Elite Properties <${FROM_EMAIL}>`,
            to: [email],
            subject: `Site Visit Confirmed ✓ — Ref: [${referenceNumber}]`,
            html: getEmailTemplate(`
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="color: #666; text-transform: uppercase; font-size: 12px; margin-bottom: 5px;">Reference Number</p>
                <h2 style="color: #0A1931; font-size: 32px; margin: 0; letter-spacing: 2px;">${referenceNumber}</h2>
              </div>
              
              <p>Dear ${name},</p>
              <p>Your site visit has been successfully scheduled.</p>
              
              <div class="contact-box">
                <p>📅 <strong>Date:</strong> ${visitDate}</p>
                <p>⏰ <strong>Time:</strong> ${timeSlot}</p>
                <p>🏢 <strong>Project:</strong> ${projectName}</p>
                <p>📍 <strong>Address:</strong> Elite Properties Office, Mumbai</p>
              </div>

              <h3 style="color: #0A1931; margin-top: 30px;">What to bring:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;">✓ Aadhaar Card</li>
                <li style="margin-bottom: 10px;">✓ PAN Card</li>
                <li style="margin-bottom: 10px;">✓ Bank Statement (last 3 months)</li>
              </ul>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://maps.google.com/?q=Elite+Properties+Mumbai" class="btn" style="background-color: #f1f1f1; color: #333; margin-right: 10px;">Google Maps</a>
                <a href="https://wa.me/918884530510" class="btn" style="background-color: #25d366; color: #fff;">WhatsApp Us</a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
                Need to reschedule? Call <a href="tel:+918884530510" style="color: #0A1931; font-weight: bold; text-decoration: none;">+91 88845 30510</a>
              </p>
            `, email)
          });
          await logEmail(email, name, 'Visit Confirmation', 'sent', id);
        } catch (err) {
          console.error('Failed to send visit confirmation email:', err);
          await logEmail(email, name, 'Visit Confirmation', 'failed', id);
        }
      }

      // Email B -> To admin
      try {
        await resend.emails.send({
          from: `Elite System <${FROM_EMAIL}>`,
          to: ['info@eliteproperties.in'],
          subject: `📅 New Site Visit: ${name} — ${visitDate} at ${timeSlot}`,
          html: getEmailTemplate(`
            <h2 style="color: #0A1931; margin-top: 0;">New Site Visit Booking</h2>
            <table>
              <tr><th>Name</th><td>${name}</td></tr>
              <tr><th>Phone</th><td>${phone}</td></tr>
              <tr><th>Email</th><td>${email || 'N/A'}</td></tr>
              <tr><th>Project</th><td>${projectName}</td></tr>
              <tr><th>Date</th><td>${visitDate}</td></tr>
              <tr><th>Time</th><td>${timeSlot}</td></tr>
              <tr><th>Ref Number</th><td>${referenceNumber}</td></tr>
            </table>

            <div style="margin-top: 30px;">
              <a href="https://eliteproperties.in/admin/site-visits" class="btn">View in Admin</a>
            </div>
          `)
        });
        await logEmail('info@eliteproperties.in', 'Admin', 'Admin Visit Notification', 'sent', id);
      } catch (err) {
        console.error('Failed to send admin visit notification:', err);
        await logEmail('info@eliteproperties.in', 'Admin', 'Admin Visit Notification', 'failed', id);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Visit confirmation route error:', error);
      res.status(500).json({ error: 'Failed to process emails' });
    }
  });

  // ROUTE 3: /api/send-visit-reminder
  app.post('/api/send-visit-reminder', async (req, res) => {
    const { id, name, email, projectName, visitDate, timeSlot } = req.body;

    try {
      if (email) {
        await resend.emails.send({
          from: `Elite Properties <${FROM_EMAIL}>`,
          to: [email],
          subject: `Reminder: Site Visit Tomorrow at ${timeSlot} — Elite Properties`,
          html: getEmailTemplate(`
            <p>Dear ${name},</p>
            <p>This is a friendly reminder for your scheduled site visit tomorrow for <strong>${projectName}</strong>.</p>
            
            <div class="contact-box">
              <p>📅 <strong>Date:</strong> ${visitDate}</p>
              <p>⏰ <strong>Time:</strong> ${timeSlot}</p>
              <p>📍 <strong>Address:</strong> Elite Properties Office, Mumbai</p>
            </div>

            <h3 style="color: #0A1931; margin-top: 30px;">What to bring:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;">✓ Aadhaar Card</li>
              <li style="margin-bottom: 10px;">✓ PAN Card</li>
              <li style="margin-bottom: 10px;">✓ Bank Statement (last 3 months)</li>
            </ul>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://maps.google.com/?q=Elite+Properties+Mumbai" class="btn" style="background-color: #f1f1f1; color: #333; margin-right: 10px;">Get Directions</a>
              <a href="https://wa.me/918884530510" class="btn" style="background-color: #25d366; color: #fff;">WhatsApp Us</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
              Emergency contact: <a href="tel:+918884530510" style="color: #0A1931; font-weight: bold; text-decoration: none;">+91 88845 30510</a>
            </p>
          `, email)
        });
        await logEmail(email, name, 'Visit Reminder', 'sent', id);
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Visit reminder route error:', error);
      if (email) await logEmail(email, name, 'Visit Reminder', 'failed', id);
      res.status(500).json({ error: 'Failed to send reminder' });
    }
  });

  // ROUTE 4: /api/send-partner-welcome
  app.post('/api/send-partner-welcome', async (req, res) => {
    const { id, name, email, refCode } = req.body;

    try {
      if (email) {
        await resend.emails.send({
          from: `Elite Partners <${FROM_EMAIL}>`,
          to: [email],
          subject: `Welcome to Elite Properties Partner Network! 🎉`,
          html: getEmailTemplate(`
            <h2 style="color: #0A1931; margin-top: 0;">Welcome, ${name}!</h2>
            <p>Congratulations! Your channel partner application has been approved.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; text-transform: uppercase; font-size: 12px; margin-bottom: 5px;">Your Unique Referral Link</p>
              <div style="background-color: #f8f9fa; border: 1px dashed #C9A84C; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 16px; color: #0A1931; word-break: break-all;">
                https://eliteproperties.in/ref/${refCode}
              </div>
            </div>

            <div class="contact-box">
              <h3 style="margin-top: 0; color: #0A1931;">Commission Structure</h3>
              <p>Earn <strong>2% commission</strong> per successful sale made through your referral link.</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://eliteproperties.in/channel-partners/dashboard" class="btn">Access Partner Dashboard</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
              Your dedicated manager will contact you within 24 hours.<br>
              For immediate assistance, call <a href="tel:+918884530510" style="color: #0A1931; font-weight: bold; text-decoration: none;">+91 88845 30510</a>
            </p>
          `, email)
        });
        await logEmail(email, name, 'Partner Welcome', 'sent', id);
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Partner welcome route error:', error);
      if (email) await logEmail(email, name, 'Partner Welcome', 'failed', id);
      res.status(500).json({ error: 'Failed to send welcome email' });
    }
  });

  // CRON JOB: Send visit reminders daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily visit reminder cron job...');
    try {
      // Get tomorrow's date in YYYY-MM-DD format
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const q = query(collection(db, 'siteVisits'), where('visitDate', '==', tomorrowStr), where('status', '==', 'Confirmed'));
      const snapshot = await getDocs(q);

      console.log(`Found ${snapshot.docs.length} confirmed visits for tomorrow.`);

      for (const doc of snapshot.docs) {
        const visit = doc.data();
        if (visit.email) {
          try {
            await fetch(`http://localhost:${PORT}/api/send-visit-reminder`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: doc.id,
                name: visit.name,
                email: visit.email,
                projectName: visit.projectName,
                visitDate: visit.visitDate,
                timeSlot: visit.timeSlot
              })
            });
            console.log(`Sent reminder to ${visit.email}`);
          } catch (err) {
            console.error(`Failed to send reminder to ${visit.email}:`, err);
          }
        }
      }
    } catch (error) {
      console.error('Error running visit reminder cron job:', error);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
