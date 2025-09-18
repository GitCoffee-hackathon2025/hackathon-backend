// Tipagens
import {
  type UserValues,
  type UserRegisterValues,
  type PartialUserRegisterValues,
} from '../templates/userTemplates';


// Retorno do erro
import FormatError from '../errors/FormatError';


// Banco
import userRepository from '../repositories/UserRepository';
import UserEntity from '../entities/UserEntity';
import mailService from './sub-services/MailService';
import authService from './AuthService';


// Funções
import BcryptHashService from '../security/hashing/BcryptHashService';
import UserValidations from '../validations/UserValidations';
import userIsVerified from './utils/userIsVerified';


// ✅ CÓDIGO CORRIGIDO:
async function compareHashPassword(hashedPassword: string, plainPassword: string) {
  const isMatch = await BcryptHashService.compare(plainPassword, hashedPassword);
  
  if (!isMatch) {
    throw new FormatError(401, 'Senha incorreta', {
      inputErro: ['PASSWORD'],
    });
  }
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


  public async login({ email, password }: Pick<UserValues, 'email' | 'password'>) {
    UserValidations.validEmail(email);


    const user = await userRepository.findByEmail(email);
    if (!user)
      throw new FormatError(404, 'Este email não existe', {
        inputErro: ['EMAIL'],
      });



    await compareHashPassword(user.password, password);


    const { id_user: id, name, email: emailUser, dateBirth } = user;
    return { id, name, email: emailUser, dateBirth };
  }


  public async getUser(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new FormatError(404, 'Usuário não encontrado');
    return { name: user.name, email: user.email, dateBirth: user.dateBirth };
  }


  public async sendCodeToChange(userId: number, type: 'password' | 'email') {
    const user = await userRepository.findById(userId);
    if (!user) throw new FormatError(404, 'Essa conta não existe');
    userIsVerified(user);


    await mailService.sendMail(type, { userId, email: user.email });
  }


  public async update(
    userId: number,
    dataUser: PartialUserRegisterValues,
    randomReceived?: number
  ) {
    const user = await userRepository.findById(userId);
    if (!user) throw new FormatError(404, 'Essa conta não existe');
    userIsVerified(user);


    try {
      if (randomReceived) {
        if (dataUser.password) {
          await mailService.checkEmail('password', userId, randomReceived);
          UserValidations.validPassword(dataUser.password);
          UserValidations.comparePasswords(dataUser.password, dataUser.confirmPassword!);


          const hashPassword = await BcryptHashService.hash(dataUser.password);
          await userRepository.update(userId, { password: hashPassword });
        } else if (dataUser.email) {
          await mailService.checkEmail('email', userId, randomReceived);
          UserValidations.validEmail(dataUser.email);
          await userRepository.update(userId, { email: dataUser.email });
        }
        if (
          (await authService.deleteAll(userId)) &&
          !(await mailService.deleteEmailsOfUser(userId))
        )
          throw new FormatError(500, 'Erro ao limpar acessos a conta');
      } else {
        (Object.keys(dataUser) as (keyof PartialUserRegisterValues)[]).forEach((field) => {
          if (field === 'name') UserValidations.validName(dataUser[field]);
          if (field === 'dateBirth') UserValidations.validDateBirth(dataUser[field]);
          else throw new FormatError(400, 'Dados que não existem no usuário');
        });


        await userRepository.update(userId, dataUser);
      }
      const saved = await userRepository.findById(userId);
      if (!saved) throw new FormatError(500, 'Falha de conexão');


      return { name: saved.name, email: saved.email, dateBirth: saved.dateBirth };
    } catch (error) {
      if (error instanceof FormatError) throw error;
      throw new FormatError(500, 'Erro em atualizar usuário');
    }
  }
}


const userService = new UserService();
export default userService;


