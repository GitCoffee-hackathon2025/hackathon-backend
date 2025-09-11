import { UserRepository } from '../repositories/userRepositories';
import { UpdateType, CreateUserDTO, UpdateUserBody, UpdateUserBodyWithPassword } from '../types/userTypes';
import { UserEntity } from '../entities/userEntities';
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

  async register(data: CreateUserDTO) {
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

  async update(id: number, data: UpdateUserBody, type: UpdateType) {
    try {
      if (type == 'PASSWORD' && data.newPassword) {
        (data as UpdateUserBodyWithPassword).password = await CryptoUtil.hashPassword(data.newPassword);
      }

      delete data.newPassword;
      delete data.confirmPassword;
      
      await this.userRepo.update(id, data);

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

  async findByEmail(email: string) {
    try {
      const user = await this.userRepo.findByEmail(email);

      return user;
    } catch (error) {
      throw error;
    }
  }
}
