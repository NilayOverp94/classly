import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzb294ZGVwZmFtbnVmd2dsb3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDU5MTQ1MSwiZXhwIjoyMTEwMTY3NDUxfQ.0Tgs5rBFTtsAoFjEqlzLxSbJMJ3IXv3Xiol3G78zobo';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let userId: string = '';
    let fileBuffer: Buffer | null = null;
    let mimeType = 'image/png';
    let fileExt = 'png';
    let isRemoveAction = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      userId = (formData.get('userId') as string) || '';
      const action = formData.get('action') as string;
      if (action === 'remove') {
        isRemoveAction = true;
      } else {
        const file = formData.get('file') as File;
        if (!file) {
          return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
        }

        mimeType = file.type || 'image/png';
        if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(mimeType)) {
          return NextResponse.json({ error: 'Invalid file format. Please upload JPG, PNG, or WebP.' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'Image exceeds maximum size limit of 5MB.' }, { status: 400 });
        }

        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') fileExt = 'jpg';
        else if (mimeType === 'image/webp') fileExt = 'webp';
        else if (mimeType === 'image/gif') fileExt = 'gif';
        else fileExt = 'png';

        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      // JSON payload
      const json = await request.json();
      userId = json.userId || '';
      if (json.action === 'remove') {
        isRemoveAction = true;
      } else if (json.dataUrl) {
        // Base64 data URL: data:image/png;base64,xxxx
        const matches = json.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return NextResponse.json({ error: 'Invalid base64 image data.' }, { status: 400 });
        }
        mimeType = matches[1];
        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') fileExt = 'jpg';
        else if (mimeType === 'image/webp') fileExt = 'webp';
        else fileExt = 'png';
        fileBuffer = Buffer.from(matches[2], 'base64');
      } else {
        return NextResponse.json({ error: 'Missing image payload.' }, { status: 400 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // 1. Fetch current user metadata
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const userData = await userRes.json();
    const currentMeta = userData.user_metadata || {};

    // Handle Remove Action
    if (isRemoveAction) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_metadata: {
            ...currentMeta,
            avatar_url: null,
            picture: null,
          },
        }),
      });

      // Update public.profiles
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ avatar_url: null }),
      });

      return NextResponse.json({ success: true, avatarUrl: null });
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'No file buffer available for upload.' }, { status: 400 });
    }

    // 2. Upload file to Supabase Storage avatars bucket
    const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
    const storageUrl = `${SUPABASE_URL}/storage/v1/object/avatars/${fileName}`;

    const uploadRes = await fetch(storageUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: fileBuffer as any,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Storage upload failure:', errText);
      return NextResponse.json({ error: 'Failed to upload photo to storage.', details: errText }, { status: 500 });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;

    // 3. Update Supabase Auth user_metadata
    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_metadata: {
          ...currentMeta,
          avatar_url: publicUrl,
          picture: publicUrl,
        },
      }),
    });

    if (!updateRes.ok) {
      console.error('Failed to update auth user_metadata:', await updateRes.text());
    }

    // 4. Update public.profiles table
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ avatar_url: publicUrl }),
    });

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
      message: 'Profile picture successfully uploaded.',
    });

  } catch (err: any) {
    console.error('Avatar upload exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
