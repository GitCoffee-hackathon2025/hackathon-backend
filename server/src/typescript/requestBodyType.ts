interface RequestBody {
  header: {
    rsa: { alg: string; kid: `${number}v` };
    aes: { enc: string };
  };
  ek: ArrayBuffer;
  iv: Uint8Array<ArrayBuffer>;
  ct: ArrayBuffer;
}

export default RequestBody;
