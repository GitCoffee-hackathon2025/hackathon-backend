import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import UserEntity from './UserEntity';

@Entity()
export class OccurrenceEntity {
  @PrimaryGeneratedColumn()
  id_occurrence!: number;

  @ManyToOne(() => UserEntity, (user) => user.occurrences)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => TypeOccurrenceEntity, (type) => type.occurrences)
  @JoinColumn({ name: 'id_type_occurrence' })
  type!: TypeOccurrenceEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at!: Date;

  @Column({ type: 'text' })
  coordenadas!: string;

  @Column()
  id_state!: number;

  @Column()
  id_city!: number;

  @Column()
  id_neighborhood!: number;

  @Column({ type: 'text' })
  content_occurrence!: string;
}

@Entity()
export class TypeOccurrenceEntity {
  @PrimaryGeneratedColumn()
  id_type_occurrence!: number;

  @Column({ type: 'varchar', length: 100 })
  name_type_occurrence!: string;

  @OneToMany(() => OccurrenceEntity, (occurrence) => occurrence.type)
  occurrences!: OccurrenceEntity[];
}
