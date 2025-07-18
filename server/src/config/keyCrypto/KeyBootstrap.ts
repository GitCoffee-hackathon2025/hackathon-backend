import { registerToken, createKey } from './KeyManager';
import type uuidType from './uuidType';

// Classe que armazena as informações para rotacionamento de chaves e faz isso
class KeyBootstrapCrypto {
  private static token: uuidType = crypto.randomUUID();

  private static time: number = 604800000;

  private static _initCalled: boolean = false;

  // função que inicia o modulo de criptografia
  public static async init(): Promise<void> {
    // verifica para não repetir
    if (this._initCalled) throw new Error('not allowed to restart');
    this._initCalled = true; 

    registerToken(this.token);

    await createKey(this.token);
    // inicia o rotacionador de fato
    setTimeout(async () => await createKey(this.token), this.time);
  }
}

export default KeyBootstrapCrypto;
