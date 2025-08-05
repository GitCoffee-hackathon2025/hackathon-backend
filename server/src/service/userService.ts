import { UserRepository } from "../repositories/userRepositories";
import { ReviewEntity, UserEntity } from "../entities/userEntities";
import { ReportEntity } from "../entities/userEntities";
import { ReportDTO } from "../types/userTypes";
import { ReviewDTO } from "../types/userTypes";
import { ReportCommentEntity } from "../entities/userEntities";
import { ReportCommentDTO } from "../types/userTypes";
import { ReviewCommentEntity } from "../entities/userEntities";
import { ReviewCommentDTO } from "../types/userTypes";
export class UserService {
    private UserRepo: UserRepository;
    constructor() {
        this.UserRepo = new UserRepository()
    }

    async login(email: string, senha: string) {
        const user = await this.UserRepo.findByEmail(email);
        if (!user || user.password !== senha) {
            throw new Error("Credenciais inválidas");
        }

        return user;
    }

    async register(data: Partial<UserEntity>) {
        const user = new UserEntity();
        Object.assign(user, data);
        return this.UserRepo.saveUser(user);
    }

    async update(id: number, dataUser: Partial<UserEntity>) {
        const user = await this.UserRepo.updateUser(id, dataUser);
        if (!user) {
            throw new Error("Algo deu errado");
        }
        return user
    }

    async registerReport(id: number, dataReport: ReportDTO) {
        const user = await this.UserRepo.findUserById(id);
        const typeReportEntity = await this.UserRepo.findTypeReportById(id)
        if (!typeReportEntity) throw new Error("Tipo de relatório não encontrado");
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        const report = new ReportEntity();
        Object.assign(report, dataReport);
        report.type = typeReportEntity;
        report.user = user;
        return this.UserRepo.saveReport(report)
    }

    async registerReview(id: number, dataReview: ReviewDTO) {
        const user = await this.UserRepo.findUserById(id)
        const typeReviewEntity = await this.UserRepo.findTypeReviewById(id)
        if (!typeReviewEntity) throw new Error("Tipo de relatório não encontrado");
        if (!user) throw new Error("Usuário não encontrado");
        const review = new ReviewEntity();
        Object.assign(review, dataReview)
        review.type = typeReviewEntity;
        review.user = user;
        return this.UserRepo.saveReview(review)
    }

    async registerReportComment(userId: number, reportId: number, dataReportComment: ReportCommentDTO) {
        const user = await this.UserRepo.findUserById(userId);
        if (!user) throw new Error("Usuário não encontrado");

        const report = await this.UserRepo.findReportById(reportId);
        if (!report) throw new Error("Relatório não encontrado");

        const comment = new ReportCommentEntity();

        Object.assign(comment, {
        content_review_comment: dataReportComment.content_report_comment,
        user,
        report
        })
    

        return this.UserRepo.saveReportComment(comment);
    }

    async registerReviewComment(userId: number, reviewId: number, dataReviewComment: ReviewCommentDTO) {
        const user = await this.UserRepo.findUserById(userId);
        if (!user) throw new Error("Usuário não encontrado");

        const review = await this.UserRepo.findReviewById(reviewId);
        if (!review) throw new Error("Review não encontrada");

        const comment = new ReviewCommentEntity();
        
        Object.assign(comment, {
        content_review_comment: dataReviewComment.content_review_comment,
        user,
        review
        });

        return this.UserRepo.saveReviewComment(comment);
    }

}