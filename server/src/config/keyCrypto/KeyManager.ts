// Tipagens
import { type Kid } from '../../typescript/requestBodyType';

// Configurações
import webcrypto from '../keys/crypto.config';

// Tipagens do arquivo
type FormatKey = { key: JsonWebKey; kid: Kid };

// Arquivo responsável por armazenar e gerenciar as tipagens e as chaves de criptografia

// local que armazena as chaves RSA (NÃO EXPORTAR!)
const sensitive: {
  public: FormatKey;
  private: FormatKey;
  old: FormatKey;
} = {
  public: {
    key: {} as JsonWebKey,
    kid: '0v',
  },
  private: {
    key: {} as JsonWebKey,
    kid: '0v',
  },
  old: {
    key: {} as JsonWebKey,
    kid: '0v',
  },
};

// funçãoq que incrementa a versão em 1
function incrementVersion(kid: Kid): Kid {
  // incrementa em 1 o kid
  return `${Number(kid.slice(0, -1)) + 1}v`;
}

// retorna somente uma RSA escolhida pelo parametro da função
export async function getKey(name: keyof typeof sensitive): Promise<{ key: CryptoKey; kid: Kid }> {
  return {
    key: await crypto.subtle.importKey(
      webcrypto.rsa.format,
      sensitive[name].key,
      (({ name, hash }) => ({ name, hash }))(webcrypto.rsa.alg),
      true,
      name === 'public' ? ['encrypt'] : ['decrypt']
    ),
    kid: sensitive[name].kid,
  };
}

export function getVersionKey(): { current: Kid; old: Kid } {
  return { current: sensitive.private.kid, old: sensitive.old.kid };
}

// cria um nova par de chaves RSA e as defini
export async function createRSAKey(): Promise<void> {
  // cria o par de chaves
  const keyPair = await crypto.subtle
    .generateKey(webcrypto.rsa.alg, true, webcrypto.rsa.keyUsages)
    .then(async ({ publicKey, privateKey }) => ({
      public: await crypto.subtle.exportKey(webcrypto.rsa.format, publicKey),
      private: await crypto.subtle.exportKey(webcrypto.rsa.format, privateKey),
    }));

  // muda a chave old
  if (sensitive.private.kid !== '0v') sensitive.old = sensitive.private;

  // soma 1 na versão
  const currentKid = incrementVersion(sensitive.private.kid);

  // defini o novo par de chaves
  sensitive.public = { key: keyPair.public, kid: currentKid };
  sensitive.private = { key: keyPair.private, kid: currentKid };
}
