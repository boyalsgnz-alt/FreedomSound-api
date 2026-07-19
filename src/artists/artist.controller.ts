import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ArtistService } from './artist.service';
import { StringToNumberArrayPipe } from '../common/string-to-numberarray.pipe';
import {
  CreateArtistDto,
  ResponseArtistDto,
  UpdateArtistDto,
} from './artist.dto';
import { ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';

@UseInterceptors(ResponseInterceptor)
@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  /**
   * Gets all Artist from the DB.
   *
   * @param limit - The limit to be returned
   * @param sort - Whether it should be sorted or first hits
   * @param user_vetted - a boolean to search if the user has verified the Artist
   * @param search - Will search for any artist whose name has {search} in it
   * @returns The Artist[] found, empty array if none
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllArtists(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
    @Query('user_vetted') user_vetted: string | undefined,
    @Query('search') search: string | undefined,
  ): Promise<ResponseArtistDto[]> {
    let userVettedBool = false;
    if (user_vetted && user_vetted === 'true') {
      userVettedBool = true;
    }
    const artists = await this.artistService.getAllArtists(
      limit,
      sort,
      search,
      userVettedBool,
    );
    return plainToInstance(ResponseArtistDto, artists);
  }

  @HttpCode(204)
  @ResponseMessage('Synchronization started')
  @Get('synchronize')
  async synchronizeArtists(): Promise<boolean> {
    return await this.artistService.synchronizeArtists();
  }

  /**
   * Removes Artist[] by their IDs and cleans up the relations, if any
   *
   * @param ids - The IDs of Artists to be removed
   * @returns a message of how many Artist have been deleted and a number[] containing the IDs not deleted, if any
   */
  @Delete()
  @HttpCode(200)
  async deleteArtists(
    @Query('ids', StringToNumberArrayPipe) ids: number[],
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
   * Creates an Artist of returns the existing Artist, if any
   *
   * @param artistDto - The Artist to be created
   *
   * @returns the found Artist or throws NOT_FOUND if not found.
   */
  @Post()
  @HttpCode(201)
  async createArtist(
    @Body() artistDto: CreateArtistDto,
  ): Promise<ResponseArtistDto> {
    const artist = await this.artistService.getOrCreateArtist(artistDto);
    return plainToInstance(ResponseArtistDto, artist);
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
  @HttpCode(HttpStatus.OK)
  async getArtistById(
    @Param() params: { id: number },
  ): Promise<ResponseArtistDto> {
    const artist = await this.artistService.getById(params.id);
    if (!artist) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(ResponseArtistDto, artist);
  }

  /**
   * Removes an Artist by its ID and cleans up the relations, if any.
   *
   * @param params - Parameter in the request path, here, /:id
   * @returns true if the Artist has successfully been removed, throws NOT_FOUND if Artist was not found.
   */
  @HttpCode(204)
  @Delete(':id')
  async deleteArtistById(@Param() params: { id: number }): Promise<void> {
    const isDeleted = await this.artistService.deleteArtistById(params.id);
    if (!isDeleted) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Patches an Artist by its ID.
   *
   * @param params - The ID of the Artist to be patched
   * @param artistDto - The DTO containing the fields/values to be patched
   * @returns the newly modified Tag if it has been found & modified, throws NOT_FOUND otherwise
   */
  @HttpCode(200)
  @ResponseMessage('Artist updated')
  @Patch(':id')
  async updateArtistById(
    @Param() params: { id: number },
    @Body() artistDto: UpdateArtistDto,
  ): Promise<object> {
    console.log('ISSOU');
    const artist = await this.artistService.patchArtistById(
      params.id,
      artistDto,
    );
    if (!artist) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return plainToInstance(ResponseArtistDto, artist);
  }

  /**
   * Decouples an entry that seems to be multiple artists. Creates all of them separately or retrieves them otherwise
   * This action destroys the artist entity passed as ID.
   * @param params - The Artist entity ID to be decoupled
   * @returns a boolean indicating if the entity has been decoupled properly. Throws 500 if not
   */
  @HttpCode(201)
  @ResponseMessage('Artist decoupled')
  @Post(':id/decouple')
  async decoupleArtists(@Param() params: { id: number }): Promise<boolean> {
    const artistDecoupled = await this.artistService.decoupleArtists(params.id);
    if (!artistDecoupled) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return artistDecoupled;
  }
}
