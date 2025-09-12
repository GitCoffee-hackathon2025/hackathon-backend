import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class TypeOccurrenceEntity {
  @PrimaryGeneratedColumn()
  id_type_occurrence!: number;

  @Column({ type: 'varchar', length: 100 })
  name_type_occurrence!: string;

  @OneToMany(() => OccurrenceEntity, (occurrence) => occurrence.type)
  occurrences!: OccurrenceEntity[];
}

@Entity()
export class UserEntity {
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

  @Column({ type: 'text'})
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
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id_token!: number;

  @Column({ type: 'text' })
  content_review_comment!: string;
}

@Entity()
export class VerificationTokenEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id_token' })
  idToken!: number;

  @Column({ name: 'email_user', type: 'varchar', length: 255 })
  emailUser!: string;

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string;

  @Column({ name: 'token_type', type: 'varchar', length: 30 })
  tokenType!: string; // e.g. 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'CHANGE_EMAIL'

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'used', type: 'boolean', default: false })
  used!: boolean;

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt?: Date | null;

   @Column({ name: 'device_request_id', type: 'varchar', length: 36 })
  deviceRequestId!: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress!: string; 
  // suporta IPv4 e IPv6 (IPv6 pode ter até 45 caracteres)

  @Column({ name: 'user_agent', type: 'varchar', length: 255 })
  userAgent!: string;
}

@Entity()
export class UserSessionEntity {
    // UUID string gerado pelo servidor (crypto.randomUUID())
  @PrimaryColumn({ type: 'varchar', length: 128 })
  sessionId!: string;

  // FK para usuário (mantemos a coluna para consultas rápidas)
  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  // Relação ManyToOne (muitas sessões para 1 usuário)
  @ManyToOne(() => UserEntity, (user) => (user.sessions as any), {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  // Quando a sessão foi criada (timestamp automático)
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Último acesso / atualização — útil para timeout de inatividade
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  lastAccessed!: Date;

  // Expiração absoluta (opcional: null = sem expiração definida)
  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt?: Date;

  // Fingerprint do cliente (hash de user-agent + ip) — opcional, melhora segurança
  @Column({ type: 'varchar', length: 128, nullable: true })
  fingerprint?: string;

  // Controla invalidação manual/automática
  @Column({ type: 'boolean', default: true })
  active!: boolean;
}
