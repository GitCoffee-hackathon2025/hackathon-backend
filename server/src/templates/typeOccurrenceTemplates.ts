// Tipagens
import { type TemplateObject } from './general';

export const occurrenceTemplate: TemplateObject = {
  id_type_occurrence: { type: Number, required: false },
  name_type_occurrence: { type: Number, required: true },
};

export interface TypeOccurrenceValues {
  id_type_occurrence: number;
  name_type_occurrence: string;
}
