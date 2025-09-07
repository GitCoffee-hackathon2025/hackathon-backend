export type ID = `${number}`;

export type Token = {
  id: ID;
  bh: ArrayBuffer;
  akid?: ArrayBuffer;
};