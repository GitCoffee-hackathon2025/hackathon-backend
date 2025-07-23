import { DataSource } from "typeorm";
import { UserEntity, ReportEntity, ReviewEntity, TypeReportEntity, TypeReviewEntity, ReportCommentEntity, ReviewCommentEntity } from "../entities/userEntities"; // Ajuste o caminho conforme necessário

/* ============================

Na hora de fazer o deploy é nessário importar o dotenv neste arquivo, e PELO MENOS usar o process.env em `userName` e `password`

============================ */
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
