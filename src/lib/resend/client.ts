import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('placeholder')) return null;
  if (!_resend) {
    _resend = new Resend(key);
  }
  return _resend;
}

export async function sendBookingConfirmationEmail(params: {
  to: string;
  studentName: string;
  teacherName: string;
  subject: string;
  startTime: string;
  meetingUrl: string;
}) {
  const client = getResendClient();
  if (!client) {
    console.warn('RESEND_API_KEY is not configured; skipping email dispatch.');
    return { success: true, simulated: true };
  }

  const fromEmail = 'Classly <onboarding@resend.dev>';

  try {
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [params.to],
      subject: `Booking Confirmed: ${params.subject} with ${params.teacherName}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #242B35; background-color: #FAFAF8;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #183153; font-size: 28px; margin: 0;">Classly</h1>
            <p style="color: #45A879; font-weight: 500; margin: 4px 0 0 0;">Learn Together. Grow Anywhere.</p>
          </div>
          <div style="background-color: #ffffff; border-radius: 8px; border: 1px solid #E2E8F0; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h2 style="color: #183153; margin-top: 0;">Your Lesson is Confirmed!</h2>
            <p>Hi ${params.studentName},</p>
            <p>Your upcoming one-to-one learning session has been successfully booked and scheduled.</p>
            
            <div style="background-color: #F0F4F9; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <p style="margin: 4px 0;"><strong>Teacher:</strong> ${params.teacherName}</p>
              <p style="margin: 4px 0;"><strong>Subject:</strong> ${params.subject}</p>
              <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${params.startTime}</p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${params.meetingUrl}" style="background-color: #183153; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Enter Live Classroom
              </a>
            </div>

            <p style="color: #64748B; font-size: 14px;">Please test your microphone and camera 5 minutes prior to the scheduled start time.</p>
          </div>
          <p style="text-align: center; color: #94A3B8; font-size: 12px; margin-top: 24px;">
            Classly Marketplace • Safe, Verified K-12 Tutoring
          </p>
        </div>
      `,
    });

    if (error) {
      await client.emails.send({
        from: fromEmail,
        to: ['nilayraj713@gmail.com'],
        subject: `[Student Confirmation Copy] ${params.subject} with ${params.teacherName}`,
        html: `<p>Student booking confirmation for ${params.studentName} (${params.to})</p>`,
      });
    }

    return { success: !error, data, error };
  } catch (err) {
    console.error('Failed to send booking confirmation email:', err);
    return { success: false, error: err };
  }
}

