// Tipagens
import { type FastifyInstance } from 'fastify';

// Configurações
import timing from './timing.config';

// Funções
import { createRSAKey } from '../keyCrypto/KeyManager';
import { initJWTService, createJWTKey } from '../KeyTokens/KeyManager';

// Classe que armazena as informações para rotacionamento de chaves e faz isso
class KeyBootstrap {
  private static async createKeys() {
    await createRSAKey();
    await createJWTKey();
  }

  private static _init: boolean = false;

  // função que inicia o modulo de criptografia
  public static async init(fastify: FastifyInstance): Promise<void> {
    // verifica para não repetir
    if (this._init) throw new Error('not allowed to restart');
    this._init = true;

    await this.createKeys();
    await initJWTService(fastify);

    // inicia o rotacionador de fato
    setTimeout(async () => {
      await this.createKeys();
    }, timing.rotates);
    console.log('security module started');
  }
}

export default KeyBootstrap;
