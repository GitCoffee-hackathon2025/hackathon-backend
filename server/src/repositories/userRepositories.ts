import { AppDataSource } from "../db/data-source";
import { TypeReportEntity, UserEntity } from "../entities/userEntities";
import { ReviewEntity } from "../entities/userEntities";
import { ReportEntity } from "../entities/userEntities";
import { ReportType } from "../types/userTypes";


export class UserRepository{
    private userRepo = AppDataSource.getRepository(UserEntity);
    private reviewRepo = AppDataSource.getRepository(ReviewEntity);
    private reportRepo = AppDataSource.getRepository(ReportEntity);
    private typeReportRepo = AppDataSource.getRepository(TypeReportEntity);

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepo.findOneBy({ email });
    }

    async findUserById(id : number): Promise<UserEntity | null>{
        return this.userRepo.findOneBy({ id_user: id });
    }

    async findReportById(id : number): Promise<TypeReportEntity | null>{
        return this.typeReportRepo.findOneBy({ id_type_report : id  });
    }

   async updateUser(id: number, userData: Partial<UserEntity>): Promise<UserEntity | null>  {
    await this.userRepo.update(id, userData);
    return await this.findUserById(id)
}

    async saveReport(report : ReportEntity): Promise<ReportEntity | null>{
        return await this.reportRepo.save(report);
    }


    async saveUser(user : UserEntity): Promise<UserEntity | null>{
        return this.userRepo.save(user);
    }

    async saveReview(review : ReviewEntity): Promise<ReviewEntity | null>{
        return this.reviewRepo.save(review);
    }
}
