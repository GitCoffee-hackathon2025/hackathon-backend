
import { UserType } from "@fastify/jwt";
import { AppDataSource } from "../db/data-source";
import { UserEntity } from "../entities/userEntities";
import { ReviewEntity } from "../entities/userEntities";

export class UserRepository{
    private userRepo = AppDataSource.getRepository(UserEntity);
    private reviewRepo = AppDataSource.getRepository(ReviewEntity);

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepo.findOneBy({ email });
    }

   async updateUser(id: number, userData: Partial<UserEntity>): Promise<UserEntity | null>  {
    await this.userRepo.update(id, userData);
    return this.userRepo.findOneBy({ id_user : id });
}


    async saveUser(user : UserEntity): Promise<UserEntity | null>{
        return this.userRepo.save(user);
    }

    async saveReview(review : ReviewEntity): Promise<ReviewEntity | null>{
        return this.reviewRepo.save(review);
    }
}