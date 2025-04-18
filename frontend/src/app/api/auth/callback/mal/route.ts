// /app/api/auth/callback/mal/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract the callback parameters from the URL
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Redirect to the client-side page with the query parameters
  // This moves the processing to a client component where useSearchParams can be used
  return NextResponse.redirect(
    new URL(`/auth/callback/mal?code=${code}&state=${state}${error ? `&error=${error}` : ''}`, 
    request.url)
  );
}