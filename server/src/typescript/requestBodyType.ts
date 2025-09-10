export type Kid = `${number}v`;

export interface RequestBody {
  header: {
    rsa: { alg: string; kid: Kid };
    aes: { enc: string };
  };
  ek: string;
  iv: string;
  ct: string;
  tag: string;
}

export interface DecryptedRequestData {
  data: Record<string, any>;
  browser: {
    auth: {
      string: string;
      number: number;
    };
    connect: string;
  } | null;
}
