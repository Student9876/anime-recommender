'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { generateCodeChallenge, generateStateValue } from "@/utils/auth";

export default function Login() {
  const [malAuthUrl, setMalAuthUrl] = useState("");
  
  useEffect(() => {
    // Taking parameters from environment variables
    const clientId = process.env.NEXT_PUBLIC_MAL_CLIENT_ID || "";
    const redirectUri = process.env.NEXT_PUBLIC_MAL_REDIRECT_URI || "http://localhost:3000/auth/callback";

    // Generate state and code challenge for PKCE
    const state = generateStateValue();
    const codeChallenge = generateCodeChallenge();

    const url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code_challenge=${codeChallenge}&code_challenge_method=plain`;
    
    setMalAuthUrl(url);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-800 to-purple-800 text-white">
      <div className="max-w-md w-full bg-gray-900 bg-opacity-50 rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center">
            <div className="relative w-12 h-12 mr-2">
              <Image src="/logo/sap-logo.png" alt="Anime Recommender Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold">Anime Recommender</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">Connect Your MyAnimeList Account</h1>

        <div className="space-y-6">
          <p className="text-center">To provide personalized anime recommendations, we need access to your MyAnimeList watching history.</p>

          <div className="bg-white bg-opacity-10 rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-3">What we access:</h2>
            <ul className="list-disc pl-5 space-y-1 opacity-90">
              <li>Your watched anime list</li>
              <li>Your anime ratings</li>
              <li>Basic profile information</li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <a
              href={malAuthUrl}
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300">
              <Image src="/icons/mal-icon.png" alt="MyAnimeList" width={24} height={24} className="mr-2" />
              Connect with MyAnimeList
            </a>

            <p className="text-xs mt-4 opacity-75 text-center">We don&apos;t store your MAL password and you can revoke access anytime.</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-300 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
