// Tipagns
import { type Browser } from '../types/requestBodyTypes';

import { UserType } from '../types/userTypes';

// Retorno do erro
import FormatError from '../errors/FormatError';

// Regex
import { regexEmail, regexPassword } from '../config/userPropers';

// Banco
import userRepository from '../repositories/userRepositories';
import UserEntity from '../entities/UserEntity';

// Funções
import PasswordHashService from '../security/hashing/PasswordHashService';

const maxDate = new Date(1900, 0, 1);

class UserService {
  public async register(dataUser: UserType): Promise<number> {
    if (dataUser.name.length < 3)
      throw new FormatError(400, 'Nome pequeno', {
        inputErro: ['NAME'],
      });

    if (!regexEmail.test(dataUser.email))
      throw new FormatError(400, 'Email inválido', {
        inputErro: ['EMAIL'],
      });

    if (await userRepository.findByEmail(dataUser.email))
      throw new FormatError(401, 'Este email ja esta em uso', {
        inputErro: ['EMAIL'],
      });

    if (dataUser.dateBirth.getTime())
      throw new FormatError(400, 'Data de aniversário inválida', { inputErro: ['DATE'] });

    if (dataUser.dateBirth > maxDate ? dataUser.dateBirth >= new Date() : false)
      throw new FormatError(400, 'É proíbido que viajantes do tempo usar esse site', {
        inputErro: ['DATE'],
      });

    const errorOfPassword = regexPassword(dataUser.password);
    if (errorOfPassword)
      throw new FormatError(400, errorOfPassword, {
        inputErro: ['PASSWORD'],
      });

    const User = new UserEntity();
    Object.assign(User, {
      name: dataUser.name,
      email: dataUser.email,
      password: await PasswordHashService.hash(dataUser.password),
      dateBirth: dataUser.dateBirth,
    });

    const saved = await userRepository.save(User);
    if (!saved) throw new FormatError(500, 'Erro na hora de cadastrar, tente mais tarde');

    return saved['id_user'];
  }

  public async login({ email, password }: UserType): Promise<number> {
    if (!regexEmail.test(email))
      throw new FormatError(400, 'Email inválido', {
        inputErro: ['EMAIL'],
      });

    const user = await userRepository.findByEmail(email);
    if (!user)
      throw new FormatError(401, 'Este email não existe', {
        inputErro: ['EMAIL'],
      });

    const errorOfPassword = regexPassword(password);
    if (errorOfPassword)
      throw new FormatError(400, errorOfPassword, {
        inputErro: ['PASSWORD'],
      });

    await PasswordHashService.hash(password)
      .then(async (hash) => await PasswordHashService.compare(hash, user.password))
      .then((equal) => {
        if (!equal)
          throw new FormatError(401, 'Senha diferente', {
            inputErro: ['PASSWORD'],
          });
      });

    return user['id_user'];
  }
}

const userService = new UserService();
export default userService;
