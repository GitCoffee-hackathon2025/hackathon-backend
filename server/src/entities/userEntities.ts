import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserEntity{
    @PrimaryGeneratedColumn()
    id!: number;

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
}