import axios from 'axios';
import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

// Create and configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSKEY,
  },
});

// Helper function to send a message via Telegram
interface TelegramMessagePayload {
  ok: boolean;
  text: string;
  chat_id: string;
}

async function sendTelegramMessage(token: string, chat_id: string, message: string): Promise<boolean> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await axios.post<TelegramMessagePayload>(url, {
      text: message,
      chat_id,
    });
    return res.data.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', (error as any).response?.data || (error as any).message);
    return false;
  }
};

// HTML email template
interface EmailPayload {
  name: string;
  email: string;
  message: string;
}

const generateEmailTemplate = (name: string, email: string, userMessage: string): string => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #007BFF;">New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; margin-left: 0;">
        ${userMessage}
      </blockquote>
      <p style="font-size: 12px; color: #888;">Click reply to respond to the sender.</p>
    </div>
  </div>
`;

// Helper function to send an email via Nodemailer
interface EmailPayload {
  name: string;
  email: string;
  message: string;
}

async function sendEmail(payload: EmailPayload, message: string): Promise<boolean> {
  const { name, email, message: userMessage } = payload;

  const mailOptions: nodemailer.SendMailOptions = {
    from: "Portfolio",
    to: process.env.EMAIL_ADDRESS,
    subject: `New Message From ${name}`,
    text: message,
    html: generateEmailTemplate(name, email, userMessage),
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error while sending email:', (error as Error).message);
    return false;
  }
};

interface RequestPayload {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload: RequestPayload = await request.json();
    const { name, email, message: userMessage } = payload;
    const token: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id: string | undefined = process.env.TELEGRAM_CHAT_ID;

    // Validate environment variables
    if (!token || !chat_id) {
      return NextResponse.json({
        success: false,
        message: 'Telegram token or chat ID is missing.',
      }, { status: 400 });
    }

    const message: string = `New message from ${name}\n\nEmail: ${email}\n\nMessage:\n\n${userMessage}\n\n`;

    // Send Telegram message
    const telegramSuccess: boolean = await sendTelegramMessage(token, chat_id, message);

    // Send email
    const emailSuccess: boolean = await sendEmail(payload, message);

    if (telegramSuccess && emailSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Message and email sent successfully!',
      }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to send message or email.',
    }, { status: 500 });
  } catch (error) {
    console.error('API Error:', (error as Error).message);
    return NextResponse.json({
      success: false,
      message: 'Server error occurred.',
    }, { status: 500 });
  }
};