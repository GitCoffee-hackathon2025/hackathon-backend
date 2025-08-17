import { AppDataSource } from "../db/data-source";
import { UserEntity } from "../entities/userEntities";

export class UserRepository {
    private repo = AppDataSource.getRepository(UserEntity);

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.repo.findOneBy({ email });
    }

    async findById(id: number): Promise<UserEntity | null> {
        return this.repo.findOneBy({ id_user: id });
    }

    async update(id: number, userData: Partial<UserEntity>): Promise<UserEntity | null> {
        await this.repo.update(id, userData);
        return this.findById(id);
    }

    async save(user: UserEntity): Promise<UserEntity | null> {
        return this.repo.save(user);
    }
}