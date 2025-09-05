import { UserRepository } from '../repositories/userRepositories';
import { UserEntity } from '../entities/userEntities';
import { UpdateType, UserType } from '../types/userTypes';
import { CryptoUtil } from '../utils/crypto';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async login(email: string, password: string) {
    try {
      const user = await this.userRepo.findByEmail(email);
      let comparedPassword: boolean = false;

      if (user) {
        comparedPassword = await CryptoUtil.comparePassword(password, user.password);
      }

      return { user, comparedPassword };
    } catch (error) {
      throw error;
    }
  }

  async register(data: Partial<UserType>) {
    try {
      const user = new UserEntity();
      Object.assign(user, data);

      if (user.password) {
        user.password = await CryptoUtil.hashPassword(user.password);
      }

      await this.userRepo.save(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, dataUser: Partial<UserEntity>, type: UpdateType) {
    try {
      if (type == 'PASSWORD' && dataUser.password) {
        dataUser.password = await CryptoUtil.hashPassword(dataUser.password);
      }
      await this.userRepo.update(id, dataUser);

      const updatedUser = await this.findById(id);

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const user = await this.userRepo.findById(id);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findUser(email: string) {
    try {
      const user = await this.userRepo.findByEmail(email);

      return user;
    } catch (error) {
      throw error;
    }
  }
}
