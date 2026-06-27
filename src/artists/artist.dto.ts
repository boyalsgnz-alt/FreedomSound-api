import { Track } from '../tracks/track.entity';

export interface ArtistDto {
  name?: string;
  tracks?: Track[];
  user_vetted?: false;
}
