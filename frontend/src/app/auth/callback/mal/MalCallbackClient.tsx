'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function MalCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [tokenSuccess, setTokenSuccess] = useState(false);

  useEffect(() => {
    // Extract the authorization code from URL parameters
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    console.log("Callback received with code:", code ? `${code.substring(0, 5)}...` : 'none');

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
      setError(`Invalid state parameter, possible security issue`);
      setLoading(false);
      return;
    }

    // Store the auth code in state
    setAuthCode(code);
    setLoading(false);
  }, [searchParams]);

  // Effect to handle navigation once token exchange is successful
  useEffect(() => {
    if (tokenSuccess) {
      console.log("Token exchange successful, redirecting to recommendations...");
      // Use a timeout to ensure the state updates complete first
      const redirectTimer = setTimeout(() => {
        router.push('/recommendations');
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [tokenSuccess, router]);

  const handleContinue = async () => {
    if (!authCode) return;

    setLoading(true);
    
    try {
      // Get the code verifier from localStorage
      const codeVerifier = localStorage.getItem('codeVerifier');
      
      if (!codeVerifier) {
        throw new Error('Code verifier not found, cannot complete authentication');
      }
      
      console.log("Exchanging code for token with verifier:", codeVerifier.substring(0, 5) + "...");
      
      // Exchange the code for an access token using our API route
      const tokenResponse = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: authCode,
          codeVerifier: codeVerifier,
        }),
      });
      
      // Check for non-JSON response
      const contentType = tokenResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await tokenResponse.text();
        console.error("Non-JSON response:", textResponse.substring(0, 200));
        throw new Error(`Server returned invalid response format`);
      }
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error("Token exchange error:", tokenData);
        throw new Error(tokenData.error || tokenData.message || 'Failed to exchange code for token');
      }
      
      // Store the tokens
      console.log("Token received successfully!");
      localStorage.setItem('malAccessToken', tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem('malRefreshToken', tokenData.refresh_token);
      }
      
      // Clean up the OAuth state and code verifier
      localStorage.removeItem('oauthState');
      localStorage.removeItem('codeVerifier');
      
      // Set success state to trigger the redirect
      setTokenSuccess(true);
      
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
          <p className="mb-2">Processing your authentication...</p>
          {tokenSuccess && <p className="text-green-300">Redirecting to your recommendations...</p>}
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

  if (tokenSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-800 to-purple-800 text-white">
        <div className="text-center">
          <div className="text-green-400 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Successfully Authenticated!</h1>
          <p className="mb-4">Redirecting to your recommendations...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
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
          <p>We&apos;ve successfully received authorization from your MAL account.</p>
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