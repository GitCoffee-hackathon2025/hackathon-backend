// import { ReviewRepository } from "../repositories/reviewsRepositories";
// import { UserRepository } from "../repositories/userRepositories";
// import { ReviewEntity } from "../entities/userEntities";
// import { ReviewDTO } from "../types/userTypes";

// export class ReviewService {
//     private reviewRepo: ReviewRepository;
//     private userRepo: UserRepository;

//     constructor() {
//         this.reviewRepo = new ReviewRepository();
//         this.userRepo = new UserRepository();
//     }

//     async registerReview(userId: number, dataReview: ReviewDTO) {
//         const user = await this.userRepo.findById(userId);
//         const typeReview = await this.reviewRepo.findTypeReviewById(dataReview.id_type_review);
        
//         if (!typeReview) throw new Error("Tipo de avaliação não encontrado");
//         if (!user) throw new Error("Usuário não encontrado");

//         const review = new ReviewEntity();
//         Object.assign(review, dataReview);
//         review.type = typeReview;
//         review.user = user;

//         return this.reviewRepo.saveReview(review);
//     }

//     async findReviewById(id: number) {
//         return this.reviewRepo.findReviewById(id);
//     }


//     async deleteReview(reviewId: number, userId: number): Promise<boolean> {
//         const review = await this.reviewRepo.findReviewById(reviewId);
        
//         if (!review) throw new Error("Review não encontrada");
//         if (review.user.id_user !== userId) {
//             throw new Error("Você não tem permissão para deletar esta review");
//         }

//         return this.reviewRepo.deleteReview(reviewId);
//     }
// }


