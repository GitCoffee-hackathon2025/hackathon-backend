export interface TokenTable {
  id_token: number;
  id_user: number;
  type: string;
  jti: string;
  browser: string;
  expires_at: number;
}

export interface TokenPayload {
  id: number;
  bh: string;
  type: Uppercase<string>;
  jti: string;
  akid?: string;
}
