import { AppDataSource } from '../db/data-source';
import { UserEntity } from '../entities/userEntities';

class UserRepository {
  private repo = AppDataSource.getRepository(UserEntity);

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.repo.findOneBy({ email: email });
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por email: ${String(error)}`);
    }
  }

  async findById(id: number): Promise<UserEntity | null> {
    try {
      const user = await this.repo.findOneBy({ id_user: id });
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por id: ${String(error)}`);
    }
  }

  async update(id: number, userData: Partial<UserEntity>): Promise<void> {
    try {
      await this.repo.update(id, userData);
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${String(error)}`);
    }
  }

  async save(user: UserEntity): Promise<void> {
    try {
      this.repo.save(user);
    } catch (error) {
      throw new Error(`Erro ao cadastrar usuário por email: ${String(error)}`);
    }
  }
}

export default UserRepository;
