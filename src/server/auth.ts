export const HARMAN_DEFAULT_PASSKEY = "harman_2026";

export function getAuthorSecret(): string {
  return process.env.HARMAN_AUTHOR_PASSKEY || process.env.ADMIN_SECRET_KEY || HARMAN_DEFAULT_PASSKEY;
}

export function verifyAuthorKey(providedKey: string | null | undefined): boolean {
  if (!providedKey) return false;
  const cleanKey = providedKey.replace(/^Bearer\s+/i, "").trim();
  const secret = getAuthorSecret();
  return cleanKey === secret;
}

export function verifyAuthorRequest(req: Request): boolean {
  const authorKey = req.headers.get("x-author-key");
  const authHeader = req.headers.get("authorization");
  return verifyAuthorKey(authorKey) || verifyAuthorKey(authHeader);
}

export const isValidAuthorPasskey = verifyAuthorKey;
