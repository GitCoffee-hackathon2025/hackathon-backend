import { UserRepository } from "../repositories/userRepositories";
import { UserEntity } from "../models/userModels";

export class UserService{
    private userRepo: UserRepository;
    constructor(){
        this.userRepo = new UserRepository()
    }

    async login(email : string, senha : string) {
        const user = await this.userRepo.findByEmail(email);
         if (!user || user.senha !== senha) {
        throw new Error("Credenciais inválidas");
        }
        return user; 
    }
    async register(data: Partial<UserEntity>) {
        const user = new UserEntity();
        Object.assign(user, data);
        return this.userRepo.saveUser(user);
    }
}