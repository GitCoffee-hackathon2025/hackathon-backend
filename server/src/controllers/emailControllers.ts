import 'dotenv/config';
import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { EmailService } from '../service/emailService';
import { UserService } from '../service/userService';
import { transporter } from '../email/transporter';
import { sendEmailorVerifyCode } from '../types/userTypes';

const emailService = new EmailService();
const userService = new UserService();
const sault_round = 12;
const defaultError = 'Erro interno ao processar a solicitação. Tente novamente mais tarde.';
export async function sendVerificationToken(
  request: FastifyRequest<{ Body: sendEmailorVerifyCode }>,
  reply: FastifyReply
) {
  const { email, type } = request.body;
  const MIN_SECONDS_BETWEEN_REQUESTS = 30;
  const EXPIRES_MINUTES = 5;

  if (!email) {
    return reply.code(400).send({
      success: false,
      message: 'Email não consta no corpo da requisição',
      error: 'Email obrigatório.',
    });
  }

  if (type !== 'EMAIL_VERIFICATION' && type !== 'PASSWORD_RESET') {
    return reply.code(400).send({
      success: false,
      message: 'Tipo de token inválido',
      error: defaultError,
    });
  }

  const generateNumericCode = (): string => {
    const n = crypto.randomInt(0, 1_000_000);
    return n.toString().padStart(6, '0');
  };

  const tokenCode = generateNumericCode();
  const now = new Date();

  try {
    const userAlredyExist = await userService.findUser(request.body.email, true);
    console.log(userAlredyExist)
    if (userAlredyExist) {
      return reply.status(409).send({
        success: false,
        message: 'Email fornecido pelo usuário ja está em uso',
        error: 'Este email ja está em uso.',
      });
    }

    const tokenExisting = await emailService.verify(email, type);

    if (tokenExisting) {
      const elapsedMs = now.getTime() - new Date(tokenExisting.createdAt).getTime();
      if (elapsedMs < MIN_SECONDS_BETWEEN_REQUESTS * 1000) {
        return reply.code(429).send({
          success: false,
          message: 'Requisição de envio de email muito recente',
          error: `Aguarde ${MIN_SECONDS_BETWEEN_REQUESTS} segundos antes de reenviar.`,
        });
      }
    }

    await emailService.delete(email);

    const tokenHash = await bcrypt.hash(tokenCode, sault_round);
    const expiresAt = new Date(now.getTime() + EXPIRES_MINUTES * 60 * 1000);

    await emailService.register({
      emailUser: email,
      tokenHash,
      tokenType: type,
      expiresAt,
    });

    try {
      await transporter.sendMail({
        from: `"Hackathon" <${process.env.EMAIL}>`,
        to: email,
        subject: type === 'EMAIL_VERIFICATION' ? 'Verificação de e-mail' : 'Recuperação de senha',
        text: `Seu código é: ${tokenCode}`,
        html: `<p>Seu código é: <b>${tokenCode}</b></p>`,
      });
    } catch (mailErr) {
      return reply.code(502).send({
        success: false,
        message: 'Falha ao enviar e-mail.',
        error: defaultError,
      });
    }

    return reply.code(200).send({ success: true, message: 'E-mail enviado' });
  } catch (err: any) {
    return reply.code(500).send({
      success: false,
      message: err.message,
      error: defaultError,
    });
  }
}

export async function verifyToken(
  request: FastifyRequest<{ Body: sendEmailorVerifyCode }>,
  reply: FastifyReply
) {
  const { email, type, code } = request.body;

  if (!email) {
    return reply.code(400).send({
      success: false,
      message: 'Email não consta no corpo da requisição',
      error: 'Email obrigatório.',
    });
  }

  if (type !== 'EMAIL_VERIFICATION' && type !== 'PASSWORD_RESET') {
    return reply
      .code(400)
      .send({ success: false, message: 'Tipo de token inválido.', error: defaultError });
  }

  if (code === undefined || code === null) {
    return reply.code(400).send({
      success: false,
      message: 'Código fornecido pelo usuário não consta no corpo da requisição',
      error: 'Código é obrigatório.',
    });
  }

  try {
    const tokenExisting = await emailService.verify(email, type);

    if (!tokenExisting) {
      return reply.code(400).send({
        success: false,
        message: 'Código fornecido pelo usuário não foi encontrado no banco de dados',
        error: 'Código inválido ou não solicitado.',
      });
    }

    if (tokenExisting.used) {
      return reply.code(400).send({
        success: false,
        message: 'Código fornecido pelo usuário já foi utilizado',
        error: 'Código já utilizado.',
      });
    }

    const now = new Date();

    if (tokenExisting.expiresAt && now > tokenExisting.expiresAt) {
      return reply.code(400).send({
        success: false,
        message: 'Código fornecido pelo usuário está expirado',
        error: 'Código expirado, solicite um novo código.',
      });
    }

    const isMatch = await bcrypt.compare(String(code), tokenExisting.tokenHash);

    if (!isMatch) {
      return reply.code(400).send({
        success: false,
        message: 'Código fornecido pelo usuário foi encontrado porém está incorreto',
        error: 'Código inválido ou não solicitado.',
      });
    }
    await emailService.update(email, type);

    return reply.code(200).send({
      success: true,
      message: 'Código válido.',
      error: 'Código fornecido pelo usuário está validado',
    });
  } catch (err: any) {
    return reply.code(500).send({
      success: false,
      message: err.message,
      error: defaultError,
    });
  }
}
