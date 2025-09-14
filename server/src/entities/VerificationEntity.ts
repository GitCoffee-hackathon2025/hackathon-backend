import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import UserEntity from './UserEntity';

@Entity()
class TokenEntity {
  @PrimaryGeneratedColumn()
  id_verification!: number;

  @ManyToOne(() => UserEntity, (user) => user.tokens)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @Column({ name: 'type_verification', type: 'varchar', length: 10 })
  type!: string;

  @Column({ name: 'random_verification', type: 'char', length: 6 })
  random!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expires_at!: Date;
}

export default TokenEntity;
