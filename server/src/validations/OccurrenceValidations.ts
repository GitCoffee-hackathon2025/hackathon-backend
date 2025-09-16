// Retorno de erro
import FormatError from '../errors/FormatError';

const maxDate = new Date(1900, 0, 1);

class OccurrenceValidations {
  public static validDate(date: Date) {
    if (date.getTime())
      throw new FormatError(400, 'Data de aniversário inválida', { inputErro: ['DATE'] });

    if (date > maxDate ? date >= new Date() : false)
      throw new FormatError(400, 'É proíbido que viajantes do tempo usar esse site', {
        inputErro: ['DATE'],
      });
  }

  public static validContent(text: string) {
    const length = text.length;
    if (length < 20)
      throw new FormatError(400, 'Texto muito pequeno', {
        inputErro: ['CONTENT'],
      });
    if (length > 500)
      throw new FormatError(400, 'Texto muito grande', {
        inputErro: ['CONTENT'],
      });
  }
}

export default OccurrenceValidations;
