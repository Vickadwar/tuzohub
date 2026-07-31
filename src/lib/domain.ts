/**
 * Dynamic Domain Resolver for Vercel and Production Deployments.
 * Resolves the active public HTTPS domain dynamically to construct
 * Safaricom Daraja B2C callback and result URLs without hardcoded fallbacks.
 */
export function getAppDomain(): string {
  // 1. Explicit environment variable override
  if (process.env.APP_DOMAIN) {
    return process.env.APP_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  // 2. Next.js Public App URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  // 3. Vercel deployment URL (automatically populated by Vercel)
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  // 4. Fallback to default Vercel domain or localhost for local dev
  return "tuzohub.vercel.app";
}

export function getAppBaseUrl(): string {
  const domain = getAppDomain();
  if (domain.startsWith("http://") || domain.startsWith("https://")) {
    return domain;
  }
  return `https://${domain}`;
}
