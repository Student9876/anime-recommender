// /app/api/auth/token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, codeVerifier } = body;
    
    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }
    
    const clientId = process.env.NEXT_PUBLIC_MAL_CLIENT_ID;
    const clientSecret = process.env.MAL_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_MAL_REDIRECT_URI;
    
    console.log("Attempting token exchange with:", {
      code: code.substring(0, 5) + "...",
      verifier: codeVerifier?.substring(0, 5) + "...",
      redirect: redirectUri
    });
    
    // Make request to MyAnimeList to exchange the code for an access token
    const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId || '',
        client_secret: clientSecret || '',
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri || '',
        code_verifier: codeVerifier || '',
      }).toString(),
    });
    
    // First check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, get the text response for debugging
      const textResponse = await response.text();
      console.error('Non-JSON response from token endpoint:', textResponse.substring(0, 200) + '...');
      return NextResponse.json(
        { 
          error: 'Invalid response type', 
          message: 'The authentication server returned an invalid response', 
          details: textResponse.substring(0, 100) + '...'
        },
        { status: 500 }
      );
    }
    
    const tokenData = await response.json();
    
    if (!response.ok) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.json(
        { 
          error: tokenData.error || 'Failed to exchange code for token',
          message: tokenData.message,
          hint: tokenData.hint
        },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    });
  } catch (error: unknown) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error during token exchange', message: error },
      { status: 500 }
    );
  }
}