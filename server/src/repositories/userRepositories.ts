import { AppDataSource } from "../db/data-source";
import { UserEntity } from "../entities/userEntities";


export class UserRepository{
    private repo = AppDataSource.getRepository(UserEntity);

    findByEmail(email : string) {
        return this.repo.findOneBy({ email })
    }
    saveUser(user : UserEntity){
        return this.repo.save(user)
    }
}