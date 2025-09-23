export interface MailTable {
  id_mail: number;
  id_user: number;
  type: string;
  random: string;
  expires_at: Date;
}

export interface MailValues {
  id_mail: number;
  id_user: number;
  type: string;
  random: `${number}`;
  expires_at: number;
}
