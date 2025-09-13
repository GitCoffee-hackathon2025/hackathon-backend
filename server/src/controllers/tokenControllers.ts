// import 'dotenv/config';
// import { type FastifyRequest, type FastifyReply } from 'fastify';

// import crypto from 'crypto';

// import tokenService from '../service/TokenService';
// import userService from '../service/UserService';

// import { transporter } from '../email/transporter';

// import { TokenSendOrVerify } from '../types/userTypes';

// import { CryptoUtil } from '../utils/crypto';

// import { ResponseHandler } from '../utils/requisitionsResposnses';

// export async function sendVerificationToken(
//   request: FastifyRequest<{ Body: TokenSendOrVerify }>,
//   reply: FastifyReply
// ) {
//   const { email, type } = request.body;
//   const MIN_SECONDS_BETWEEN_REQUESTS = 30;
//   const EXPIRES_MINUTES = 5;

//   if (!email) {
//     return ResponseHandler.errorInEmail(reply, 'Email obrigatório.', undefined);
//   }

//   if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
//     return ResponseHandler.errorInEmail(reply, 'Email inválido para cadastro.', undefined);
//   }

//   if (type !== 'EMAIL_VERIFICATION' && type !== 'PASSWORD_RESET' && type !== 'CHANGE_EMAIL') {
//     return ResponseHandler.error(reply, undefined, 400, undefined);
//   }

//   const generateNumericCode = (): string => {
//     const n = crypto.randomInt(0, 1_000_000);
//     return n.toString().padStart(6, '0');
//   };

//   const tokenCode = generateNumericCode();
//   const now = new Date();

//   try {
//     const userAlredyExist = await userService.findByEmail(request.body.email);
//     if (userAlredyExist && type == 'EMAIL_VERIFICATION') {
//       return ResponseHandler.errorInEmail(reply, 'Este email ja esta em uso.', undefined);
//     }

//     const tokenExisting = await tokenService.find(email, type);

//     if (tokenExisting) {
//       const elapsedMs = now.getTime() - new Date(tokenExisting.createdAt).getTime();
//       if (elapsedMs < MIN_SECONDS_BETWEEN_REQUESTS * 1000) {
//         return ResponseHandler.error(
//           reply,
//           `Aguarde ${MIN_SECONDS_BETWEEN_REQUESTS} segundos antes de reenviar.`,
//           429,
//           ['SUBMIT']
//         );
//       }
//     }

//     await tokenService.delete(email, type);

//     const tokenHash = await CryptoUtil.hashPassword(tokenCode);
//     const expiresAt = new Date(now.getTime() + EXPIRES_MINUTES * 60 * 1000);

//     const deviceRequestId = crypto.randomUUID();

//     const ipAddress = request.ip;
//     const userAgent = request.headers['user-agent'] || 'unknown';

//     await tokenService.register({
//       emailUser: email,
//       tokenHash,
//       tokenType: type,
//       expiresAt,
//       deviceRequestId,
//       ipAddress,
//       userAgent,
//     });

//     reply.setCookie('device_request_id', deviceRequestId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       expires: expiresAt, // 15 minutos
//     });

//     try {
//       await transporter.sendMail({
//         from: `"Hackathon" <${process.env.EMAIL}>`,
//         to: email,
//         subject:
//           type === 'EMAIL_VERIFICATION'
//             ? 'Verificação de e-mail'
//             : type === 'PASSWORD_RESET'
//             ? 'Recuperação de senha'
//             : 'Mudança de email',
//         text: `Seu código é: ${tokenCode}`,
//         html: `<p>Seu código é: <b>${tokenCode}</b></p>`,
//       });
//     } catch (mailErr) {
//       return ResponseHandler.error(reply, 'Falha ao enviar e-mail.', 502, undefined);
//     }

//     return ResponseHandler.success(reply, undefined, undefined, undefined);
//   } catch (err: any) {
//     return ResponseHandler.error(reply, err.message, undefined, undefined);
//   }
// }

// export async function verifyToken(
//   request: FastifyRequest<{ Body: TokenSendOrVerify }>,
//   reply: FastifyReply
// ) {
//   const { email, type, code } = request.body;

//   if (!email) {
//     return ResponseHandler.errorInEmail(reply, 'Email obrigatório.', undefined);
//   }

//   if (type !== 'EMAIL_VERIFICATION' && type !== 'PASSWORD_RESET' && type !== 'CHANGE_EMAIL') {
//     return ResponseHandler.error(reply, undefined, 400, undefined);
//   }

//   if (code === undefined || code === null) {
//     return ResponseHandler.errorInCode(reply, 'Código inválido.', undefined);
//   }

//   const device_request_id = request.cookies.device_request_id;

//   try {
//     const tokenExisting = await tokenService.find(email, type);

//     if (!tokenExisting) {
//       return ResponseHandler.errorInCode(reply, 'Código inválido.', undefined);
//     }
//     if (tokenExisting.deviceRequestId != device_request_id) {
//       return ResponseHandler.unauthorized(reply);
//     }

//     if (tokenExisting.used) {
//       return ResponseHandler.errorInCode(reply, 'Código expirado.', undefined);
//     }

//     const now = new Date();

//     if (tokenExisting.expiresAt && now > tokenExisting.expiresAt) {
//       return ResponseHandler.errorInCode(reply, 'Código expirado.', undefined);
//     }

//     const isMatch = await CryptoUtil.comparePassword(String(code), tokenExisting.tokenHash);

//     if (!isMatch) {
//       return ResponseHandler.errorInCode(reply, 'Código inválido.', undefined);
//     }
//     await tokenService.update(email, type);

//     return ResponseHandler.success(reply, undefined, undefined, undefined);
//   } catch (err: any) {
//     return ResponseHandler.error(reply, err.message, undefined, undefined);
//   }
// }
