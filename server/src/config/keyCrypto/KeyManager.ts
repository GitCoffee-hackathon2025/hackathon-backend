import webcrypto from '../keys/crypto.config';

const subtle = crypto.subtle;

// Arquivo responsável por armazenar e gerenciar as tipagens e as chaves de criptografia

type KidKey = `${number}v`;

// local que armazena as chaves RSA (NÃO EXPORTAR!)
const sensitive: {
  public: { key: JsonWebKey; kid: KidKey };
  private: { key: JsonWebKey; kid: KidKey };
  old: { key: JsonWebKey; kid: KidKey };
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
function incrementVersion(kid: KidKey): KidKey {
  // incrementa em 1 o kid
  return `${Number(kid.slice(0, -1)) + 1}v`;
}

// retorna somente uma RSA escolhida pelo parametro da função
export async function getKey(
  name: keyof typeof sensitive
): Promise<{ key: CryptoKey; kid: KidKey }> {
  return {
    key: await subtle.importKey(
      webcrypto.rsa.format,
      sensitive[name].key,
      webcrypto.rsa.alg.name,
      true,
      name === 'public' ? ['encrypt'] : ['decrypt']
    ),
    kid: sensitive[name].kid,
  };
}

export function getVersionKey(): { current: KidKey; old: KidKey } {
  return { current: sensitive.private.kid, old: sensitive.old.kid };
}

// cria um nova par de chaves RSA e as defini
export async function createKey() {
  // cria o par de chaves
  const keyPair = await subtle
    .generateKey(webcrypto.rsa.alg, true, webcrypto.rsa.keyUsages)
    .then(async ({ publicKey, privateKey }) => ({
      public: await subtle.exportKey(webcrypto.rsa.format, publicKey),
      private: await subtle.exportKey(webcrypto.rsa.format, privateKey),
    }));

  // muda a chave old
  if (sensitive.private.kid !== '0v') sensitive.old = sensitive.private;

  // soma 1 na versão
  const currentKid = incrementVersion(sensitive.private.kid);

  // defini o novo par de chaves
  sensitive.public = { key: keyPair.public, kid: currentKid };
  sensitive.private = { key: keyPair.private, kid: currentKid };
}
