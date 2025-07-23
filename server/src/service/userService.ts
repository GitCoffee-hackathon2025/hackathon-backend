import { UserRepository } from "../repositories/userRepositories";
import { UserEntity } from "../entities/userEntities";

export class UserService{
    private userRepo: UserRepository;
    constructor(){
        this.userRepo = new UserRepository()
    }

    async login(email : string, senha : string) {
        const user = await this.userRepo.findByEmail(email);
         if (!user || user.password !== senha) { 
        throw new Error("Credenciais inválidas");
        }
        
        return user; 
    }

    async register(data: Partial<UserEntity>) {
        const user = new UserEntity();
        Object.assign(user, data);
        return this.userRepo.saveUser(user);
    }

    async update(id: number, dataUser : Partial<UserEntity>){
        const user = await this.userRepo.updateUser(id, dataUser);
        if(!user){
            throw new Error("Algo deu errado");
        }
        return user
    }
}