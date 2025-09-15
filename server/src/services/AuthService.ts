// Tipagens
import { type Browser } from '../types/requestBodyTypes';
import { type UserValues } from '../templates/userTemplates';

// Configurações
import mailsConf from '../config/keys/mails.config';

// Banco
import TokenEntity from '../entities/token';
import TokenRepository from '../repositories/TokenRepository';
import mailService from './sub-services/MailService';

// Retorno de erro
import FormatError from '../errors/FormatError';

// Funções
import TokenManager from '../security/tokens/newTokenManager';

class AuthService {
  private repo = new TokenRepository();
  private tokenManager = new TokenManager();

  public async sendEmailVerification({ id_user: id, email }: UserValues) {
    
  }
}

const authService = new AuthService();
export default authService;
