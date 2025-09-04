import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';

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

  @Column({ type: 'varchar', length: 10 })
  cep!: string;

  @Column({ type: 'varchar', length: 20 })
  tel?: string;

  @OneToMany(() => ReportEntity, (report) => report.user)
  reports!: ReportEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews!: ReviewEntity[];

  @OneToMany(() => ReportCommentEntity, (comment) => comment.user)
  reportComments!: ReportCommentEntity[]; // nome tipo review até 100 chars

  @OneToMany(() => ReviewCommentEntity, (comment) => comment.user)
  reviewComments!: ReviewCommentEntity[];
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
  tokenType!: string; // e.g. 'EMAIL_VERIFICATION' | 'PASSWORD_RESET'

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'used', type: 'boolean', default: false })
  used!: boolean;

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt?: Date | null;
}