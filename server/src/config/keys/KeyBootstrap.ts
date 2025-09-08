import { type FastifyInstance } from 'fastify';

import { createRSAKey } from '../keyCrypto/KeyManager';
import { createJWTKey } from '../KeyTokens/KeyManager';

// Classe que armazena as informações para rotacionamento de chaves e faz isso
class KeyBootstrapCrypto {
  private static time: number = 2592000000; // 30 dias

  private static _init: boolean = false;

  // função que inicia o modulo de criptografia
  public static async init(fastify: FastifyInstance): Promise<void> {
    // verifica para não repetir
    if (this._init) throw new Error('not allowed to restart');
    this._init = true;

    await createRSAKey();
    await createJWTKey(fastify);
    // inicia o rotacionador de fato
    setTimeout(async () => {
      await createRSAKey();
      await createJWTKey(fastify);
    }, this.time);
    console.log('security module started');
  }
}

export default KeyBootstrapCrypto;
