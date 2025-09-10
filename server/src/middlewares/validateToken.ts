// Retorno do erro
import FormatError from '../errors/FormatError';

function validateToken(authorization?: string): void {
  if (!authorization)
    throw new FormatError(401, 'No authorization', 'There is no authorization in the request');

  if (!authorization.startsWith('Bearer '))
    throw new FormatError(400, 'Token without bearer', 'Received token has no bearer');

  const arrayToken = authorization.split(' ');
  if (arrayToken.length !== 2)
    throw new FormatError(401, 'Token invalid', 'Token received with wrong size');

  if (!arrayToken[1]) throw new FormatError(401, 'Not the token', 'No token after bearer');
}

export default validateToken;
