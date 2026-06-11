// src/lib/verify-turnstile.ts
// Verifikasi token Turnstile di server (dipanggil dari auth.ts)

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // Jika secret tidak dikonfigurasi, skip verifikasi

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    })
    const data: { success: boolean; 'error-codes'?: string[] } = await res.json()

    if (!data.success) {
      console.warn('[Turnstile] Verifikasi gagal:', data['error-codes'])
    }
    return data.success
  } catch (e) {
    console.error('[Turnstile] Error verifikasi:', e)
    return false
  }
}
