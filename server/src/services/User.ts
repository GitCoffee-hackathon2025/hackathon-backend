// Tipagens
import { type UserValues, type UserRegisterValues } from '../templates/userTemplates';

// Configurações
import mailsConf from '../config/keys/mails.config';

// Retorno do erro
import FormatError from '../errors/FormatError';

// Banco
import userRepository from '../repositories/UserRepository';
import UserEntity from '../entities/UserEntity';
import mailService from './sub-services/MailService';

// Funções
import BcryptHashService from '../security/hashing/BcryptHashService';
import UserValidations from '../validations/UserValidations';
import userIsVerified from './utils/userIsVerified';

async function compareHashPassword(user: string, password: string) {
  await BcryptHashService.hash(password)
    .then(async (hash) => await BcryptHashService.compare(hash, user))
    .then((equal) => {
      if (!equal)
        throw new FormatError(401, 'Senha diferente', {
          inputErro: ['PASSWORD'],
        });
    });
}

class UserService {
  public async register(dataUser: UserRegisterValues): Promise<number> {
    UserValidations.validName(dataUser.name);
    UserValidations.validEmail(dataUser.email);

    if (await userRepository.findByEmail(dataUser.email))
      throw new FormatError(401, 'Este email ja esta em uso', {
        inputErro: ['EMAIL'],
      });

    UserValidations.validDateBirth(dataUser.dateBirth);
    UserValidations.validPassword(dataUser.password);
    UserValidations.comparePasswords(dataUser.password, dataUser.confirmPassword);

    const User = new UserEntity();
    Object.assign(User, {
      name: dataUser.name,
      email: dataUser.email,
      password: await BcryptHashService.hash(dataUser.password),
      dateBirth: dataUser.dateBirth,
    });

    const saved = await userRepository.save(User);
    if (!saved) throw new FormatError(500, 'Erro na hora de cadastrar, tente mais tarde');

    await mailService.sendMail('verification', { userId: saved['id_user'], email: saved.email });

    return saved['id_user'];
  }

  public async login({ email, password }: UserValues) {
    UserValidations.validEmail(email);

    const user = await userRepository.findByEmail(email);
    if (!user)
      throw new FormatError(401, 'Este email não existe', {
        inputErro: ['EMAIL'],
      });

    await userIsVerified(user);
    UserValidations.validPassword(password);

    await compareHashPassword(user.password, password);

    const { id_user: id, name, email: emailUser, dateBirth } = user;
    return { id, name, email: emailUser, dateBirth };
  }

  public async update(id: number, dataUser: Partial<Omit<UserValues, 'id_user' | 'is_verified'>>) {
    try {
      if (dataUser.password) {
      }
    } catch (error) {}
  }
}

//   async update(id: number, data: UpdateUserBody, type: UpdateType) {
//     try {
//       if (type == 'PASSWORD' && data.newPassword) {
//         (data as UpdateUserBodyWithPassword).password = await CryptoUtil.hashPassword(
//           data.newPassword
//         );
//       }

//       delete data.newPassword;
//       delete data.confirmPassword;

//       await this.userRepo.update(id, data);

//       const updatedUser = await this.findById(id);

//       return updatedUser;
//     } catch (error) {
//       throw error;
//     }
//   }

//   async findById(id: number) {
//     try {
//       const user = await this.userRepo.findById(id);

//       return user;
//     } catch (error) {
//       throw error;
//     }
//   }

//   async findByEmail(email: string) {
//     try {
//       const user = await this.userRepo.findByEmail(email);

//       return user;
//     } catch (error) {
//       throw error;
//     }
//   }
// }

const userService = new UserService();
export default userService;
