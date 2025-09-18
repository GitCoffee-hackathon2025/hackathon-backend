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
      expiresAt,
    });

    try {
      await sendMail(email, {
        subject: 'Código de Verificação - Registro',
        text: `Seu código de verificação é: ${code}`,
        html: `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Código de Verificação</title>

  <!-- Variáveis (alguns clients não suportam custom properties — ver observações abaixo) -->
  <style>
    :root {
      color-scheme: dark;

      --color-gray-dark: rgba(29, 30, 28);   /* #1D1E1C */
      --color-gray-light: rgba(221, 221, 211); /* #DDDDD3 */
      --color-black: rgba(0, 0, 0);          /* #000000 */
      --color-white: rgba(248, 246, 242);    /* #F8F6F2 */
      --color-red: rgba(132, 15, 15);        /* #840F0F */
      --color-input: rgba(60, 60, 60);       /* #3C3C3C */
      --color-green: rgba(0, 128, 0);        /* #008000 */
      --shadow-default: 0 0 7px rgba(255,255,255,0.255);
    }

    /* Estilos internos (bom para clientes que aceitam <style>) */
    .btn {
      display: inline-block;
      text-decoration: none;
      font-weight: 600;
      border-radius: 8px;
      padding: 12px 18px;
      border: 1px solid rgba(255,255,255,0.06);
    }

    /* Make code more readable on small screens */
    @media only screen and (max-width:480px) {
      .container { width:100% !important; padding:12px !important; }
      .code { font-size:24px !important; letter-spacing:4px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#1D1E1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#F8F6F2;">

  <!-- Preheader (texto curto que aparece na pré-visualização do cliente) -->
  <span style="display:none; font-size:1px; color:#1D1E1C; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    Seu código de verificação chegou — válido por 15 minutos.
  </span>

  <!-- Container central -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <!-- email card -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0"
               style="width:600px; max-width:600px; background-color:#1D1E1C; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.03);">
          <tr>
            <td style="padding:28px;">
              <!-- Logo / título -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:left; padding-bottom:18px;">
                    <h1 style="margin:0; font-size:20px; color:#F8F6F2;">Verificação de Segurança</h1>
                    <p style="margin:6px 0 0 0; color:#DDDDD3; font-size:13px;">
                      Use o código abaixo para concluir sua autenticação. Não compartilhe com ninguém.
                    </p>
                  </td>
                  <td style="text-align:right;">
                    <!-- pequeno marcador visual -->
                    <div style="width:44px; height:44px; background:#840F0F; border-radius:8px; display:inline-block; text-align:center; line-height:44px;">
                      <span style="color:#F8F6F2; font-weight:700;">✓</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Corpo principal -->
              <div style="margin-top:20px; background:#111110; border-radius:10px; padding:20px; border:1px solid rgba(255,255,255,0.03);">
                <p style="margin:0 0 12px 0; color:#DDDDD3; font-size:14px;">
                  Seu código de verificação é:
                </p>

                <!-- Caixa do código: use inline styles para máxima compatibilidade -->
                <div class="code" style="
                      display:inline-block;
                      width:100%;
                      max-width:420px;
                      text-align:center;
                      font-size:28px;
                      font-weight:700;
                      letter-spacing:6px;
                      padding:14px 18px;
                      border-radius:10px;
                      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
                      color:#F8F6F2;
                      border:1px solid rgba(255,255,255,0.03);
                      box-shadow: var(--shadow-default);
                      -webkit-text-size-adjust: none;
                      ">
                  <span style="color:#F8F6F2;">${code}</span>
                </div>

                <p style="margin:14px 0 0 0; color:#DDDDD3; font-size:13px;">
                  Este código expira em <strong style="color:#F8F6F2;">15 minutos</strong>. Se você não solicitou, ignore este e-mail.
                </p>
              </div>

              <!-- Rodapé -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                <tr>
                  <td style="color:#BDBCB6; font-size:12px; line-height:18px;">
                    <p style="margin:0;">
                      Precisa de ajuda? Responda este e-mail ou visite nossa página de suporte.
                    </p>
                    <p style="margin:6px 0 0 0; color:#8f8f8b; font-size:11px;">
                      © <span id="year">2025</span> GitCoffee.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
        <!-- /email card -->
      </td>
    </tr>
  </table>

  <!-- Script mínimo para atualizar ano (não necessário, mas inofensivo em clientes que executam JS) -->
  <script>
    try { document.getElementById('year').textContent = new Date().getFullYear(); } catch(e) {}
  </script>
</body>
</html>
`,
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
