import { NextRequest, NextResponse } from 'next/server';
import { AnimeList } from '@/types';

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token provided' }, { status: 401 });
  }

  try {
    const response = await fetch(
      'https://api.myanimelist.net/v2/users/@me/animelist?limit=150&fields=list_status,num_episodes,mean,media_type,main_picture', 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `MyAnimeList API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: AnimeList = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching anime list from MAL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime list from MyAnimeList' },
      { status: 500 }
    );
  }
}