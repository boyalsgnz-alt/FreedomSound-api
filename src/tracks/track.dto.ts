import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Tag } from '../tags/tag.entity';
import { Artist } from '../artists/artist.entity';
import { TrackSource } from '../tracksources/tracksource.entity';

export class CreateTrackDto {
  @ApiProperty()
  fileName?: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  addedAt: Date;

  @ApiProperty()
  artists: Artist[];

  @ApiProperty()
  tags: Tag[];

  @ApiProperty()
  sources: TrackSource[];

  @ApiProperty()
  user_vetted: boolean;
}

export class UpdateTrackDto extends PartialType(CreateTrackDto) {}
