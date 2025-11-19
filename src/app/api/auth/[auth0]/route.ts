import { handleAuth } from '@auth0/nextjs-auth0';

const handler = handleAuth();

export async function GET(request: Request, { params }: { params: Promise<{ auth0: string[] }> }) {
  await params; // Await the params to satisfy Next.js 16+
  return handler(request, { params: await params });
}
