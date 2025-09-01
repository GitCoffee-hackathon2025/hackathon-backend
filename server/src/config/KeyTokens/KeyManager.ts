import { type FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';

import webcrypto from '../keys/crypto.config';

const subtle = crypto.subtle;

// Arquivo responsável por armazenar e gerenciar as tipagens e as chaves de criptografia

type KidKey = `${number}v`;

// local que armazena as chaves JWT (NÃO EXPORTAR!)
const sensitive: {
  currentKid: {
    public: { key: JsonWebKey; kid: KidKey };
    private: { key: JsonWebKey; kid: KidKey };
  };
  oldKid: {
    public: { key: JsonWebKey; kid: KidKey };
    private: { key: JsonWebKey; kid: KidKey };
  };
} = {
  currentKid: {
    public: { key: {} as JsonWebKey, kid: '0v' },
    private: { key: {} as JsonWebKey, kid: '0v' },
  },
  oldKid: {
    public: { key: {} as JsonWebKey, kid: '0v' },
    private: { key: {} as JsonWebKey, kid: '0v' },
  },
};

let jwt: FastifyInstance['jwt'];
let salt: { current: Uint16Array<ArrayBuffer>; old: Uint16Array<ArrayBuffer> };

// sempre puxe a variavel e não armazene dentro do código
export function usesJwtInstance(): FastifyInstance['jwt'] {
  return jwt;
}

export function usesSaltToken() {
  return { ...salt };
}

// funçãoq que incrementa a versão em 1
function incrementVersion(kid: KidKey): KidKey {
  // incrementa em 1 o kid
  return `${Number(kid.slice(0, -1)) + 1}v`;
}

export function getVersionKey(): { current: KidKey; old: KidKey } {
  return {
    current: sensitive.currentKid.private.kid,
    old: sensitive.oldKid.private.kid,
  };
}

// cria um nova par de chaves JWT e as defini
export async function createJWTKey(fastify: FastifyInstance) {
  // cria o par de chaves
  const keyPair = await subtle
    .generateKey(webcrypto.jwt.alg, true, webcrypto.jwt.keyUsages)
    .then(async ({ publicKey, privateKey }) => ({
      public: await subtle.exportKey(webcrypto.jwt.format, publicKey),
      private: await subtle.exportKey(webcrypto.jwt.format, privateKey),
    }));

  // muda a chave old
  if (sensitive.currentKid.private.kid !== '0v') sensitive.oldKid = sensitive.currentKid;

  // soma 1 na versão
  const currentKid = incrementVersion(sensitive.currentKid.private.kid);

  // defini o novo par de chaves
  sensitive.currentKid.public = { key: keyPair.public, kid: currentKid };
  sensitive.currentKid.private = { key: keyPair.private, kid: currentKid };

  await fastify.register(fastifyJwt as any, {
    ...sensitive,
    kid: sensitive.currentKid.private.kid,
  });

  // declarando os novos valores
  salt = {
    old: salt.current,
    current: crypto.getRandomValues(new Uint16Array(5)),
  };

  jwt = fastify.jwt;
}
