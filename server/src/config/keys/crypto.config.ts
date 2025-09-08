const webcrypto = {
  rsa: {
    format: 'jwk',
    alg: {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' },
    },
    keyUsages: ['encrypt', 'decrypt'],
  },
  aes: {
    format: 'raw',
    alg: { name: 'AES-GCM', modulusLength: 256 },
    enc: 'A256GCM',
    keyUsages: ['encrypt', 'decrypt'],
  },
  jwt: {
    format: 'jwk',
    alg: {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' },
    },
    keyUsages: ['sign', 'verify'],
  },
} as const;

export default webcrypto;
