import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Track } from '../tracks/track.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Track, (track) => track.artists)
  tracks: string;

  @Column({ type: 'boolean', default: true })
  user_vetted = false;
}
