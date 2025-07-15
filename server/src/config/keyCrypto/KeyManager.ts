import { importJWK, type JWK } from 'jose';

export const constants = {
  algRSA: 'RSA-OAEP',
  encAES: 'A256GCM',
  algAES: 'dir',
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
    key: (await importJWK(sensitive[name].key, constants.algRSA)) as CryptoKey,
    version: String(sensitive[name].version),
  };
  return returnedKey;
}

export function setKey({ publicKey, privateKey }: { publicKey: JWK; privateKey: JWK }) {
  if (sensitive.private.version != 0) sensitive.old = sensitive.private;

  sensitive.public = { key: publicKey, version: sensitive.public.version + 1 };
  sensitive.private = { key: privateKey, version: sensitive.private.version + 1 };
}
