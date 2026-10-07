import type { Context } from '@netlify/edge-functions';

export default async (_request: Request, context: Context) => {
  const response = await context.next();
  const country = context.geo?.country?.code;
  if (country && /^[A-Z]{2}$/.test(country)) {
    response.headers.append('Set-Cookie', `owr_geo=${country}; Path=/; Max-Age=86400; SameSite=Lax; Secure`);
  }
  return response;
};

export const config = { path: '/' };
