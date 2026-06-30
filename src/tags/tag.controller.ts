import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';
import { StringToNumberarrayPipePipe } from '../common/string-to-numberarray.pipe';
import { CreateTagDto, UpdateTagDto } from './tag.dto';
import { ApiBody } from '@nestjs/swagger';

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
  async createTag(@Body() body: CreateTagDto): Promise<Tag> {
    return await this.tagService.getOrCreateTag(body);
  }

  /**
   * Remove a Tag by its ID and cleans up the relations, if any.
   *
   * @param params - Parameter in the request path, here, /:id
   * @returns true if the Tag has successfully been removed, throws NOT_FOUND otherwise
   */
  @Delete(':id')
  async deleteTag(@Param() params: { id: number }): Promise<boolean> {
    const isDeleted = await this.tagService.removeTag(params.id);
    if (!isDeleted) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return true;
  }

  /**
   * Removes Tag[] by their IDs and cleans up the relations, if any.
   *
   * @param ids - A comma-separated list of IDs
   * @returns a message of how many Tag have been deleted and a number[] containing the IDs not deleted, if any
   */
  @Delete()
  async deleteTags(
    @Query('ids', StringToNumberarrayPipePipe) ids: number[],
  ): Promise<object> {
    const notDeleted: number[] = [];
    for (const tagId of ids) {
      const isDeleted = await this.tagService.removeTag(tagId);
      if (!isDeleted) {
        notDeleted.push(tagId);
      }
    }
    return {
      message: `Deleted ${ids.length - notDeleted.length} out of ${ids.length} tags`,
      ...(notDeleted.length > 0 ? { notDeleted } : {}),
    };
  }

  /**
   * Patches a Tag by its ID.
   *
   * @param params - The ID of the Tag to be patched
   * @param tagDto - The DTO containing the fields/values to be patched
   * @returns the newly modified Tag if it has been found & modified, throws NOT_FOUND otherwise
   */
  @ApiBody({ type: UpdateTagDto })
  @Patch(':id')
  async patchTagById(
    @Param() params: { id: number },
    @Body() tagDto: UpdateTagDto,
  ): Promise<Tag> {
    const tag = await this.tagService.updateTag(params.id, tagDto);
    if (!tag) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return tag;
  }
}
