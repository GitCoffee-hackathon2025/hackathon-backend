// Tipagens
import { type TemplateObject } from './general';
import { type OccurrenceType } from '../types/userTypes';

export const userTemplate: TemplateObject = {
  id_user: { type: Number, required: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  dateBirth: { type: Date, required: true },
  is_verified: { type: Boolean, required: false },
  occurrences: { type: Array, required: false, elementType: Number },
};

export interface UserValues {
  id_user: number;
  name: string;
  email: string;
  password: string;
  dateBirth: Date;
  is_verified: boolean;
  occurrences?: OccurrenceType[];
}
