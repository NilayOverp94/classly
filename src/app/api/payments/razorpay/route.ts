import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, amount, currency = 'USD', teacherId } = body;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Platform calculation (backend enforced)
    const platformFeePercent = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT || '15');
    const platformFee = Math.round((amount * platformFeePercent) / 100 * 100) / 100;
    const teacherPayout = Math.round((amount - platformFee) * 100) / 100;

    // Simulated / Live Razorpay Order
    const order = {
      id: `order_${Math.random().toString(36).substring(2, 12)}`,
      entity: 'order',
      amount: Math.round(amount * 100), // in cents
      currency: currency,
      receipt: `rcpt_${bookingId}`,
      status: 'created',
      transfers: [
        {
          account: `acc_teacher_${teacherId}`,
          amount: Math.round(teacherPayout * 100),
          currency: currency,
        },
      ],
      created_at: Math.floor(Date.now() / 1000),
    };

    return NextResponse.json({
      success: true,
      order,
      keyId: keyId || 'rzp_test_placeholder',
      platformFee,
      teacherPayout,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}

