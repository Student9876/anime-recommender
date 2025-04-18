import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/types';

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token provided' }, { status: 401 });
  }

  try {
    const response = await fetch('https://api.myanimelist.net/v2/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `MyAnimeList API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: UserProfile = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user data from MAL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data from MyAnimeList' },
      { status: 500 }
    );
  }
}