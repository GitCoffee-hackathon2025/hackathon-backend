// import { AppDataSource } from "../db/data-source";
// import { ReportCommentEntity, ReviewCommentEntity } from "../entities/userEntities";

// export class CommentRepository {
//     private reportCommentRepo = AppDataSource.getRepository(ReportCommentEntity);
//     private reviewCommentRepo = AppDataSource.getRepository(ReviewCommentEntity);

//     async saveReportComment(comment: ReportCommentEntity): Promise<ReportCommentEntity | null> {
//         return this.reportCommentRepo.save(comment);
//     }

//     async saveReviewComment(comment: ReviewCommentEntity): Promise<ReviewCommentEntity | null> {
//         return this.reviewCommentRepo.save(comment);
//     }

//     async findReportCommentById(id: number): Promise<ReportCommentEntity | null> {
//         return this.reportCommentRepo.findOneBy({ id_report_comment: id });
//     }

//     async findReviewCommentById(id: number): Promise<ReviewCommentEntity | null> {
//         return this.reviewCommentRepo.findOneBy({ id_review_comment: id });
//     }
// }