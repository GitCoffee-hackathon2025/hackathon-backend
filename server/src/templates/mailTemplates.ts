export interface MailTable {
  id_mail: number;
  user_id: number;
  type: string;
  random: string;
  expires_at: Date;
}

export interface MailValues {
  id_mail: number;
  user_id: number;
  type: string;
  random: `${number}`;
  expires_at: number;
}
