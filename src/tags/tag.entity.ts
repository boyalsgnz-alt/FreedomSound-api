import { Column, PrimaryGeneratedColumn, Entity, ManyToMany } from 'typeorm';
import { Track } from '../tracks/track.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Track, (track) => track.tags)
  tracks: Track[];
}
