import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ default: false })
  user_vetted: false;
}

export class UpdateArtistDto extends PartialType(CreateArtistDto) {
  @ApiProperty({ type: () => [Number], required: false })
  trackIds: number[];
}
