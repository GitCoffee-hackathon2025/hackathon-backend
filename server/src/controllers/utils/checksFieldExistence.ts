// Tipagens
import { type TemplateObject } from '../../templates/general';

// Retorno do erro
import FormatError from '../../errors/FormatError';

function checksFieldExistence(dataObj: Record<string, any>, template: TemplateObject): void {
  Object.entries(template).forEach(([field, props]) => {
    if (props.required) {
      const value = dataObj[field];
      const type = props.type;
      if (!(value instanceof type) && typeof value !== type.name.toLocaleLowerCase())
        throw new FormatError(400, `Campo ${field} é obrigatório`, {
          inputErro: [field.toUpperCase()],
        });
    }
  });
}

export default checksFieldExistence;
