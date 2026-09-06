import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PlaylistOptionsDto {
  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tags?: number[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  artists?: number[];

  @ApiProperty()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  matchAllTags?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  matchAllArtists?: boolean;

  @ApiProperty()
  @IsBoolean()
  onlyAvailableTracks: boolean;

  @ApiProperty()
  @IsString()
  playlistName: string;

  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiProperty()
  @IsBoolean()
  generateFile: boolean;
}
