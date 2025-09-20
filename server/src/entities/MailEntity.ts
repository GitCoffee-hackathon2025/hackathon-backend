import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import UserEntity from './UserEntity';

@Entity()
class MailEntity {
  @PrimaryGeneratedColumn()
  id_mail!: number;

  @ManyToOne(() => UserEntity, (user) => user.tokens)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @Column({ name: 'type_mail', type: 'varchar', length: 30 })
  type!: string;

  @Column({ name: 'random_mail', type: 'varchar', length: 100 })
  random!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expires_at!: Date;
}

export default MailEntity;
