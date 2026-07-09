import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../tags/tag.entity';
import { Artist } from '../artists/artist.entity';
import { TrackSource } from '../tracksources/tracksource.entity';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ResponseArtistDto } from '../artists/artist.dto';
import { ResponseTagDto } from '../tags/tag.dto';

export class CreateTrackDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Artist)
  artists: Artist[];

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Tag)
  tags: Tag[];

  @ApiProperty()
  sources: TrackSource[];

  @ApiProperty()
  @IsOptional()
  user_vetted?: boolean;
}

export class UpdateTrackDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ type: [Artist], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Artist)
  artists?: Artist[];

  @ApiProperty({ type: [Tag], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Tag)
  tags?: Tag[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  user_vetted: boolean;
}

export class ResponseTrackDto {
  @Expose()
  id: number;

  @Expose()
  fileName?: string;

  @Expose()
  duration: number;

  @Expose()
  addedAt: Date;

  @Expose()
  @Type(() => Artist)
  artist: ResponseArtistDto[];

  @Expose()
  @Type(() => Tag)
  tags: ResponseTagDto[];

  @Expose()
  @Type(() => TrackSource)
  sources: TrackSource[];

  @Expose()
  user_vetted: boolean;
}
