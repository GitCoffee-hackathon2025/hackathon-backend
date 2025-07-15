import { text } from "stream/consumers";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id_user!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    senha!: string;

    @Column()
    dateBirth!: Date;

    @Column()
    cep!: string;

    @Column()
    tel!: string;

    @Column({ type: "text" })
    comentario!: string;

    @OneToMany(() => ReportEntity, report => report.id_user_reports)
    reports!: ReportEntity[];
}

@Entity()
export class ReportEntity {
    @PrimaryGeneratedColumn()
    id_report!: number;

    @ManyToOne(() => UserEntity, user => user.reports)
    @JoinColumn({ name: "id_user" })
    id_user_reports!: UserEntity;

    @Column()
    id_state!: number;

    @Column()
    id_city!: number;

    @Column()
    id_neighborhood!: number;
    
    @Column({ type: "text"})
    text_report!: Text;
}
