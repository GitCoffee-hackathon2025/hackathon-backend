import tokensConf from '../config/keys/tokens.config';

export type ID = `${number}`;

type typeToken = (typeof tokensConf.types)[keyof typeof tokensConf.types];

export interface TokenPayload {
  id: ID;
  bh: string;
  type: typeToken;
  akid?: string;
  jti: string;
}

export type PairToken = { refresh: string; access: string };
