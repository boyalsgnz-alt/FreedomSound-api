import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './artist.entity';
import { ArtistController } from './artist.controller';
import { ArtistService } from './artist.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Artist])],
  controllers: [ArtistController],
  providers: [ConfigService, ArtistService],
})
export class ArtistModule {}
