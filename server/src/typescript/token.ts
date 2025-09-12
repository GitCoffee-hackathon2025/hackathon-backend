import TokenTypes from '../types/TokenTypes';

export type ID = `${number}`;

type typeToken = (typeof TokenTypes)[keyof typeof TokenTypes];

export type Token = {
  id: ID;
  bh: string;
  type: typeToken;
  akid?: string;
};

export type PairToken = { refresh: string; access: string };
