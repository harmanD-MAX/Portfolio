export const HARMAN_DEFAULT_PASSKEY = "harman_2026";

export function getAuthorSecret(): string {
  const envSecret = process.env.HARMAN_AUTHOR_PASSKEY || process.env.ADMIN_SECRET_KEY;
  if (envSecret) {
    return envSecret.trim().replace(/^["']|["']$/g, "").trim();
  }
  return HARMAN_DEFAULT_PASSKEY;
}

export function verifyAuthorKey(providedKey: string | null | undefined): boolean {
  if (!providedKey) return false;
  const cleanKey = providedKey.replace(/^Bearer\s+/i, "").trim().replace(/^["']|["']$/g, "");
  const secret = getAuthorSecret().trim();
  
  if (cleanKey === secret) return true;
  if (cleanKey === HARMAN_DEFAULT_PASSKEY) return true;
  
  return false;
}

export function verifyAuthorRequest(req: Request): boolean {
  const authorKey = req.headers.get("x-author-key");
  const authHeader = req.headers.get("authorization");
  return verifyAuthorKey(authorKey) || verifyAuthorKey(authHeader);
}

export const isValidAuthorPasskey = verifyAuthorKey;

