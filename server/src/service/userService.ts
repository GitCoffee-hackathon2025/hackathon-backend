import { UserRepository } from "../repositories/userRepositories";
import { UserEntity } from "../entities/userEntities";

export class UserService {
    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findByEmail(email);
        if (!user || user.password !== password) {
            throw new Error("Credenciais inválidas");
        }
        return user;
    }

    async register(data: Partial<UserEntity>) {
        const user = new UserEntity();
        Object.assign(user, data);
        return this.userRepo.save(user);
    }

    async update(id: number, dataUser: Partial<UserEntity>) {
        const user = await this.userRepo.update(id, dataUser);
        if (!user) {
            throw new Error("Algo deu errado");
        }
        return user;
    }

    async findById(id: number) {
        return this.userRepo.findById(id);
    }
}

