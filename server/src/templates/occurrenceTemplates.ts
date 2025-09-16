// Tipagens
import { type TemplateObject } from './general';
import { type UserValues } from './userTemplates';
import { type TypeOccurrenceValues } from './typeOccurrenceTemplates';

export const occurrenceTemplate: TemplateObject = {
  id_occurrence: { type: Number, required: false },
  user: { type: Number, required: false },
  type: { type: Number, required: true },
  id_state: { type: Number, required: true },
  id_city: { type: Number, required: true },
  id_neighborhood: { type: Number, required: true },
  content_occurrence: { type: String, required: true },
  coordenadas: { type: String, required: true },
  date_occurrence: { type: Date, required: true },
};

export interface OccurrenceType {
  id_occurrence: number;
  user: number;
  type: number;
  id_state: number;
  id_city: number;
  id_neighborhood: number;
  content_occurrence: string;
  coordenadas: string;
  date_occurrence: Date;
}

export interface OccurrenceValues {
  id_occurrence: number;
  user: UserValues;
  type: TypeOccurrenceValues;
  id_state: number;
  id_city: number;
  id_neighborhood: number;
  content_occurrence: string;
}
