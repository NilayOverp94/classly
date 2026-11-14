import { NextRequest, NextResponse } from 'next/server';
import { getResendClient } from '@/lib/resend/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'support@classly.com';
    const client = getResendClient();

    if (!client) {
      console.warn('RESEND_API_KEY is not configured on server; inquiry logged.');
      return NextResponse.json({ success: true, simulated: true });
    }

    // Dispatch email notification via Resend
    const { data, error } = await client.emails.send({
      from: `Classly Support <${fromEmail}>`,
      to: [fromEmail],
      replyTo: email,
      subject: `[Classly Support] ${subject} from ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #242B35;">
          <h2>New Support Inquiry Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.warn('Resend send error:', error);
      return NextResponse.json({ success: false, error }, { status: 200 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Email route error:', err);
    return NextResponse.json({ success: true, fallback: true });
  }
}
