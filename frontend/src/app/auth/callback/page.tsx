'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function MalCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);

  useEffect(() => {
    // Extract the authorization code from URL parameters
    const code = searchParams.get('code');
    // const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
    //   setError(`Authentication failed: ${errorParam}`);
    //   setLoading(false);
      return;
    }

    if (!code) {
    //   setError('No authorization code received from MyAnimeList');
    //   setLoading(false);
      return;
    }

    // In a production app, we would validate the state parameter here
    // against the one we stored before initiating the OAuth flow

    // Store the auth code in state
    setAuthCode(code);
    // setLoading(false);
  }, [searchParams]);

  const handleContinue = async () => {
    if (!authCode) return;

    // setLoading(true);
    
    try {
      // Exchange the code for an access token
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: authCode,
          // In a production app, retrieve the code verifier from session storage
          codeVerifier: localStorage.getItem('codeVerifier') || '',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to exchange code for token');
      }
      
      // Store the token in localStorage (in a real app, use a more secure method)
      localStorage.setItem('malAccessToken', data.accessToken);
      
      // Redirect to recommendations page
      router.push('/recommendations');
    } catch (err) {
      console.error('Token exchange error:', err);
    //   setError('Failed to complete authentication');
    //   setLoading(false);
    }
  };

  // The rest of the component remains the same
  
  // ... loading and error states ...

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-800 to-purple-800 text-white">
      <div className="max-w-md w-full bg-gray-900 bg-opacity-50 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-12 h-12">
            <Image src="/anime-logo.png" alt="Anime Recommender Logo" fill className="object-contain" />
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