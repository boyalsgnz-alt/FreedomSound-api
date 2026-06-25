import { PrimaryGeneratedColumn, Entity, ManyToOne, Column } from 'typeorm';
import { Track } from '../tracks/track.entity';

export enum Platform {
  LOCAL = 'local',
  SOUNDCLOUD = 'soundcloud',
}

@Entity()
export class TrackSource {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Track, (track) => track.sources)
  track: Track;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ nullable: true })
  externalId: string;

  @Column({ nullable: true })
  url: string;
}
