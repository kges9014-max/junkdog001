export type Item = {
  id: string;
  type: 'track' | 'movie';
  title: string;
  artist_or_director: string;
  year: number;
  genres: string[];
  moods: string[];
  poster_url: string;
  play_url: string;
}

export type Profile = {
  pills: string[];        // e.g. ['red', 'green']
  particles: string[];    // e.g. ['heavy_beat']
  decades: string[];      // e.g. ['80s', '90s']
}