export async function sendTeacherApplicationStatusEmail(params: {
  to: string;
  teacherName: string;
  status: 'approved' | 'rejected' | 'received';
  notes?: string;
}) {
  const client = getResendClient();
  if (!client) {
    console.warn('RESEND_API_KEY is not configured; skipping email dispatch.');
    return { success: true, simulated: true };
  }

  const fromEmail = 'Classly <onboarding@resend.dev>';
  const isApproved = params.status === 'approved';
  const isReceived = params.status === 'received';
  const subject = isApproved 
    ? 'Congratulations! Your Classly Tutor Application is Approved' 
    : isReceived 
    ? 'Classly Tutor Application Received — Under Review' 
    : 'Update on your Classly Tutor Application';

  try {
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [params.to],
      subject,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #242B35; background-color: #FAFAF8;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #183153; font-size: 28px; margin: 0;">Classly</h1>
            <p style="color: #45A879; font-weight: 500; margin: 4px 0 0 0;">Learn Together. Grow Anywhere.</p>
          </div>
          <div style="background-color: #ffffff; border-radius: 8px; border: 1px solid #E2E8F0; padding: 32px;">
            <h2 style="color: #183153; margin-top: 0;">Hello ${params.teacherName},</h2>
            ${
              isApproved
                ? `<p>We are delighted to welcome you to the Classly educator network. Your profile has passed our verification standards.</p>
                   <p>You can now set your availability, publish group classes, and start accepting students from the United States.</p>`
                : isReceived
                ? `<p>Thank you for applying to teach on Classly. We have safely received your personal details, credentials, and verification documents.</p>
                   <p>Our academic compliance team manually reviews all educator credentials within 24 to 48 hours to ensure safe, high-quality learning for K-12 students.</p>`
                : `<p>Thank you for your interest in Classly. After review, we are unable to approve your application at this time.</p>
                   ${params.notes ? `<p><strong>Feedback:</strong> ${params.notes}</p>` : ''}`
            }
          </div>
        </div>
      `,
    });
    return { success: !error, data, error };
  } catch (err) {
    console.error('Failed to send teacher application status email:', err);
    return { success: false, error: err };
  }
}

export async function sendTeacherBookingNotificationEmail(params: {
  to: string;
  teacherName: string;
  studentName: string;
  subject: string;
  startTime: string;
  hourlyRate: number;
  meetingUrl: string;
  notes?: string;
}) {
  const client = getResendClient();
  if (!client) {
    console.warn('RESEND_API_KEY is not configured; skipping email dispatch.');
    return { success: true, simulated: true };
  }

  const emailHtml = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #242B35; background-color: #FAFAF8;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #183153; font-size: 28px; margin: 0;">Classly</h1>
        <p style="color: #45A879; font-weight: 500; margin: 4px 0 0 0;">Teacher Studio • New Booking Alert</p>
      </div>
      <div style="background-color: #ffffff; border-radius: 8px; border: 1px solid #E2E8F0; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <h2 style="color: #183153; margin-top: 0;">You have a new student booking! 🎉</h2>
        <p>Hi <strong>${params.teacherName}</strong>,</p>
        <p>A parent/student has successfully booked and paid for a 1-on-1 learning session with you.</p>
        
        <div style="background-color: #F0F4F9; border-radius: 6px; padding: 16px; margin: 24px 0;">
          <p style="margin: 4px 0;"><strong>Student:</strong> ${params.studentName}</p>
          <p style="margin: 4px 0;"><strong>Subject Track:</strong> ${params.subject}</p>
          <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${params.startTime}</p>
          <p style="margin: 4px 0;"><strong>Session Rate:</strong> $${params.hourlyRate.toFixed(2)} USD</p>
          ${params.notes ? `<p style="margin: 4px 0;"><strong>Student Topics & Goals:</strong> "${params.notes}"</p>` : ''}
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${params.meetingUrl}" style="background-color: #183153; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Launch Live Classroom
          </a>
        </div>

        <p style="color: #64748B; font-size: 14px;">The HD interactive whiteboard and video room will activate before the lesson begins. You can also view this booking on your <a href="https://classly-doomsday23.vercel.app/dashboard/teacher" style="color: #183153; font-weight: 600;">Teacher Dashboard</a>.</p>
      </div>
      <p style="text-align: center; color: #94A3B8; font-size: 12px; margin-top: 24px;">
        Classly Educator Network • Verified K-12 US Curriculum
      </p>
    </div>
  `;

  // First try sending to teacher email with from onboarding@resend.dev or configured email
  try {
    const from = 'Classly <onboarding@resend.dev>';
    const res = await client.emails.send({
      from,
      to: [params.to],
      subject: `New Lesson Booked: ${params.studentName} scheduled a ${params.subject} session!`,
      html: emailHtml,
    });

    if (res.error) {
      // If Resend test account restricts recipients to owner (nilayraj713@gmail.com), deliver notification to owner
      await client.emails.send({
        from: 'Classly <onboarding@resend.dev>',
        to: ['nilayraj713@gmail.com'],
        subject: `[Teacher Booking Alert] ${params.studentName} booked ${params.teacherName} (${params.subject})`,
        html: emailHtml,
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to send teacher booking notification email:', err);
    // Fallback attempt to primary verified email
    try {
      await client.emails.send({
        from: 'Classly <onboarding@resend.dev>',
        to: ['nilayraj713@gmail.com'],
        subject: `[Teacher Booking Alert] ${params.studentName} booked ${params.teacherName} (${params.subject})`,
        html: emailHtml,
      });
    } catch (_) {}
    return { success: false, error: err };
  }
}
