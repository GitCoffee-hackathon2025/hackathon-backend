import { importJWK, type JWK } from 'jose';
import type uuidType from './uuidType';

export const constants = {
  jwa: {
    algRSA: 'RSA-OAEP',
    encAES: 'A256GCM',
    algAES: 'dir',
  },
  webcrypto: {
    aes: {
      alg: {
        name: 'AES-GCM',
        length: 256,
      },
      keyUsages: ['encrypt', 'decrypt'],
    },
  },
} as const;

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

export async function getKey(
  name: keyof typeof sensitive
): Promise<{ key: CryptoKey; version: string }> {
  const returnedKey = {
    key: (await importJWK(sensitive[name].key, constants.jwa.algRSA)) as CryptoKey,
    version: String(sensitive[name].version),
  };
  return returnedKey;
}

let internalToken: uuidType | undefined = undefined;

let version = 0;

export function setKey(
  { publicKey, privateKey }: { publicKey: JWK; privateKey: JWK },
  token: uuidType
) {
  if (!internalToken || internalToken !== token) return;

  if (sensitive.private.version != 0) sensitive.old = sensitive.private;

  version = version + 1;

  sensitive.public = { key: publicKey, version };
  sensitive.private = { key: privateKey, version };
}

export function registerToken(token: uuidType) {
  if (internalToken !== undefined) throw new Error('token already registered');
  internalToken = token;
}
