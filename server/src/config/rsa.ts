// import { generateKeyPair, exportSPKI, exportPKCS8, exportJWK, type JWK } from 'jose';

// type PairKeys = {
//   jwt: { public: string; private: string };
//   crypto: { public: JWK; private: JWK };
// };

// type NameKeys = keyof PairKeys;

// async function generateKeys<T extends NameKeys>(typ: T): Promise<PairKeys[T]> {
//   const typeKeys = typ == 'crypto' ? 'RSA-OAEP' : 'RS256';

//   if (!typeKeys) throw new Error('No exists types keys');

//   const keys = await generateKeyPair(typeKeys, {
//     modulusLength: 2048,
//     extractable: true,
//   });
//   if (typ == 'crypto')
//     return {
//       public: await exportJWK(keys.publicKey),
//       private: await exportJWK(keys.privateKey),
//     } as PairKeys[T];
//   return {
//     public: await exportSPKI(keys.publicKey),
//     private: await exportPKCS8(keys.privateKey),
//   } as PairKeys[T];
// }

// export default generateKeys;
