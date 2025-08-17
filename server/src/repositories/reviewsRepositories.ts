import { AppDataSource } from "../db/data-source";
import { ReviewEntity, TypeReviewEntity, ReviewCommentEntity } from "../entities/userEntities";

export class ReviewRepository {
    private reviewRepo = AppDataSource.getRepository(ReviewEntity);
    private typeReviewRepo = AppDataSource.getRepository(TypeReviewEntity);
    private reviewCommentRepo = AppDataSource.getRepository(ReviewCommentEntity);

    async findTypeReviewById(id: number): Promise<TypeReviewEntity | null> {
        return this.typeReviewRepo.findOneBy({ id_type_review: id });
    }

    async saveReview(review: ReviewEntity): Promise<ReviewEntity | null> {
        return this.reviewRepo.save(review);
    }

     async findReviewById(id: number): Promise<ReviewEntity | null> {
        return this.reviewRepo.findOneBy({ id_review: id });
    }

        async deleteReview(id: number): Promise<boolean> {
      
        await this.reviewCommentRepo.delete({ review: { id_review: id } });
        
        const result: any = await this.reviewRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }

}