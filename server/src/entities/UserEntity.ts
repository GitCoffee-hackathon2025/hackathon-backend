import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import Token from './token';
import { OccurrenceEntity } from './OccurrenceEntities';
// import { UserSessionEntity } from './TokenEntities';

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

  @Column({ type: 'date', nullable: true })
  dateBirth?: Date | null;
  @OneToMany(() => OccurrenceEntity, (occurrence) => occurrence.user)
  occurrences!: OccurrenceEntity[];

  // @OneToMany(() => UserSessionEntity, (session) => session.user)
  // sessions!: UserSessionEntity[];

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  is_verified: boolean = false;

  @OneToMany(() => Token, (token) => token.user)
  tokens!: Token[];
}

export default UserEntity;
