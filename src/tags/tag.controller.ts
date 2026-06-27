import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get(':id')
  async getTagById(@Param() params: any): Promise<Tag> {
    const tag = await this.tagService.getById(params.id);
    if (!tag) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return tag;
  }

  @Get()
  async getAllTags(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
  ): Promise<Tag[]> {
    return await this.tagService.getAllTags(limit, sort);
  }
}
