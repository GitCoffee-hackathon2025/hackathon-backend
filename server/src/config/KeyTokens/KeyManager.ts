import webcrypto from '../keys/crypto.config';

const subtle = crypto.subtle;

// Arquivo responsável por armazenar e gerenciar as tipagens e as chaves de criptografia

type KidKey = `${number}v`;

// local que armazena as chaves JWT (NÃO EXPORTAR!)
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

// retorna somente um JWT escolhida pelo parametro da função
export function getKey(name: keyof typeof sensitive): { key: JsonWebKey; kid: KidKey } {
  return sensitive[name];
}

export function getVersionKey(): { current: KidKey; old: KidKey } {
  return { current: sensitive.private.kid, old: sensitive.old.kid };
}

// cria um nova par de chaves JWT e as defini
export async function createJWTKey() {
  // cria o par de chaves
  const keyPair = await subtle
    .generateKey(webcrypto.jwt.alg, true, webcrypto.jwt.keyUsages)
    .then(async ({ publicKey, privateKey }) => ({
      public: await subtle.exportKey(webcrypto.jwt.format, publicKey),
      private: await subtle.exportKey(webcrypto.jwt.format, privateKey),
    }));

  // muda a chave old
  if (sensitive.private.kid !== '0v') sensitive.old = sensitive.private;

  // soma 1 na versão
  const currentKid = incrementVersion(sensitive.private.kid);

  // defini o novo par de chaves
  sensitive.public = { key: keyPair.public, kid: currentKid };
  sensitive.private = { key: keyPair.private, kid: currentKid };
}
