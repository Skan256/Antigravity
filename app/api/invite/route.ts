import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, projectId, role, inviterEmail } = await req.json();

    const smtpUser = process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASSWORD;

    // Build the email content
    const subject = `You've been invited to ArcheoMind`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background: #fdfdfd; padding: 20px; color: #333;">
        <h2 style="color: #bc6c25;">ArcheoMind Collaboration</h2>
        <p>Hello,</p>
        <p>You have been invited by <strong>${inviterEmail || 'a colleague'}</strong> to join their workspace on ArcheoMind as a <strong>${role}</strong>.</p>
        <p>ArcheoMind is a collaborative SaaS platform for archaeological artifacts.</p>
        <a href="http://localhost:3000/login" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #bc6c25; color: white; text-decoration: none; border-radius: 5px;">
          Accept Invitation & Login
        </a>
      </div>
    `;

    // If SMTP credentials aren't set in .env.local, simulate sending
    if (!smtpUser || !smtpPass) {
      console.log(`\n\n---------------------------------`);
      console.log(`📧 MOCK EMAIL SENT (No SMTP Credentials found in .env.local)`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${htmlContent.replace(/<[^>]*>?/gm, '')}`);
      console.log(`---------------------------------\n\n`);
      
      return NextResponse.json({ success: true, mocked: true, message: "Email simulated (no SMTP credentials)" });
    }

    // Configure Nodemailer for actual sending
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: `"ArcheoMind Platform" <${smtpUser}>`,
      to: email,
      subject: subject,
      html: htmlContent
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email. Check SMTP credentials." },
      { status: 500 }
    );
  }
}
