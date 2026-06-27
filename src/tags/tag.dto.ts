import { Track } from '../tracks/track.entity';

export interface TagDto {
  name?: string;
  tracks?: Track[];
  user_vetted?: boolean;
}
