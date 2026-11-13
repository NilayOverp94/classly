import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'support@classly.com';

export const resend = new Resend(resendApiKey);

export async function sendBookingConfirmationEmail(params: {
  to: string;
  studentName: string;
  teacherName: string;
  subject: string;
  startTime: string;
  meetingUrl: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Classly <${resendFromEmail}>`,
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
  try {
    const isApproved = params.status === 'approved';
    const isReceived = params.status === 'received';
    const subject = isApproved 
      ? 'Congratulations! Your Classly Tutor Application is Approved' 
      : isReceived 
      ? 'Classly Tutor Application Received — Under Review' 
      : 'Update on your Classly Tutor Application';

    const { data, error } = await resend.emails.send({
      from: `Classly <${resendFromEmail}>`,
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
                   <p>You can now set your availability, publish group classes, and start accepting students from the United States.</p>
                   <div style="text-align: center; margin: 28px 0;">
                     <a href="http://localhost:3000/dashboard/teacher" style="background-color: #45A879; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                       Open Teacher Dashboard
                     </a>
                   </div>`
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

