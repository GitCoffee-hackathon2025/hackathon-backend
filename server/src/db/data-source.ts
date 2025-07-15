import { DataSource } from "typeorm";
import { UserEntity, ReportEntity, ReviewEntity, TypeReportEntity, TypeReviewEntity, ReportCommentEntity, ReviewCommentEntity } from "../entities/userEntities"; // Ajuste o caminho conforme necessário

export const AppDataSource = new DataSource({
    type: "mysql", 
    host: "localhost",
    port: 3306,
    username: "aluno",
    password: "aluno",
    database: "hackathon",
    synchronize: true, 
    logging: true,
    entities: [
        UserEntity,
        ReportEntity,
        ReviewEntity,
        TypeReportEntity,
        TypeReviewEntity,
        ReportCommentEntity,
        ReviewCommentEntity
    ],
    migrations: [], 
    subscribers: [],
});