import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { OccurrenceEntity } from './OccurrenceEntities';
import { UserSessionEntity } from './TokenEntities';

@Entity()
class UserEntity {
  @PrimaryGeneratedColumn()
  id_user!: number;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 150 })
  password!: string;

  @Column()
  dateBirth!: Date;

  @OneToMany(() => OccurrenceEntity, (occurrence) => occurrence.user)
  occurrences!: OccurrenceEntity[];

  @OneToMany(() => UserSessionEntity, (session) => session.user)
  sessions!: UserSessionEntity[];
}

export default UserEntity;
