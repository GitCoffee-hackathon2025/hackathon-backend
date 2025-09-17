// Tipagens
// Adicione esta tipagem no início do arquivo
interface RegistrationCache {
  email: string;
  code: string;
  expiresAt: Date;
}
// import { type VerificationValues } from '../templates/verificationTemplates';


// Configurações
import mailsConf from '../../config/keys/mails.config';


// Banco
import MailEntity from '../../entities/MailEntity';
import MailRepository from '../../repositories/MailRepository';


// Retorno de erro
import FormatError from '../../errors/FormatError';


// Funções
import { sendMail } from '../../email/transporter';
import BcryptHashService from '../../security/hashing/BcryptHashService';
import generateRandomNumber from '../../security/generateRandomNumber';


type TypeMail = keyof typeof mailsConf;


function chooseSubject(name: (typeof mailsConf)[TypeMail]['name']) {
  if (name === 'VERIFICATION') return 'Verificação de e-mail';
  if (name === 'PASSWORD_RESET') return 'Recuperação de conta (mudar senha)';
  if (name === 'CHANCE_EMAIL') return 'Verificação para mudança de e-mail';
  throw new FormatError(500, 'Erro com o tipo de email');
}


class MailService {
  private repo = new MailRepository();
  private registrationCache: Map<string, RegistrationCache> = new Map();
  // Adicione estes métodos à classe MailService
public async sendRegistrationCode(email: string): Promise<void> {
  // Limpar códigos expirados
  this.cleanExpiredCodes();


  // Gerar código de 6 dígitos
  const code = generateRandomNumber(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos


  // Armazenar em cache
  this.registrationCache.set(email, {
    email,
    code: String(code),
    expiresAt
  });


  try {
    await sendMail(email, {
      subject: 'Código de Verificação - Registro',
      text: `Seu código de verificação é: ${code}`,
      html: `<p>Seu código de verificação é: <b>${code}</b></p>
             <p>Este código expira em 15 minutos.</p>`
    });
  } catch (error) {
    this.registrationCache.delete(email);
    throw new FormatError(500, 'Falha ao enviar e-mail, tente novamente');
  }
}


public async verifyRegistrationCode(email: string, receivedCode: string): Promise<void> {
  const cached = this.registrationCache.get(email);
 
  if (!cached) {
    throw new FormatError(404, 'Código não encontrado ou expirado');
  }


  if (new Date() > cached.expiresAt) {
    this.registrationCache.delete(email);
    throw new FormatError(410, 'Código expirado');
  }


  if (cached.code !== receivedCode) {
    throw new FormatError(401, 'Código inválido');
  }


  // Código válido - remover do cache
  this.registrationCache.delete(email);
}


private cleanExpiredCodes(): void {
  const now = new Date();
  for (const [email, cache] of this.registrationCache.entries()) {
    if (now > cache.expiresAt) {
      this.registrationCache.delete(email);
    }
  }
}
  public async sendMail(
    type: TypeMail,
    { userId, email }: { userId: number; email: string }
  ): Promise<void> {
    if (await this.repo.findByUserIdAndType(userId, mailsConf.verification.name))
      throw new FormatError(404, 'Já foi enviado um e-mail para essa conta');


    const random = generateRandomNumber();


    const Mail = new MailEntity();
    Object.assign(Mail, {
      user_id: userId,
      type: mailsConf[type].name,
      random: await BcryptHashService.hash(String(random)),
    });


    const saved = await this.repo.save(Mail, mailsConf[type].expiresIn);
    if (!saved) throw new FormatError(500, 'Falha ao salvar email, tente mais tarte');


    // No futuro melhorar esse email
    try {
      await sendMail(email, {
        subject: chooseSubject(mailsConf[type].name),
        text: `Seu código é: ${random}`,
        html: `<p>Seu código é: <b>${random}</b></p>`,
      });
    } catch (error) {
      if (!(await this.repo.delete(saved.id_mail)))
        throw new FormatError(500, 'Erro crítico no servidor, tente daqui pelo menos 15 minutos');
      throw new FormatError(500, 'Falha ao enviar e-mail, tente novamente');
    }
  }


  public async checkEmail(type: TypeMail, userId: number, randomReceived: number): Promise<void> {
    const mail = await this.repo.findByUserIdAndType(userId, mailsConf[type].name);
    if (!mail) throw new FormatError(404, 'Não foi enviado email para essa conta');


    await BcryptHashService.hash(String(randomReceived))
      .then(async (hash) => await BcryptHashService.compare(hash, mail.random))
      .then((equal) => {
        if (!equal) throw new FormatError(401, 'Código inválido');
      });


    if (!(await this.repo.delete(mail.id_mail)))
      throw new FormatError(500, 'Falha ao finalizar e-mail, tente mais tarde');
  }


  public async deleteEmailsOfUser(userId: number): Promise<boolean> {
    return this.repo.deleteAllByUserId(userId);
  }
}


const mailService = new MailService();
export default mailService;


