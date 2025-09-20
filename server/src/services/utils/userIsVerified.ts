// Retorno do erro
import FormatError from '../../errors/FormatError';

// Banco
import UserEntity from '../../entities/UserEntity';
import mailService from './../sub-services/MailService';

async function userIsVerified(user: UserEntity) {
  if (!user['is_verified']) {
    try {
      await mailService.sendMail('verification', { userId: user['id_user'], email: user.email });
      throw new FormatError(409, 'A conta ainda não foi verificada, acesse seu email');
    } catch (error) {
      if (error instanceof FormatError) {
        if (error.status === 404)
          throw new FormatError(409, 'Acesse seu email para pegar o código de verificação');
        throw error;
      }
      throw new FormatError(500, 'Erro ao verificar conta do usuário');
    }
  }
}

export default userIsVerified;
