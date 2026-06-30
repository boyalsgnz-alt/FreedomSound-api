import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ default: false })
  user_vetted: boolean;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @ApiProperty({ type: () => [Number], required: false })
  trackIds: number[];
}
