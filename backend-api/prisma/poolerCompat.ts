/**
 * Supabase's transaction pooler (PgBouncer) does not support prepared
 * statements the way Prisma expects unless `pgbouncer=true` is set on the
 * connection string. Without it, queries fail with errors like
 * "prepared statement s1 already exists" and API routes return 500.
 *
 * @see https://www.prisma.io/docs/guides/database/supabase
 */
export function supabasePoolerCompatUrl(raw: string | undefined): string {
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }
  const isSupabase = /supabase\.(co|com)/i.test(raw);
  let url = raw;

  if (/pooler\.supabase\.com/i.test(url) && !/[?&]pgbouncer=true/i.test(url)) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}pgbouncer=true`;
  }

  const sslSetting = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.toLowerCase();
  const allowInvalidCerts =
    sslSetting === "false" ||
    sslSetting === "0" ||
    (!sslSetting && process.env.NODE_ENV !== "production" && isSupabase);

  if (allowInvalidCerts) {
    if (/[?&]sslmode=/i.test(url)) {
      url = url.replace(/([?&]sslmode=)[^&]*/i, "$1no-verify");
    } else {
      const sep = url.includes("?") ? "&" : "?";
      url = `${url}${sep}sslmode=no-verify`;
    }
  }

  return url;
}
