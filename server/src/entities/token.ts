import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import UserEntity from './UserEntity';

@Entity()
class TokenEntity {
  @PrimaryGeneratedColumn()
  id_token!: number;

  @ManyToOne(() => UserEntity, (user) => user.tokens)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @Column({ name: 'type_token', type: 'varchar', length: 10 })
  type!: string;

  @Column({ name: 'jit_token', type: 'char', length: 32 })
  jti!: string;

  @Column({ name: 'browser_token', type: 'varchar', length: 500 })
  browser!: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expires_at?: Date;
}

export default TokenEntity;
