import { createKey } from '../keyCrypto/KeyManager';

// Classe que armazena as informações para rotacionamento de chaves e faz isso
class KeyBootstrapCrypto {
  private static time: number = 2592000000;

  private static _init: boolean = false;

  // função que inicia o modulo de criptografia
  public static async init(): Promise<void> {
    // verifica para não repetir
    if (this._init) throw new Error('not allowed to restart');
    this._init = true;

    await createKey();
    // inicia o rotacionador de fato
    setTimeout(async () => await createKey(), this.time);
  }
}

export default KeyBootstrapCrypto;
