// Tipagens
import { type RequestBody } from '../typescript/requestBodyType';

// Retorno do erro
import FormatError from '../errors/FormatError';

function validateFormatBody(body: RequestBody): void {
  if (!body.header || !body.ct || !body.ek || !body.iv || !body.tag)
    throw new FormatError(400, 'Invalid body format', 'Body of the body received incomplete');
}

export default validateFormatBody;
