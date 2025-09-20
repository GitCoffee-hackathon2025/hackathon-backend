export interface TokenTable {
  id_token: number;
  user_id: number;
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
