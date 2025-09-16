import OccurrenceRepository from '../repositories/OccurrencesRepository';
import userRepository from '../repositories/UserRepository';
import { OccurrenceEntity } from '../entities/OccurrenceEntities';
import { OccurrenceDTO } from '../types/userTypes';

// Retorno do erro
import FormatError from '../errors/FormatError';

class OccurrenceService {
  private occurrenceRepo: OccurrenceRepository;

  constructor() {
    this.occurrenceRepo = new OccurrenceRepository();
  }

  async register(userId: number, dataOccurrence: OccurrenceDTO) {
    const user = await userRepository.findById(userId);
    if (!user) throw new FormatError(404, 'Usuário não encontrado');

    const typeOccurrence = await this.occurrenceRepo.findTypeById(
      dataOccurrence.id_type_occurrence
    );
    if (!typeOccurrence) throw new FormatError(404, 'Tipo de relatório não encontrado');

    const occurrence = new OccurrenceEntity();
    Object.assign(occurrence, dataOccurrence);
    occurrence.type = typeOccurrence;
    occurrence.coordenadas = dataOccurrence.coordenadas;
    occurrence.content_occurrence = dataOccurrence.content_occurrence;
    occurrence.date_occurrence = dataOccurrence.date_occurrence;
    occurrence.id_neighborhood = dataOccurrence.id_neighborhood;
    occurrence.user = user;

    const saved = await this.occurrenceRepo.save(occurrence);
    return saved;
  }


async getAllOccurrencesCoordenades() {
  const occurrences = await this.occurrenceRepo.getAllOccurrences();

  if (!occurrences || occurrences.length === 0) {
    throw new FormatError(404, 'Não foram encontradas ocorrências');
  }

  const occurrencesCoordenades = occurrences.map((occurrence) => ({
    id_occurrence: occurrence.id_occurrence,
    coordenadas: occurrence.coordenadas,
    type: occurrence.type?.name_type_occurrence, // pega o nome do tipo
  }));

  return occurrencesCoordenades;
}


  async findById(id: number) {
    return this.occurrenceRepo.findById(id);
  }

  async findByNeighborhood(id: number) {
    const occurrences = this.occurrenceRepo.findByNeighborhood(id, 3);
    if (!occurrences) throw new FormatError(404, 'Não foi encontrado ocorrências desse bairro');
    return occurrences;
  }

  async delete(occurrenceId: number, userId: number): Promise<void> {
    const occurrence = await this.occurrenceRepo.findById(occurrenceId);

    if (!occurrence) throw new FormatError(404, 'Ocorrência não encontrada');
    if (occurrence.user.id_user !== userId) {
      throw new FormatError(403, 'Você não tem permissão para deletar este ocorrência');
    }

    if (!(await this.occurrenceRepo.delete(occurrenceId)))
      throw new FormatError(500, 'Falha do servidor ao tentar excluír ocorrência');
  }
}

const occurrenceService = new OccurrenceService();
export default occurrenceService;
