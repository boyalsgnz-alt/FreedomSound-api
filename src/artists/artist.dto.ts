import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
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
  user_vetted: boolean;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tracks?: number[];
}

export class UpdateArtistDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  user_vetted?: false;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tracks?: number[];
}

export class ResponseArtistDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  user_vetted: boolean;

  @Expose()
  @Type(() => Track)
  tracks: ResponseTrackDto[];
}
