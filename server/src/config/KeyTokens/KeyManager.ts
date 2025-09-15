// Tipagens
import { type FastifyInstance } from 'fastify';
import { type DecodedJwt } from 'fast-jwt';
import { type Kid } from '../../types/requestBodyTypes';

// Configurações
import webcrypto from '../keys/crypto.config';

// Plugins
import fastifyJwt from '@fastify/jwt';

// local que armazena as chaves JWT (NÃO EXPORTAR!)
const sensitive: {
  current: {
    public: string;
    private: string;
    kid: Kid;
  };
  old: {
    public: string;
    private: string;
    kid: Kid;
  };
} = {
  current: {
    public: {} as string,
    private: {} as string,
    kid: '0v',
  },
  old: {
    public: {} as string,
    private: {} as string,
    kid: '0v',
  },
};

let jwt: FastifyInstance['jwt'];
let salt: { current: Uint16Array<ArrayBuffer>; old: Uint16Array<ArrayBuffer> } = {
  current: crypto.getRandomValues(new Uint16Array(5)),
  old: {} as Uint16Array<ArrayBuffer>,
};

// sempre puxe a variavel e não armazene dentro do código
export function usesJwtInstance(): FastifyInstance['jwt'] {
  return jwt;
}

export function usesSaltToken() {
  return { ...salt };
}

// funçãoq que incrementa a versão em 1
function incrementVersion(kid: Kid): Kid {
  // incrementa em 1 o kid
  return `${Number(kid.slice(0, -1)) + 1}v`;
}

export function getVersionKey(): { current: Kid; old: Kid } {
  return {
    current: sensitive.current.kid,
    old: sensitive.old.kid,
  };
}

async function convertKeyToPem(key: CryptoKey, typeKey: 'private' | 'public'): Promise<string> {
  const base64 = Buffer.from(
    await crypto.subtle.exportKey(typeKey === 'private' ? 'pkcs8' : 'spki', key)
  ).toString('base64');
  const lines = base64.match(/.{1,64}/g) || [];

  const typ = typeKey === 'private' ? 'PRIVATE KEY' : 'PUBLIC KEY';
  return `-----BEGIN ${typ}-----\n${lines.join('\n')}\n-----END ${typ}-----`;
}

export async function initJWTService(fastify: FastifyInstance) {
  await fastify.register(fastifyJwt, {
    secret: {
      private: sensitive.current.private,
      public: async (decoded: DecodedJwt) => {
        const kid = decoded.header.kid as Kid;

        if (!kid) throw new Error('Missing kid');

        if (kid === sensitive.current.kid) return sensitive.current.public;
        if (kid === sensitive.old.kid) return sensitive.old.public;

        throw new Error('Unknown kid in JWT header');
      },
    },
    sign: {
      algorithm: webcrypto.jwt.registered,
      kid: sensitive.current.kid,
    },
  });

  jwt = fastify.jwt;
}

// cria um nova par de chaves JWT e as defini
export async function createJWTKey() {
  // criando salt
  salt = {
    old: salt.current,
    current: crypto.getRandomValues(new Uint16Array(5)),
  };
  // cria o par de chaves
  const keyPair = await crypto.subtle
    .generateKey(webcrypto.jwt.alg, true, webcrypto.jwt.keyUsages)
    .then(async ({ privateKey, publicKey }) => ({
      private: await convertKeyToPem(privateKey, 'private'),
      public: await convertKeyToPem(publicKey, 'public'),
    }));

  // muda a chave old
  if (sensitive.current.kid !== '0v') sensitive.old = { ...sensitive.current };

  // soma 1 na versão
  const current = incrementVersion(sensitive.current.kid);

  // defini o novo par de chaves
  sensitive.current.private = keyPair.private;
  sensitive.current.public = keyPair.public;
  sensitive.current.kid = current;
}
