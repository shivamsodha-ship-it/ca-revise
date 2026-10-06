// Request helpers shared by the API routes.

// Cross-site forms can only send form-encoded or plain text bodies without a CORS preflight, so requiring
// JSON on every write blocks cross-site request forgery without a token.
export function isJsonWrite(req: Request): boolean {
  return (req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json');
}

export function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
}

export async function readJson(req: Request, maxChars: number): Promise<{ ok: true; body: any } | { ok: false; status: number }> {
  const text = await req.text();
  if (text.length > maxChars) return { ok: false, status: 413 };
  try { return { ok: true, body: JSON.parse(text) }; } catch { return { ok: false, status: 400 }; }
}
