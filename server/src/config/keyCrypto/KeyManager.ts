import { type JWK } from 'jose';

class KeyManagerCrypto {
  protected static keys: { public: JWK; private: JWK; old: JWK } = {
    public: {} as JWK,
    private: {} as JWK,
    old: {} as JWK,
  };
}

export default KeyManagerCrypto;
