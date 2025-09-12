import { AppDataSource } from '../db/data-source';
import { OccurrenceEntity, TypeOccurrenceEntity } from '../entities/userEntities';

export class OccurrenceRepository {
  private occurrenceRepo = AppDataSource.getRepository(OccurrenceEntity);
  private typeOccurrenceRepo = AppDataSource.getRepository(TypeOccurrenceEntity);

  async findTypeOccurrenceById(id: number): Promise<TypeOccurrenceEntity | null> {
    return this.typeOccurrenceRepo.findOneBy({ id_type_occurrence: id });
  }

  async saveOccurrence(occurrence: OccurrenceEntity): Promise<OccurrenceEntity | null> {
    return this.occurrenceRepo.save(occurrence);
  }

  async findOccurrenceById(id: number): Promise<OccurrenceEntity | null> {
    return this.occurrenceRepo.findOne({
      where: { id_occurrence: id },
      relations: ['user', 'type', 'comments'], // se quiser trazer junto
      select: [
        'id_occurrence',
        'content_occurrence',
        'coordenadas',
        'created_at',
        'id_neighborhood',
        'user',
        'type',
        // "comments"
      ],
    });
  }

  async deleteOccurrence(id: number): Promise<boolean> {
    const result: any = await this.occurrenceRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findOccurrencesByNeighborhood(id: number, limit: number = 3): Promise<OccurrenceEntity[]> {
    return this.occurrenceRepo
      .createQueryBuilder('occurrence')
      .leftJoinAndSelect('occurrence.user', 'user')
      .leftJoinAndSelect('occurrence.type', 'type')
      .where('occurrence.id_neighborhood = :id', { id })
      .orderBy('occurrence.created_at', 'DESC')
      .take(limit)
      .select([
        'occurrence.id_occurrence',
        'occurrence.content_occurrence',
        'occurrence.coordenadas',
        'occurrence.created_at',
        'occurrence.id_neighborhood',
        'user.id_user',
        'user.name',
        'type.id_type_occurrence',
        'type.name_type_occurrence',
      ])
      .getMany();
  }
}
