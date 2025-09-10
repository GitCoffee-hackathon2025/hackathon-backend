// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { type RequestBody } from '../../typescript/requestBodyType';

// Retorno do erro
import SendError from '../../errors/SendError';

// Classes
import TokenHandler from '../../security/tokens/TokenHandler';
import CryptoManager from '../../security/crypto/CryptoManager';

// Middlewares
import validateFormatBody from '../../middlewares/validateFormatBody';
import validateHeaderBody from '../../middlewares/validateHeaderBody';
import validateToken from '../../middlewares/validateToken';

export async function LoginUpController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as RequestBody;

    validateFormatBody(body);
    validateHeaderBody(body.header);

    const payload = await CryptoManager.decode(body);

    // Lógica do serviço de login-up para pegar o id
    // será passado email e password
    const id = '1'; // exemplo

    // é necessário passar o !
    const tokens = await TokenHandler.issueTokens(id, payload.decoded.browser!);

    reply.status(200).send(tokens);
  } catch (error) {
    SendError(error, reply);
  }
}

export async function LoginController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as RequestBody;

    validateFormatBody(body);
    validateHeaderBody(body.header);
    validateToken(request.headers.authorization);

    const payload = await CryptoManager.decode(body);

    const idOfToken = await TokenHandler.authenticateAccessToken(
      request.headers.authorization!,
      payload.decoded.browser!
    );

    // Serviço de login
    const data = { name: 'Senhor', email: 'IanBobao@gmail.com' }; // Exemplo

    reply.status(200).send(await CryptoManager.encode(data, payload.aes));
  } catch (error) {
    SendError(error, reply);
  }
}

export async function RefreshController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as RequestBody;

    validateFormatBody(body);
    validateHeaderBody(body.header);
    validateToken(request.headers.authorization);

    const payload = await CryptoManager.decode(body);

    const tokens = await TokenHandler.refreshTokens(
      request.headers.authorization!,
      payload.decoded.browser!
    );

    reply.status(200).send(tokens);
  } catch (error) {
    SendError(error, reply);
  }
}
