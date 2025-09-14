// Tipagens
import { type RequestBody, type DecryptedRequestData } from '../../types/requestBodyTypes';

// Classe
import cryptoEngine from './CryptoEngine';

class CryptoManager {
  public static async decode(
    body: RequestBody
  ): Promise<{ decoded: DecryptedRequestData; aes: CryptoKey }> {
    const aes = await cryptoEngine.decodeKey(body.ek, body.header.rsa.kid);

    const decoded = await cryptoEngine.decodeData(body, aes);

    return { decoded, aes };
  }

  public static async encode(data: Record<string, any>, aes: CryptoKey) {
    return await cryptoEngine.encodeData(data, aes);
  }
}

export const sendPublic = cryptoEngine.sendPublicKey;
export default CryptoManager;
