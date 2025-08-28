export interface RequestBody {
  header: {
    rsa: { alg: string; kid: `${number}v` };
    aes: { enc: string };
  };
  ek: ArrayBuffer;
  iv: Uint8Array<ArrayBuffer>;
  ct: ArrayBuffer;
  tag: ArrayBuffer;
}

export type DecryptedRequestData = {
  data: Record<string, any>;
  browser: {
    auth: {
      string: string;
      number: number;
    };
    connect: ArrayBuffer;
  } | null;
};
