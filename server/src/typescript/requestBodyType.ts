export type Kid = `${number}v`;

export interface RequestBody {
  header: {
    rsa: { alg: string; kid: Kid };
    aes: { enc: string };
  };
  ek: ArrayBuffer;
  iv: Uint8Array<ArrayBuffer>;
  ct: ArrayBuffer;
  tag: ArrayBuffer;
}

export interface DecryptedRequestData {
  data: Record<string, any>;
  browser: {
    auth: {
      string: string;
      number: number;
    };
    connect: ArrayBuffer;
  } | null;
}
