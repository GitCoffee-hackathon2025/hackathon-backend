export interface VerificationTable {
  id_verification: number;
  user_id: number;
  type: string;
  random: string;
  expires_at: Date;
}

export interface VerificationValues {
  id_verification: number;
  user_id: number;
  type: string;
  random: `${number}`;
  expires_at: number;
}
