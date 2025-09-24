// Tipagens
// Adicione esta tipagem no início do arquivo
interface RegistrationCache {
  email: string;
  code: string;
  expiresAt: Date;
}

interface PasswordRecoveryCache {
  email: string;
  code: string;
  expiresAt: Date;
}

// import { type VerificationValues } from '../templates/verificationTemplates';
import userRepository from '../../repositories/UserRepository';
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
  private passwordRecoveryCache: Map<string, PasswordRecoveryCache> = new Map();

  public async verifyPasswordRecoveryCode(email: string, receivedCode: string): Promise<void> {
    console.log('🔴 [DEBUG] Verificando código de recuperação de senha');
    console.log('🔴 [DEBUG] Email:', email);
    console.log('🔴 [DEBUG] Código recebido:', receivedCode);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.log('🔴 [DEBUG] Usuário não encontrado');
      throw new FormatError(404, 'Usuário não encontrado');
    }

    const mail = await this.repo.findByUserIdAndType(user.id_user, 'PASSWORD_RESET');
    console.log('🔴 [DEBUG] Mail encontrado no banco:', mail);

    if (!mail) {
      console.log('🔴 [DEBUG] Código não encontrado no banco');
      throw new FormatError(404, 'Código não encontrado ou expirado');
    }

    const now = new Date();



    console.log('🔴 [DEBUG] Agora:', now);

  
    

    console.log('🔴 [DEBUG] Verificando código com bcrypt...');
    const isValid = await BcryptHashService.compare(receivedCode, mail.random);
    console.log('🔴 [DEBUG] Código válido?', isValid);

    if (!isValid) {
      console.log('🔴 [DEBUG] Código inválido');
      throw new FormatError(401, 'Código inválido');
    }

    console.log('🔴 [DEBUG] Código válido - deletando do banco');
    await this.repo.delete(mail.id_mail);
  }

  public async sendPasswordRecoveryCode(email: string): Promise<void> {
    console.log('🔴 [DEBUG] Iniciando envio de código de recuperação para:', email);

    // Verificar se o email existe no banco
    const user = await userRepository.findByEmail(email);
    console.log('🔴 [DEBUG] Buscando usuário no banco para email:', email);

    if (!user) {
      console.log(
        '🔴 [DEBUG] Usuário não encontrado para email:',
        email,
        '- Retornando silenciosamente por segurança'
      );
      return;
    }

    console.log('🔴 [DEBUG] Usuário encontrado:', { id: user.id_user, email: user.email });

    // Verificar se já existe um código PASSWORD_RESET para este usuário
    console.log('🔴 [DEBUG] Verificando códigos existentes para o usuário ID:', user.id_user);
    const existingMail = await this.repo.findByUserIdAndType(user.id_user, 'PASSWORD_RESET');

    if (existingMail) {
      console.log(
        '🔴 [DEBUG] Código anterior encontrado, deletando... ID do código:',
        existingMail.id_mail
      );
      await this.repo.delete(existingMail.id_mail);
      console.log('🔴 [DEBUG] Código anterior deletado com sucesso');
    } else {
      console.log('🔴 [DEBUG] Nenhum código anterior encontrado para este usuário');
    }

    const code = generateRandomNumber(6);
    console.log('🔴 [DEBUG] Código gerado:', code);

    // Criar registro no banco de dados - CORREÇÃO AQUI
    console.log('🔴 [DEBUG] Criando novo registro no banco de dados...');
    const Mail = new MailEntity();

    // CORREÇÃO: Atribuir o objeto user completo em vez de apenas id_user
    Object.assign(Mail, {
      user: user, // Agora atribui o objeto user completo
      type: 'PASSWORD_RESET',
      random: await BcryptHashService.hash(String(code)),
    });

    console.log('🔴 [DEBUG] Tentando salvar código no banco...');
    const saved = await this.repo.save(Mail, 15 * 60); // 15 minutos em segundos

    if (!saved) {
      console.log('❌ [ERROR] Falha ao salvar código no banco de dados');
      throw new FormatError(500, 'Falha ao salvar código de recuperação, tente mais tarde');
    }

    console.log('✅ [SUCCESS] Código salvo no banco com sucesso! ID do registro:', saved.id_mail);
    console.log('🔴 [DEBUG] Detalhes do código salvo:', {
      id_mail: saved.id_mail,
      id_user: saved.user.id_user, // CORREÇÃO: Agora saved.user existe
      type: saved.type,
      expires_at: saved.expires_at,
    });

    try {
      console.log('🔴 [DEBUG] Preparando para enviar email para:', email);
      await sendMail(email, {
        subject: 'Recuperação de Senha - GitCoffee',
        text: `Seu código de recuperação é: ${code}`,
        html: `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Recuperação de Senha</title>
  <style>
    :root { color-scheme: dark; }
    .btn { display: inline-block; text-decoration: none; font-weight: 600; border-radius: 8px; padding: 12px 18px; }
    @media only screen and (max-width:480px) { .container { width:100% !important; padding:12px !important; } .code { font-size:24px !important; letter-spacing:4px !important; } }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#1D1E1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#F8F6F2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0"
               style="width:600px; max-width:600px; background-color:#1D1E1C; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.03);">
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0; font-size:20px; color:#F8F6F2;">Recuperação de Senha</h1>
              <p style="margin:6px 0 0 0; color:#DDDDD3; font-size:13px;">
                Use o código abaixo para redefinir sua senha.
              </p>
              
              <div style="margin-top:20px; background:#111110; border-radius:10px; padding:20px; border:1px solid rgba(255,255,255,0.03);">
                <p style="margin:0 0 12px 0; color:#DDDDD3; font-size:14px;">Seu código de recuperação é:</p>
                <div class="code" style="display:inline-block; width:100%; max-width:420px; text-align:center; font-size:28px; font-weight:700; letter-spacing:6px; padding:14px 18px; border-radius:10px; background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); color:#F8F6F2; border:1px solid rgba(255,255,255,0.03);">
                  <span style="color:#F8F6F2;">${code}</span>
                </div>
                <p style="margin:14px 0 0 0; color:#DDDDD3; font-size:13px;">
                  Este código expira em <strong style="color:#F8F6F2;">15 minutos</strong>.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });

      console.log('✅ [SUCCESS] Email enviado com sucesso para:', email);
      console.log('🔴 [DEBUG] Processo de recuperação de senha concluído com sucesso');
    } catch (error) {
      console.log('❌ [ERROR] Falha ao enviar email para:', email, 'Erro:', error);

      if (saved.id_mail) {
        console.log(
          '🔴 [DEBUG] Tentando fazer rollback - deletando código do banco ID:',
          saved.id_mail
        );
        await this.repo.delete(saved.id_mail);
        console.log('🔴 [DEBUG] Rollback concluído - código deletado do banco');
      }

      throw new FormatError(500, 'Falha ao enviar e-mail de recuperação, tente novamente');
    }
  }
  // Métodos auxiliares para compatibilidade (se ainda são usados em outros lugares)

  public async clearPasswordRecoveryCode(email: string): Promise<boolean> {
    console.log('🔴 [DEBUG] Limpando código de recuperação para:', email);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.log('🔴 [DEBUG] Usuário não encontrado');
      return false;
    }

    const mail = await this.repo.findByUserIdAndType(user.id_user, 'PASSWORD_RESET');
    if (!mail) {
      console.log('🔴 [DEBUG] Nenhum código encontrado para limpar');
      return false;
    }

    console.log('🔴 [DEBUG] Deletando código ID:', mail.id_mail);
    const deleted = await this.repo.delete(mail.id_mail);

    if (deleted) {
      console.log('✅ [DEBUG] Código limpo com sucesso');
    } else {
      console.log('❌ [DEBUG] Falha ao limpar código');
    }

    return deleted;
  }

  public async sendRegistrationCode(email: string): Promise<void> {
    console.log('🔴 [DEBUG] Enviando código de registro para:', email);

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      console.log('🔴 [DEBUG] Email já está em uso');
      throw new FormatError(401, 'Este email já está em uso');
    }

    const random = generateRandomNumber(6);
    console.log('🔴 [DEBUG] Código gerado:', random);

    try {
      await sendMail(email, {
        subject: 'Código de Verificação - Registro',
        text: `Seu código de verificação é: ${random}`,
        html: `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Código de Verificação</title>
  <style>
    :root { color-scheme: dark; }
    .btn { display:inline-block; font-weight:600; padding:12px 18px; border-radius:8px; }
    @media only screen and (max-width:480px) {
      .container { width:100% !important; padding:12px !important; }
      .code { font-size:24px !important; letter-spacing:4px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#1D1E1C; color:#F8F6F2; font-family:sans-serif;">
  <span style="display:none;">Seu código de verificação chegou — válido por 15 minutos.</span>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table width="600" style="background-color:#1D1E1C; border-radius:12px; border:1px solid rgba(255,255,255,0.03);">
          <tr>
            <td style="padding:28px;">
              <h1 style="font-size:20px; margin:0;">Verificação de Segurança</h1>
              <p style="margin:6px 0 20px 0; font-size:13px;">Use o código abaixo para concluir sua autenticação:</p>
              <div class="code" style="font-size:28px; font-weight:700; letter-spacing:6px; text-align:center; padding:14px; border-radius:10px; border:1px solid rgba(255,255,255,0.1);">
                ${random}
              </div>
              <p style="margin-top:14px; font-size:13px;">Este código expira em <strong>15 minutos</strong>.</p>
              <p style="margin-top:18px; font-size:12px; color:#8f8f8b;">© 2025 GitCoffee.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });

      console.log('🔴 [DEBUG] Email enviado com sucesso');

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      this.registrationCache.set(email, { email, code: String(random), expiresAt });

      console.log('🔴 [DEBUG] Salvo no cache:', this.registrationCache.get(email));
    } catch (error) {
      console.log('🔴 [DEBUG] Erro ao enviar email:', error);
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
      id_user: userId,
      type: mailsConf[type].name,
      random: await BcryptHashService.hash(String(random)),
    });

    const saved = await this.repo.save(Mail, mailsConf[type].expiresIn);
    if (!saved) throw new FormatError(500, 'Falha ao salvar email, tente mais tarte');

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
