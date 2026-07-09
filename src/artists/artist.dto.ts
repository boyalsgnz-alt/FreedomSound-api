import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Track } from '../tracks/track.entity';
import { Expose, Type } from 'class-transformer';

export class CreateArtistDto {
  @ApiProperty({ required: true })
  @IsString()
  name: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  user_vetted: false;

  @ApiProperty({ type: [Track], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Track)
  tracks: Track[];
}

export class UpdateArtistDto extends PartialType(CreateArtistDto) {}

export class ResponseArtistDto {
  @Expose()
  name: string;

  @Expose()
  user_vetted: boolean;

  @Expose()
  @Type(() => TrackResponseDto)
  tracks: Track[];
}
