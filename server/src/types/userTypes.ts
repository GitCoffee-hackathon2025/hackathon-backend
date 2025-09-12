export interface LoginUser {
  email: string;
  password: string;
}

export interface TokenSendOrVerify {
  email: string;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'CHANGE_EMAIL';
  code?: number;
}

export type InputErro = ('EMAIL' | 'PASSWORD' | 'NAME' | 'BIRTHDAY' | 'CODE' | 'SUBMIT' | 'DATE')[];


export interface RecoverPassword {
  email: string;
  password: string;
}

export class CreateUserDTO {
  name!: string;
  email!: string;
  password!: string;
  dateBirth!: Date;
}

export class CreateSessionDTO {
  sessionId!: string;
  userId!: number;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  confirmPassword?: string;
  newPassword?: string;
  dateBirth?: Date;
}
export type UpdateType = 'PASSWORD' | 'EMAIL' | 'NAME' | 'BIRTHDAY';

export type ExtendedUpdateBody = {
  userId: number;
} & {
  data: UpdateUserBody;
  type: UpdateType;
};

export type UpdateUserBodyWithPassword = UpdateUserBody & { password: string };

/////////////

export interface TypeReportType {
  id_type_report: number;
  name_type_report: string;
}

export interface TypeReviewType {
  id_type_review: number;
  name_type_review: string;
}
export interface ReportDTO {
  id_type_report: number;
  id_state: number;
  id_city: number;
  id_neighborhood: number;
  content_report: string;
}

export interface UserType {
  id_user: number;
  name: string;
  email: string;
  password: string;
  dateBirth: Date;
  cep: string;
  tel: string;
  reports?: ReportType[];
}

export interface ReportType {
  id_report: number;
  user: UserType;
  type: TypeReportType;
  id_state: number;
  id_city: number;
  id_neighborhood: number;
  content_report: string;
}