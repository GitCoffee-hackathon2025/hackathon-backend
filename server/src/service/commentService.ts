import { CommentRepository } from "../repositories/commentsRepositories";
import { UserRepository } from "../repositories/userRepositories";
import { ReportRepository } from "../repositories/reportsRepositories";
import { ReviewRepository } from "../repositories/reviewsRepositories";
import { ReportCommentEntity, ReviewCommentEntity } from "../entities/userEntities";
import { ReportCommentDTO, ReviewCommentDTO } from "../types/userTypes";

export class CommentService {
    private commentRepo: CommentRepository;
    private userRepo: UserRepository;
    private reportRepo: ReportRepository;
    private reviewRepo: ReviewRepository;

    constructor() {
        this.commentRepo = new CommentRepository();
        this.userRepo = new UserRepository();
        this.reportRepo = new ReportRepository();
        this.reviewRepo = new ReviewRepository();
    }

    async registerReportComment(userId: number, reportId: number, data: ReportCommentDTO) {
        const user = await this.userRepo.findById(userId);
        const report = await this.reportRepo.findReportById(reportId);
        
        if (!user) throw new Error("Usuário não encontrado");
        if (!report) throw new Error("Relatório não encontrado");

        const comment = new ReportCommentEntity();
        Object.assign(comment, {
            content_report_comment: data.content_report_comment,
            user,
            report
        });

        return this.commentRepo.saveReportComment(comment);
    }

    async registerReviewComment(userId: number, reviewId: number, data: ReviewCommentDTO) {
        const user = await this.userRepo.findById(userId);
        const review = await this.reviewRepo.findReviewById(reviewId);
        
        if (!user) throw new Error("Usuário não encontrado");
        if (!review) throw new Error("Avaliação não encontrada");

        const comment = new ReviewCommentEntity();
        Object.assign(comment, {
            content_review_comment: data.content_review_comment,
            user,
            review
        });

        return this.commentRepo.saveReviewComment(comment);
    }
}