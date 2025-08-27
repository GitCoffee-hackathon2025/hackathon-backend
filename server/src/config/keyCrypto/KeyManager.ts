import { subtle } from 'crypto';

import type uuidType from '../../typescript/uuidType';

// Arquivo responsável por armazenar e gerenciar as tipagens e as chaves de criptografia

// exportando as tipagens usadas na criptografia
export const webcrypto = {
  rsa: {
    format: 'jwk',
    alg: { name: 'RSA-OAEP', hash: { name: 'SHA-256' }, length: 2048 },
    keyUsages: ['encrypt', 'decrypt'],
  },
  aes: {
    alg: { name: 'AES-GCM', length: 256 },
    enc: 'A256GCM',
    format: 'raw',
    keyUsages: ['encrypt', 'decrypt'],
  },
} as const;

// local que armazena as chaves RSA (NÃO EXPORTAR!)
const sensitive: {
  public: { key: JsonWebKey; version: `${number}v` };
  private: { key: JsonWebKey; version: `${number}v` };
  old: { key: JsonWebKey; version: `${number}v` };
} = {
  public: {
    key: {} as JsonWebKey,
    version: '0v',
  },
  private: {
    key: {} as JsonWebKey,
    version: '0v',
  },
  old: {
    key: {} as JsonWebKey,
    version: '0v',
  },
};

// retorna somente uma RSA escolhida pelo parametro da função
export async function getKey(
  name: keyof typeof sensitive
): Promise<{ key: CryptoKey; kid: `${number}v` }> {
  return {
    key: await subtle.importKey(
      webcrypto.rsa.format,
      sensitive[name].key,
      webcrypto.rsa.alg.name,
      true,
      name === 'public' ? ['encrypt'] : ['decrypt']
    ),
    kid: sensitive[name].version,
  };
}

// primeiro e único token que o código recebeu.
let internalToken: uuidType | undefined = undefined;

// versão das chaves RSA atuais (simplificação)
let version = 0;

export function getVersionKey(): { current: `${number}v`; old: `${number}v` } {
  return { current: `${version}v`, old: `${version - 1}v` };
}

// registra o primeiro token para poder usar a createKey
export function registerToken(token: uuidType) {
  if (internalToken !== undefined) throw new Error('token already registered');
  internalToken = token;
}

// cria um nova par de chaves RSA e as defini
export async function createKey(token: uuidType) {
  // valida token
  if (!internalToken || internalToken !== token) return;

  // cria o par de chaves
  const keyPair = await crypto.subtle
    .generateKey(
      {
        name: webcrypto.rsa.alg.name,
        modulusLength: webcrypto.rsa.alg.length,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: webcrypto.rsa.alg.hash,
      },
      true,
      webcrypto.rsa.keyUsages
    )
    .then(async ({ publicKey, privateKey }) => ({
      public: await subtle.exportKey(webcrypto.rsa.format, publicKey),
      private: await subtle.exportKey(webcrypto.rsa.format, privateKey),
    }));

  // muda a chave old
  if (sensitive.private.version !== '0v') sensitive.old = sensitive.private;

  // soma 1 na versão
  version = version + 1;

  // defini o novo par de chaves
  sensitive.public = { key: keyPair.public, version: `${version}v` };
  sensitive.private = { key: keyPair.private, version: `${version}v` };
}
