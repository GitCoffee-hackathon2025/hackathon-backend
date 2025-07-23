import { exportJWK, generateKeyPair, importJWK, type JWK } from 'jose';
import type uuidType from './uuidType';

// Arquivo responsável por armazenar e gerenciar as tipagens e as chaves de criptografia

// exportando as tipagens usadas na criptografia
export const constants = {
  jwa: {
    rsa: { alg: 'RSA-OAEP-256', length: 2048 },
    aes: { alg: 'dir', enc: 'A256GCM' },
  },
  webcrypto: {
    // jwa: {
    //   format: 'jwk',
    //   hash: 'SHA-256',
    // },
    aes: {
      alg: { name: 'AES-GCM', length: 256 },
      format: 'raw',
      keyUsages: ['encrypt', 'decrypt'],
    },
  },
} as const;

// local que armazena as chaves RSA (NÃO EXPORTAR!)
const sensitive: {
  public: { key: JWK; version: number };
  private: { key: JWK; version: number };
  old: { key: JWK; version: number };
} = {
  public: {
    key: {} as JWK,
    version: 0,
  },
  private: {
    key: {} as JWK,
    version: 0,
  },
  old: {
    key: {} as JWK,
    version: 0,
  },
};

// retorna somente uma RSA escolhida pelo parametro da função
export async function getKey(
  name: keyof typeof sensitive
): Promise<{ key: CryptoKey; version: string }> {
  const returnedKey = {
    key: (await importJWK(sensitive[name].key, constants.jwa.rsa.alg)) as CryptoKey,
    version: String(sensitive[name].version),
  };
  return returnedKey;
}

// primeiro e único token que o código recebeu.
let internalToken: uuidType | undefined = undefined;

// versão das chaves RSA atuais (simplificação)
let version = 0;

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
  const newKeys = await generateKeyPair(constants.jwa.rsa.alg, {
    modulusLength: constants.jwa.rsa.length,
    extractable: true,
  }).then(async ({ publicKey, privateKey }) => ({
    public: await exportJWK(publicKey),
    private: await exportJWK(privateKey),
  }));

  // muda a chave old
  if (sensitive.private.version != 0) sensitive.old = sensitive.private;

  // soma 1 na versão
  version = version + 1;

  // defini o novo par de chaves
  sensitive.public = { key: newKeys.public, version };
  sensitive.private = { key: newKeys.private, version };
}
