import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import UserEntity from './UserEntity';

@Entity()
class TokenEntity {
  @PrimaryGeneratedColumn()
  id_token!: number;

  // ✅ CORREÇÃO: A coluna foreign key na tabela Token
  // provavelmente se chama 'id_user' ou 'id_user_fk'
    @ManyToOne(() => UserEntity, (user) => user.tokens)
  @JoinColumn({ name: 'id_user' }) // ← Mantenha como id_user
  user!: UserEntity;

  @Column({ name: 'type_token', type: 'varchar', length: 10 })
  type!: string;

  @Column({ name: 'jit_token', type: 'char', length: 100 })
  jti!: string;

  @Column({ name: 'browser_token', type: 'varchar', length: 500 })
  browser!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expires_at!: Date;
}

export default TokenEntity;