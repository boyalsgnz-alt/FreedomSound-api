import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
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

  @ApiProperty({ type: [Track], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Track)
  tracks: Track[];
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}

export class ResponseTagDto {
  @Expose()
  name: string;

  @Expose()
  user_vetted: boolean;

  @Expose()
  @Type(() => Track)
  tracks: ResponseTrackDto[];
}
