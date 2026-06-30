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
import { Artist } from './artist.entity';
import { ArtistService } from './artist.service';
import { StringToNumberarrayPipePipe } from '../common/string-to-numberarray.pipe';
import { CreateArtistDto, UpdateArtistDto } from './artist.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  /**
   * Gets all Artist from the DB.
   *
   * @param limit - The limit to be returned
   * @param sort - Whether it should be sorted or first hits
   * @param search - Will search for any artist whose name has {search} in it
   * @returns The Artist[] found, empty array if none
   */
  @Get()
  async getAllArtists(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
    @Query('search') search: string | undefined,
  ): Promise<Artist[]> {
    return await this.artistService.getAllArtists(limit, sort, search);
  }

  /**
   * Gets an Artist by its ID from the DB.
   *
   * @param params - Parameter in the request path, here, /:id
   * @returns the found Artist or throws NOT_FOUND if not found
   */
  @ApiParam({
    type: 'string',
    name: 'id',
    required: true,
    description: 'ID of the Artist',
  })
  @Get(':id')
  async getArtistById(@Param() params: { id: number }): Promise<Artist> {
    const artist = await this.artistService.getById(params.id);
    if (!artist) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return artist;
  }

  /**
   * Creates an Artist of returns the existing Artist, if any
   *
   * @param artistDto - The Artist to be created
   *
   * @returns the found Artist or throws NOT_FOUND if not found.
   */
  @Post()
  async createArtist(@Body() artistDto: CreateArtistDto): Promise<Artist> {
    return await this.artistService.getOrCreateArtist(artistDto);
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
   * Patches an Artist by its ID.
   *
   * @param params - The ID of the Artist to be patched
   * @param artistDto - The DTO containing the fields/values to be patched
   * @returns the newly modified Tag if it has been found & modified, throws NOT_FOUND otherwise
   */
  @Patch(':id')
  async updateArtistById(
    @Param() params: { id: number },
    @Body() artistDto: UpdateArtistDto,
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
