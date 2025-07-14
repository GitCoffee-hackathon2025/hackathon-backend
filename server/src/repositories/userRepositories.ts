import { AppDataSource } from "../db/migrations";
import { UserEntity } from "../models/userModels";


export class UserRepository{
    private repo = AppDataSource.getRepository(UserEntity);

    findByEmail(email : string) {
        return this.repo.findOneBy({ email })
    }
    saveUser(user : UserEntity){
        return this.repo.save(user)
    }
}