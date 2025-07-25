import { UserRepository } from "../repositories/userRepositories";
import { UserEntity } from "../entities/userEntities";
import { ReportEntity } from "../entities/userEntities";
import { ReportDTO } from "../types/userTypes";
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

    async registerReport(id: number, dataReport: ReportDTO) {
    const user = await this.userRepo.findUserById(id);
    const typeReportEntity = await this.userRepo.findReportById(id)
    if (!typeReportEntity) throw new Error("Tipo de relatório não encontrado");
    if (!user) {
    throw new Error("Usuário não encontrado");
    }
    const report = new ReportEntity();
    Object.assign(report, dataReport);
    report.type = typeReportEntity;
    report.user = user;
    return this.userRepo.saveReport(report)
}
}