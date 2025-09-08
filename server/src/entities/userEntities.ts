import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToOne } from 'typeorm';

@Entity()
export class TypeReportEntity {
  @PrimaryGeneratedColumn()
  id_type_report!: number;

  @Column({ type: 'varchar', length: 100 })
  name_type_report!: string;

  @OneToMany(() => ReportEntity, (report) => report.type)
  reports!: ReportEntity[];
}

@Entity()
export class TypeReviewEntity {
  @PrimaryGeneratedColumn()
  id_type_review!: number;

  @Column({ type: 'varchar', length: 100 })
  name_type_review!: string;

  @OneToMany(() => ReviewEntity, (review) => review.type)
  reviews!: ReviewEntity[];
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

  @OneToMany(() => ReportEntity, (report) => report.user)
  reports!: ReportEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews!: ReviewEntity[];

  @OneToMany(() => ReportCommentEntity, (comment) => comment.user)
  reportComments!: ReportCommentEntity[]; // nome tipo review até 100 chars

  @OneToMany(() => ReviewCommentEntity, (comment) => comment.user)
  reviewComments!: ReviewCommentEntity[];

  @OneToMany(() => UserSessionEntity, (session) => session.user)
  sessions!: UserSessionEntity[];
}

@Entity()
export class ReportEntity {
  @PrimaryGeneratedColumn()
  id_report!: number;

  @ManyToOne(() => UserEntity, (user) => user.reports)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => TypeReportEntity, (type) => type.reports)
  @JoinColumn({ name: 'id_type_report' })
  type!: TypeReportEntity;

  @Column()
  id_state!: number;

  @Column()
  id_city!: number;

  @Column()
  id_neighborhood!: number;

  @Column({ type: 'text' })
  content_report!: string;

  @OneToMany(() => ReportCommentEntity, (comment) => comment.report)
  comments!: ReportCommentEntity[];
}

@Entity()
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id_review!: number;

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => TypeReviewEntity, (typeReview) => typeReview.reviews)
  @JoinColumn({ name: 'id_type_review' })
  type!: TypeReviewEntity;

  @Column()
  id_state!: number;

  @Column()
  id_city!: number;

  @Column()
  id_neighborhood!: number;

  @Column({ type: 'text' })
  content_review!: string;

  @OneToMany(() => ReviewCommentEntity, (comment) => comment.review)
  comments!: ReviewCommentEntity[];
}

@Entity()
export class ReportCommentEntity {
  @PrimaryGeneratedColumn()
  id_report_comment!: number;

  @Column({ type: 'text' })
  content_report_comment!: string;

  @ManyToOne(() => UserEntity, (user) => user.reportComments)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => ReportEntity, (report) => report.comments)
  @JoinColumn({ name: 'id_report' })
  report!: ReportEntity;
}

@Entity()
export class ReviewCommentEntity {
  @PrimaryGeneratedColumn()
  id_review_comment!: number;

  @Column({ type: 'text' })
  content_review_comment!: string;

  @ManyToOne(() => UserEntity, (user) => user.reviewComments)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => ReviewEntity, (review) => review.comments)
  @JoinColumn({ name: 'id_review' })
  review!: ReviewEntity;
}

@Entity()
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id_token!: number;

  @Column({ type: 'text' })
  content_review_comment!: string;

  @ManyToOne(() => UserEntity, (user) => user.reviewComments)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => ReviewEntity, (review) => review.comments)
  @JoinColumn({ name: 'id_review' })
  review!: ReviewEntity;
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
