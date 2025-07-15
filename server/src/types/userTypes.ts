
export interface TypeReportType {
  id_type_report: number;
  name_type_report: string;
}

export interface TypeReviewType {
  id_type_review: number;
  name_type_review: string;
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
  reviews?: ReviewType[];
  reportComments?: ReportCommentType[];
  reviewComments?: ReviewCommentType[];
}

export interface ReportCommentType {
  id_report_comment: number;
  content_report_comment: string;
  user: UserType;
  report: ReportType;
}

export interface ReviewCommentType {
  id_review_comment: number;
  content_review_comment: string;
  user: UserType;
  review: ReviewType;
}

export interface ReportType {
  id_report: number;
  user: UserType;
  type: TypeReportType;
  id_state: number;
  id_city: number;
  id_neighborhood: number;
  content_report: string;
  comments?: ReportCommentType[];
}

export interface ReviewType {
  id_review: number;
  user: UserType;
  type: TypeReviewType;
  id_state: number;
  id_city: number;
  id_neighborhood: number;
  content_review: string;
  comments?: ReviewCommentType[];
}