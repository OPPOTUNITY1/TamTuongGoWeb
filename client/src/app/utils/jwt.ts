/** Parse role from .NET JWT.
 *  JwtSecurityTokenHandler maps ClaimTypes.Role → "role" (short form) by default.
 *  Fall back to the full URI in case DefaultOutboundClaimTypeMap was cleared.
 */
export function parseJwtRole(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["role"] ??
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      null
    );
  } catch {
    return null;
  }
}

/** Parse userId from .NET JWT.
 *  JwtSecurityTokenHandler maps ClaimTypes.NameIdentifier → "nameid" by default.
 */
export function parseJwtUserId(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["nameid"] ??
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
      null
    );
  } catch {
    return null;
  }
}
