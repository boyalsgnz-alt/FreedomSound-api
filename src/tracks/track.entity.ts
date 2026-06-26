import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Artist } from '../artists/artist.entity';
import { Tag } from '../tags/tag.entity';
import { TrackSource } from '../tracksources/tracksource.entity';

@Entity()
export class Track {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  fileName?: string;

  @Column()
  title: string;

  @Column({ default: '' })
  hash?: string;

  @Column({ nullable: true })
  duration: number;

  @CreateDateColumn()
  addedAt: Date;

  @ManyToMany(() => Artist, (artist) => artist.tracks)
  @JoinTable({ name: 'track_artists' })
  artists: Artist[];

  @ManyToMany(() => Tag, (tag) => tag.tracks)
  @JoinTable({ name: 'track_tags' })
  tags: Tag[];

  @OneToMany(() => TrackSource, (source) => source.track)
  sources: TrackSource[];

  @Column({ type: 'boolean', default: true })
  user_vetted = false;
}
