import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdminConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not configured.');
  }

  return { supabaseUrl, serviceRoleKey };
}

export function createAdminClient() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const configured = process.env.ADMIN_EMAILS || 'nilayraj713@gmail.com,milayraj713@gmail.com';
  const adminList = configured.toLowerCase().split(',').map(e => e.trim());
  return adminList.includes(clean);
}
