// Tipagens
import { type FastifyRequest } from 'fastify';
import { type RequestBody, type DecryptedRequestData } from '../../typescript/requestBodyType';

// Classe
import cryptoEngine from './CryptoEngine';

class CryptoManager {
  public static async decode(
    request: FastifyRequest
  ): Promise<{ decoded: DecryptedRequestData; aes: CryptoKey }> {
    const body = request.body as RequestBody;

    const aes = await cryptoEngine.decodeKey(body.ct, body.header.rsa.kid);

    const decoded = await cryptoEngine.decodeData(body, aes);

    return { decoded, aes };
  }

  public static async encode(data: Record<string, any>, aes: CryptoKey) {
    return await cryptoEngine.encodeData(data, aes);
  }
}

export const sendPublic = cryptoEngine.sendPublicKey;
export default CryptoManager;