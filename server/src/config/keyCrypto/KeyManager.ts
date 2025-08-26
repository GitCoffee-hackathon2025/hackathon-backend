import { exportJWK, generateKeyPair, importJWK, type JWK } from 'jose';
import type uuidType from '../../typescript/uuidType';

// Arquivo responsável por armazenar e gerenciar as tipagens e as chaves de criptografia

// exportando as tipagens usadas na criptografia
export const jwa = {
  rsa: { alg: 'RSA-OAEP-256', length: 2048 },
} as const;

export const webcrypto = {
  jwa: {
    format: 'jwk',
    alg: { name: 'RSA-OAEP', hash: { name: 'SHA-256' }, length: 2048 },
    keyUsages: ['encrypt'],
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
  public: { key: JWK; version: `${number}v` };
  private: { key: JWK; version: `${number}v` };
  old: { key: JWK; version: `${number}v` };
} = {
  public: {
    key: {} as JWK,
    version: '0v',
  },
  private: {
    key: {} as JWK,
    version: '0v',
  },
  old: {
    key: {} as JWK,
    version: '0v',
  },
};

// retorna somente uma RSA escolhida pelo parametro da função
export async function getKey(
  name: keyof typeof sensitive
): Promise<{ key: CryptoKey; kid: `${number}v` }> {
  return {
    key: (await importJWK(sensitive[name].key, jwa.rsa.alg)) as CryptoKey,
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
  const newKeys = await generateKeyPair(jwa.rsa.alg, {
    modulusLength: jwa.rsa.length,
    extractable: true,
  }).then(async ({ publicKey, privateKey }) => ({
    public: await exportJWK(publicKey),
    private: await exportJWK(privateKey),
  }));

  // muda a chave old
  if (sensitive.private.version !== '0v') sensitive.old = sensitive.private;

  // soma 1 na versão
  version = version + 1;

  // defini o novo par de chaves
  sensitive.public = { key: newKeys.public, version: `${version}v` };
  sensitive.private = { key: newKeys.private, version: `${version}v` };
}
