// Retorno de erro
import FormatError from '../errors/FormatError';

// Regex
import { regexPassword, regexEmail } from '../config/userPropers';

const maxDate = new Date(1900, 0, 1);

class UserValidations {
  public static validName(name: string) {
    if (name.length < 3)
      throw new FormatError(400, 'Nome pequeno', {
        inputErro: ['NAME'],
      });
  }

  public static validEmail(email: string) {
    if (!regexEmail.test(email))
      throw new FormatError(400, 'Email inválido', {
        inputErro: ['EMAIL'],
      });
  }

  public static validDateBirth(date: Date) {
    if (date.getTime())
      throw new FormatError(400, 'Data de aniversário inválida', { inputErro: ['DATE'] });

    if (date > maxDate ? date >= new Date() : false)
      throw new FormatError(400, 'É proíbido que viajantes do tempo usar esse site', {
        inputErro: ['DATE'],
      });
  }

  public static validPassword(password: string) {
    const errorOfPassword = regexPassword(password);
    if (errorOfPassword)
      throw new FormatError(400, errorOfPassword, {
        inputErro: ['PASSWORD'],
      });
  }

  public static comparePasswords(password: string, confirm: string) {
    if (password !== confirm) {
      throw new FormatError(400, 'Confirmação de senha inválida', {
        inputErro: ['CONFIRM_PASSWORD'],
      });
    }
  }

  // public static isVerified(verified: boolean) {
  //   if (!verified) throw new FormatError(409, 'A conta ainda não foi verificada, acesse seu email');
  // }
}

export default UserValidations;
