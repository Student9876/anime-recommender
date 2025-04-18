'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function MalCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);

  useEffect(() => {
    // Extract the authorization code from URL parameters
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      setLoading(false);
      return;
    }

    if (!code) {
      setError('No authorization code received from MyAnimeList');
      setLoading(false);
      return;
    }

    // Validate state parameter
    const storedState = localStorage.getItem('oauthState');
    if (state !== storedState) {
      setError('Invalid state parameter, possible security issue');
      setLoading(false);
      return;
    }

    // Store the auth code in state
    setAuthCode(code);
    setLoading(false);
  }, [searchParams]);

  const handleContinue = async () => {
    if (!authCode) return;

    setLoading(true);
    
    try {
      // Get the code verifier from localStorage
      const codeVerifier = localStorage.getItem('codeVerifier');
      
      if (!codeVerifier) {
        throw new Error('Code verifier not found, cannot complete authentication');
      }
      
      const clientId = process.env.NEXT_PUBLIC_MAL_CLIENT_ID;
      const clientSecret = process.env.NEXT_PUBLIC_MAL_CLIENT_SECRET || '';
      const redirectUri = process.env.NEXT_PUBLIC_MAL_REDIRECT_URI;
      
      // Exchange the code for an access token
      const tokenResponse = await fetch('https://myanimelist.net/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId || '',
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: redirectUri || '',
          code_verifier: codeVerifier,
        }).toString(),
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokenData);
        throw new Error(tokenData.error || 'Failed to exchange code for token');
      }
      
      // Store the tokens
      localStorage.setItem('malAccessToken', tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem('malRefreshToken', tokenData.refresh_token);
      }
      
      // Clean up the OAuth state and code verifier
      localStorage.removeItem('oauthState');
      localStorage.removeItem('codeVerifier');
      
      // Redirect to recommendations page
      router.push('/recommendations');
    } catch (err) {
      console.error('Token exchange error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete authentication');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-800 to-purple-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Processing your authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-800 to-purple-800 text-white">
        <div className="max-w-md w-full bg-gray-900 bg-opacity-50 rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="mb-6">{error}</p>
          <Link href="/login" className="text-blue-400 hover:underline">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-800 to-purple-800 text-white">
      <div className="max-w-md w-full bg-gray-900 bg-opacity-50 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-12 h-12">
            <Image src="/logo/sap-logo.png" alt="Anime Recommender Logo" fill className="object-contain" />
          </div>
        </div>
        
        <div className="mb-8">
          <div className="text-green-400 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">MyAnimeList Connected!</h1>
          <p>We&apos;ve successfully connected to your MAL account.</p>
        </div>
        
        <button
          onClick={handleContinue}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-md transition duration-300"
        >
          Continue to Recommendations
        </button>
        
        <p className="text-sm mt-6 opacity-80">
          We&apos;ll analyze your anime preferences and provide personalized recommendations
        </p>
      </div>
    </div>
  );
}