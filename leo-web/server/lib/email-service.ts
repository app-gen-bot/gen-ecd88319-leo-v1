/**
 * Email Service for Leo SaaS
 *
 * Sends notification emails when generations complete or fail.
 * Uses Supabase's built-in email functionality via Admin API.
 *
 * Configuration:
 * - EMAIL_NOTIFICATIONS_ENABLED: Set to 'true' to enable (default: disabled)
 * - Uses existing Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 */

import { createClient } from '@supabase/supabase-js';

// Lazy-initialize Supabase admin client
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Email Service] Missing Supabase credentials - email notifications disabled');
      return null;
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdmin;
}

/**
 * Check if email notifications are enabled
 */
export function isEmailEnabled(): boolean {
  return process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';
}

/**
 * Get user email from Supabase Auth by user ID
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  try {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) {
      console.warn(`[Email Service] Could not fetch user ${userId}: ${error?.message || 'Not found'}`);
      return null;
    }
    return data.user.email || null;
  } catch (error) {
    console.error('[Email Service] Error fetching user:', error);
    return null;
  }
}

export interface GenerationCompleteEmailData {
  appName: string;
  totalIterations: number;
  totalCost?: number;
  totalDuration?: number;
  githubUrl?: string;
  deploymentUrl?: string;
  generationId: number;
}

export interface GenerationFailedEmailData {
  appName: string;
  errorMessage: string;
  generationId: number;
}

/**
 * Send generation complete notification email
 *
 * Note: This uses console.log for now as Supabase doesn't have a direct email
 * sending API. For production, integrate with:
 * - Resend (https://resend.com) - Simple, developer-friendly
 * - SendGrid - Enterprise-grade
 * - Postmark - Transactional email specialist
 * - AWS SES - If already on AWS
 */
export async function sendGenerationCompleteEmail(
  userId: string,
  data: GenerationCompleteEmailData
): Promise<boolean> {
  if (!isEmailEnabled()) {
    console.log('[Email Service] Notifications disabled - skipping email');
    return false;
  }

  const email = await getUserEmail(userId);
  if (!email) {
    console.warn(`[Email Service] No email for user ${userId} - skipping notification`);
    return false;
  }

  // For now, log the email that would be sent
  // TODO: Integrate with actual email provider (Resend, SendGrid, etc.)
  const subject = `✅ Your app "${data.appName}" is ready!`;
  const costStr = data.totalCost ? `$${data.totalCost.toFixed(4)}` : 'N/A';
  const durationStr = data.totalDuration ? formatDuration(data.totalDuration) : 'N/A';

  console.log('\n[Email Service] 📧 NOTIFICATION EMAIL');
  console.log(`   To: ${email}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   ---`);
  console.log(`   App: ${data.appName}`);
  console.log(`   Iterations: ${data.totalIterations}`);
  console.log(`   Cost: ${costStr}`);
  console.log(`   Duration: ${durationStr}`);
  if (data.githubUrl) console.log(`   GitHub: ${data.githubUrl}`);
  if (data.deploymentUrl) console.log(`   Live URL: ${data.deploymentUrl}`);
  console.log(`   View: /apps/${data.generationId}`);
  console.log('   ---\n');

  // TODO: Replace with actual email sending
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Leo <noreply@leo.app>',
  //   to: email,
  //   subject,
  //   html: generateCompleteEmailHtml(data),
  // });

  return true;
}

/**
 * Send generation failed notification email
 */
export async function sendGenerationFailedEmail(
  userId: string,
  data: GenerationFailedEmailData
): Promise<boolean> {
  if (!isEmailEnabled()) {
    console.log('[Email Service] Notifications disabled - skipping email');
    return false;
  }

  const email = await getUserEmail(userId);
  if (!email) {
    console.warn(`[Email Service] No email for user ${userId} - skipping notification`);
    return false;
  }

  const subject = `❌ Generation failed for "${data.appName}"`;

  console.log('\n[Email Service] 📧 NOTIFICATION EMAIL');
  console.log(`   To: ${email}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   ---`);
  console.log(`   App: ${data.appName}`);
  console.log(`   Error: ${data.errorMessage}`);
  console.log(`   View: /apps/${data.generationId}`);
  console.log('   ---\n');

  // TODO: Replace with actual email sending

  return true;
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}
