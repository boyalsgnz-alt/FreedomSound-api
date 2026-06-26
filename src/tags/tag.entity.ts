import { Column, PrimaryGeneratedColumn, Entity, ManyToMany } from 'typeorm';
import { Track } from '../tracks/track.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '', unique: true })
  name: string;

  @ManyToMany(() => Track, (track) => track.tags)
  tracks: Track[];

  @Column({ type: 'boolean', default: true })
  user_vetted = false;
}
