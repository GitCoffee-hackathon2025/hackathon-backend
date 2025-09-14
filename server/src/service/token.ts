// Tipagens
import { type Browser } from '../types/requestBodyTypes';
import { type UserValues } from '../templates/userTemplates';

// Banco
import TokenEntity from '../entities/token';
import TokenRepository from '../repositories/token';

// Retorno de erro
import FormatError from '../errors/FormatError';

// Funções
import TokenManager from '../security/tokens/newTokenManager';
import { sendMail } from '../email/transporter';

class TokenService {
  private repo = new TokenRepository();
  private tokenManager = new TokenManager();

  public async sendCode({ id_user: id, email }: UserValues, browser: Browser) {
    // const { token, ...dataToken } = await this.tokenManager.generateForVerification(id, browser);

    // const Token = new TokenEntity();
    // Object.assign(Token, dataToken.table);

    // const saved = await this.repo.save(Token, dataToken.expiresIn);
    // if (!saved) throw new FormatError(500, 'Erro em salvar token, tente mais tarde');

    // await sendMail(email, {
    //   subject: '',
    //   text: '',
    //   html: '',
    // });
  }
}

const tokenService = new TokenService();
export default tokenService;
