import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { Artist } from './artist.entity';
import { ArtistService } from './artist.service';
import { StringToNumberarrayPipePipe } from '../common/string-to-numberarray.pipe';
import type { ArtistDto } from './artist.dto';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  /**
   * Gets all Artist from the DB.
   *
   * @param limit - The limit to be returned
   * @param sort - Whether it should be sorted or first hits
   * @returns The Artist[] found, empty array if none
   */
  @Get()
  async getAllArtists(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
  ): Promise<Artist[]> {
    return await this.artistService.getAllArtists(limit, sort);
  }

  /**
   * Gets an Artist by its ID from the DB.
   *
   * @param params - Parameter in the request path, here, /:id
   * @returns the found Artist or throws NOT_FOUND if not found.
   */
  @Get(':id')
  async getArtistById(@Param() params: { id: number }): Promise<Artist> {
    const artist = await this.artistService.getById(params.id);
    if (!artist) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return artist;
  }

  /**
   * Removes an Artist by its ID and cleans up the relations, if any.
   *
   * @param params - Parameter in the request path, here, /:id
   * @returns true if the Artist has successfully been removed, throws NOT_FOUND if Artist was not found.
   */
  @Delete(':id')
  async deleteArtistById(@Param() params: { id: number }): Promise<boolean> {
    const isDeleted = await this.artistService.deleteArtistById(params.id);
    if (!isDeleted) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return true;
  }

  /**
   * Removes Artist[] by their IDs and cleans up the relations, if any
   *
   * @param ids - The IDs of Artists to be removed
   * @returns a message of how many Artist have been deleted and a number[] containing the IDs not deleted, if any
   */
  @Delete()
  async deleteArtists(
    @Query('ids', StringToNumberarrayPipePipe) ids: number[],
  ): Promise<object> {
    const notDeleted: number[] = [];
    for (const artistId of ids) {
      const isDeleted = await this.artistService.deleteArtistById(artistId);
      if (!isDeleted) {
        notDeleted.push(artistId);
      }
    }
    return {
      message: `Deleted ${ids.length - notDeleted.length} out of ${ids.length} artists`,
      ...(notDeleted.length > 0 ? { notDeleted } : {}),
    };
  }

  /**
   * Patches a Artist by its ID.
   *
   * @param params - The ID of the Artist to be patched
   * @param artistDto - The DTO containing the fields/values to be patched
   * @returns the newly modified Tag if it has been found & modified, throws NOT_FOUND otherwise
   */
  @Patch(':id')
  async updateArtistById(
    @Param() params: { id: number },
    @Body() artistDto: ArtistDto,
  ): Promise<object> {
    const artist = await this.artistService.patchArtistById(
      params.id,
      artistDto,
    );
    if (!artist) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return artist;
  }
}
