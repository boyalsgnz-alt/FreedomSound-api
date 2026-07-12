import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Track } from '../tracks/track.entity';
import { ResponseTrackDto } from '../tracks/track.dto';

export class CreateTagDto {
  @ApiProperty()
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

export class UpdateTagDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  user_vetted: boolean;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tracks?: number[];
}

export class ResponseTagDto {
  @Expose()
  name: string;

  @Expose()
  user_vetted: boolean;

  @Expose()
  @Type(() => Track)
  tracks: ResponseTrackDto[];
}
