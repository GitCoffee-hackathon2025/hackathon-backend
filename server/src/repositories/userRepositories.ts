import { AppDataSource } from '../db/data-source';
import UserEntity from '../entities/UserEntity';

class UserRepository {
  private repo = AppDataSource.getRepository(UserEntity);

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.repo.findOneBy({ email: email });
    return user;
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.repo.findOneBy({ id_user: id });
    return user;
  }

  async update(id: number, userData: Partial<UserEntity>): Promise<void> {
    await this.repo.update(id, userData);
  }

  async save(user: UserEntity): Promise<UserEntity | null> {
    return this.repo.save(user);
  }
}

const userRepository = new UserRepository();
export default userRepository;
