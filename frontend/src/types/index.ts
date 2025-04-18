/**
 * User profile information from MyAnimeList
 */
export interface UserProfile {
  id: number;
  name: string;
  picture?: string;
  gender?: string;
  location?: string;
  joined_at?: string;
}

/**
 * Anime status information from user's list
 */
export interface AnimeStatus {
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  updated_at: string;
}

/**
 * Anime details information
 */
export interface AnimeDetails {
  id: number;
  title: string;
  main_picture?: {
    medium: string;
    large: string;
  };
  mean?: number;
  media_type?: string;
  num_episodes?: number;
  list_status?: AnimeStatus;
}

/**
 * User's anime list response structure
 */
export interface AnimeList {
  data: {
    node: AnimeDetails;
    list_status: AnimeStatus;
  }[];
  paging: {
    next?: string;
    previous?: string;
  };
}