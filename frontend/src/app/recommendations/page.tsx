'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile, AnimeList } from '@/types';

export default function Recommendations() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [animeList, setAnimeList] = useState<AnimeList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDataAndAnimeList = async () => {
      try {
        // Check if we have the access token
        const accessToken = localStorage.getItem('malAccessToken');
        if (!accessToken) {
          throw new Error('No access token found. Please log in again.');
        }

        // Fetch user profile through our proxy API
        const userResponse = await fetch('/api/mal/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setUserProfile(userData);

        // Fetch anime list through our proxy API
        const animeResponse = await fetch('/api/mal/anime-list', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!animeResponse.ok) {
          throw new Error(`Failed to fetch anime list: ${animeResponse.status}`);
        }

        const animeData = await animeResponse.json();
        setAnimeList(animeData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndAnimeList();
  }, []);

  // Display loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-xl">Loading your anime profile...</p>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
        <div className="max-w-md w-full bg-gray-900 bg-opacity-50 rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <Link href="/login" className="text-blue-400 hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // Group anime by status
  const groupedAnime = animeList?.data?.reduce((acc, item) => {
    const status = item.list_status.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(item);
    return acc;
  }, {} as Record<string, typeof animeList.data>) || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white pb-16">
      {/* Header with user info */}
      <header className="bg-gray-900 bg-opacity-50 py-6 mb-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="mr-4">
              {userProfile?.picture ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image 
                    src={userProfile.picture} 
                    alt={`${userProfile.name}'s profile`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl">{userProfile?.name?.charAt(0)}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userProfile?.name}'s Anime Profile</h1>
              <p className="text-gray-300">Joined: {userProfile?.joined_at && new Date(userProfile.joined_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        {/* Stats summary */}
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Anime Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-purple-900 bg-opacity-60 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{animeList?.data?.length || 0}</div>
              <div className="text-gray-300 text-sm">Total Anime</div>
            </div>
            <div className="bg-blue-900 bg-opacity-60 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{groupedAnime['watching']?.length || 0}</div>
              <div className="text-gray-300 text-sm">Watching</div>
            </div>
            <div className="bg-green-900 bg-opacity-60 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{groupedAnime['completed']?.length || 0}</div>
              <div className="text-gray-300 text-sm">Completed</div>
            </div>
            <div className="bg-yellow-900 bg-opacity-60 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{groupedAnime['on_hold']?.length || 0}</div>
              <div className="text-gray-300 text-sm">On Hold</div>
            </div>
            <div className="bg-red-900 bg-opacity-60 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{groupedAnime['dropped']?.length || 0}</div>
              <div className="text-gray-300 text-sm">Dropped</div>
            </div>
          </div>
        </div>

        {/* Anime lists by status */}
        <div className="space-y-10">
          {Object.entries(groupedAnime).map(([status, animes]) => (
            <section key={status} className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 capitalize">{status.replace('_', ' ')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {animes.map(anime => (
                  <div key={anime.node.id} className="bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                    <div className="relative h-48 w-full">
                      {anime.node.main_picture ? (
                        <Image 
                          src={anime.node.main_picture.medium} 
                          alt={anime.node.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-sm text-gray-400">No image</span>
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-black bg-opacity-70 px-2 py-1">
                        <span className="text-sm font-bold">{anime.list_status.score > 0 ? anime.list_status.score : '-'}</span>
                      </div>
                    </div>
                    <div className="p-3 flex-grow">
                      <h3 className="font-medium text-sm line-clamp-2" title={anime.node.title}>
                        {anime.node.title}
                      </h3>
                      <div className="mt-2 flex justify-between text-xs text-gray-300">
                        <span>{anime.node.media_type}</span>
                        <span>
                          {anime.list_status.num_episodes_watched}/{anime.node.num_episodes || '?'} eps
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        
        {/* Personalized recommendations section - placeholder */}
        <div className="mt-10 bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Your Personalized Recommendations</h2>
          <p className="text-gray-300 mb-4">
            Based on your watching history, we think you might enjoy these anime:
          </p>
          <div className="bg-gray-900 p-6 rounded-lg text-center">
            <p className="text-lg mb-4">We're analyzing your taste...</p>
            <Link 
              href="#" 
              className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Generate Recommendations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}