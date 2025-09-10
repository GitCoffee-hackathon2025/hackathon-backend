export type ID = `${number}`;

export type Token = {
  id: ID;
  bh: string;
  akid?: string;
};

export type PairToken = { refresh: string; access: string };
