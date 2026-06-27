import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * Gets a Tag by its ID from the DB.
   *
   * @param params - Parameter in the request path, here, /:id
   * @returns the found Tag or throws NOT_FOUND if not found.
   */
  @Get(':id')
  async getTagById(@Param() params: { id: number }): Promise<Tag> {
    const tag = await this.tagService.getById(params.id);
    if (!tag) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return tag;
  }

  /**
   * Gets all Tag from the DB.
   *
   * @param limit - The limit to be returned
   * @param sort - Whether it should be sorted or first hits
   * @returns The Tag[] found, empty array if none
   */
  @Get()
  async getAllTags(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
  ): Promise<Tag[]> {
    return await this.tagService.getAllTags(limit, sort);
  }

  /**
   * Creates a Tag entity and returns the newly created entity. If it exists, returns the entity found.
   * Always returns 201, which is not semantically correct, but it's for personal use.
   *
   * @param body - The partial (or full) entity to be created/retrieved
   * @returns The Tag created/retrieved
   */
  @Post()
  async createTag(@Body() body: Partial<Tag>): Promise<Tag> {
    return await this.tagService.getOrCreateTag(body);
  }

  /**
   * Remove a Tag by its ID and cleans up the relations, if any.
   *
   * @param params - Parameter in the request path, here, /:id
   * @returns true if the Tag has successfully been removed, throws NOT_FOUND if Tag was not found.
   */
  @Delete(':id')
  async deleteTag(@Param() params: { id: number }): Promise<boolean> {
    const isDeleted = await this.tagService.removeTag(params.id);
    if (!isDeleted) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return true;
  }
}
