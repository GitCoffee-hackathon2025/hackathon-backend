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

export interface TypeOccurrenceType {
  id_type_occurrence: number;
  name_type_occurrence: string;
}

export interface OccurrenceDTO {
  content_occurrence: string;
  coordenadas: string;
  date_occurrence: Date;
  id_state: number;
  id_city: number;
  id_neighborhood: number;
  id_type_occurrence: number;
}

export interface UserType {
  id_user: number;
  name: string;
  email: string;
  password: string;
  dateBirth: Date;
  occurrences?: OccurrenceType[];
}

export interface OccurrenceType {
  id_occurrence: number;
  user: UserType;
  type: TypeOccurrenceType;
  id_state: number;
  id_city: number;
  id_neighborhood: number;
  content_occurrence: string;
}