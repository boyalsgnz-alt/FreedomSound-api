import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Track } from '../tracks/track.entity';
import { Expose, Type } from 'class-transformer';
import { ResponseTrackDto } from '../tracks/track.dto';

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

export class UpdateArtistDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  user_vetted: false;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  trackIds: number[];
}

export class ResponseArtistDto {
  @Expose()
  name: string;

  @Expose()
  user_vetted: boolean;

  @Expose()
  @Type(() => Track)
  tracks: ResponseTrackDto[];
}
